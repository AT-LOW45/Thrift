import { getAuth } from "firebase/auth";
import { ZodError } from "zod";
import {
	addDoc,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import app from "../../firebaseConfig";
import { ThriftServiceProvider } from "../../service/thrift";
import { Transaction } from "../transaction/transaction.schema";
import {
	BudgetPlan,
	BudgetPlanSchema,
	Category,
	CategorySchema,
	PlannedPayment,
	PlannedPaymentSchema,
} from "./budget.schema";
import { ChipOptions } from "./components/BudgetChip";

interface BudgetServiceProvider extends ThriftServiceProvider<BudgetPlan> {
	validateCategory(category: Category): true | ZodError<Category>["formErrors"]["fieldErrors"];
	validatePlanPartial(data: BudgetPlan): true | ZodError<BudgetPlan>["formErrors"]["fieldErrors"];
	validatePlannedPayment(data: PlannedPayment): true | ZodError["formErrors"]["fieldErrors"];
	validateLimit(data: BudgetPlan): boolean;
	getRemainingOverallAmount(
		id: string
	): Promise<Required<Pick<BudgetPlan, "amountLeftCurrency" | "amountLeftPercentage">>>;
	getRemainingCategoryAmount(
		budgetPlanId: string,
		category: ChipOptions
	): Promise<{ amountLeftCurrencyCat: number; amountLeftPercentageCat: number }>;
	updateBudgetPlan(budgetPlan: BudgetPlan, fields: Partial<BudgetPlan>): Promise<boolean>;
	addNewBudgets(budgetPlanId: string, newItems: Category[]): Promise<boolean>;
	addNewPlannedPayments(
		budgetPlanId: string,
		newPlannedPayments: PlannedPayment[]
	): Promise<boolean>;
	findMyPlans(): Promise<BudgetPlan[]>;
	closeBudgetPlan(budgetPlanId: string): Promise<void>;
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const budgetService: BudgetServiceProvider = {
	readAll: async function (): Promise<BudgetPlan[]> {
		const budgetPlanRef = collection(firestore, "BudgetPlan");
		const budgetPlanQuery = query(
			budgetPlanRef,
			where("userUid", "==", auth.currentUser?.uid),
			where("isActive", "==", true)
		);
		const budgetPlans = (await getDocs(budgetPlanQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as BudgetPlan)
		);
		return budgetPlans;
	},
	find: async function (id: string): Promise<BudgetPlan> {
		const budgetPlanRef = doc(firestore, "BudgetPlan", id);
		const budgetPlanDoc = await getDoc(budgetPlanRef);
		return { id: budgetPlanDoc.id, ...budgetPlanDoc.data() } as BudgetPlan;
	},
	addDoc: async function (entity: BudgetPlan) {
		const result = BudgetPlanSchema.safeParse(entity);

		if (result.success === true) {
			const budgetPlanRef = collection(firestore, "BudgetPlan");
			const { amountLeftCurrency, amountLeftPercentage, ...rest } = result.data;
			const newPlanRef = await addDoc(budgetPlanRef, {
				...rest,
				userUid: auth.currentUser?.uid,
			});
			return newPlanRef.id;
		} else {
			return false;
		}
	},
	deleteDoc: async () => {},
	validateCategory: function (category: Category) {
		const result = CategorySchema.safeParse(category);

		if (result.success === true) {
			return true;
		} else {
			return result.error.formErrors.fieldErrors;
		}
	},
	validatePlannedPayment: function (planned: PlannedPayment) {
		const result = PlannedPaymentSchema.safeParse(planned);

		if (result.success === true) {
			return true;
		} else {
			return result.error.formErrors.fieldErrors;
		}
	},
	validatePlanPartial: function (data: BudgetPlan) {
		const PartialBudgetPlanSchema = BudgetPlanSchema.pick({
			name: true,
			note: true,
			renewalTerm: true,
			spendingLimit: true,
		});

		const result = PartialBudgetPlanSchema.safeParse(data);

		if (result.success === true) {
			return true;
		} else {
			return result.error.formErrors.fieldErrors;
		}
	},

	validateLimit: function (plan: BudgetPlan) {
		return (
			plan.categories[0].spendingLimit + plan.plannedPayments![0].amount <= plan.spendingLimit
		);
	},
	getRemainingOverallAmount: async function (id: string) {
		const budgetPlanRef = doc(firestore, "BudgetPlan", id);
		const transactionRef = collection(firestore, "Transaction");
		const plan = await getDoc(budgetPlanRef);
		const planCasted = plan.data() as BudgetPlan;
		const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

		const transactionQuery = query(
			transactionRef,
			where("budgetPlanId", "==", plan.id),
			where("transactionDate", ">=", firstDayOfMonth),
			where("transactionDate", "<=", new Date())
		);

		const transactions = (await getDocs(transactionQuery)).docs.map(
			(transaction) => transaction.data() as Transaction
		);

		const plannedPaymentsAmount =
			planCasted.plannedPayments === null
				? 0
				: planCasted.plannedPayments
						.map((planned) => planned.amount)
						.reduce((prev, cur) => prev + cur, 0);

		const amountLeftCurrency =
			planCasted.spendingLimit -
			transactions
				.map((transaction) => transaction.amount)
				.reduce((prev, cur) => prev + cur, 0) -
			plannedPaymentsAmount;

		const amountLeftPercentage = Math.round(
			((planCasted.spendingLimit - amountLeftCurrency) / planCasted.spendingLimit) * 100
		);

		return { amountLeftCurrency, amountLeftPercentage };
	},
	getRemainingCategoryAmount: async function (budgetPlanId: string, category: ChipOptions) {
		const budgetPlanRef = doc(firestore, "BudgetPlan", budgetPlanId);
		const transactionRef = collection(firestore, "Transaction");
		const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

		const transactionQuery = query(
			transactionRef,
			where("budgetPlanId", "==", budgetPlanId),
			where("category", "==", category),
			where("transactionDate", ">=", firstDayOfMonth),
			where("transactionDate", "<=", new Date())
		);

		const budgetPlan = (await getDoc(budgetPlanRef)).data() as BudgetPlan;
		const transactions = (await getDocs(transactionQuery)).docs.map(
			(tra) => tra.data() as Transaction
		);

		const budget = budgetPlan.categories.find((cat) => cat.name === category);
		if (budget) {
			const amountLeftCurrencyCat =
				budget.spendingLimit -
				transactions.map((tra) => tra.amount).reduce((prev, cur) => prev + cur, 0);

			const amountLeftPercentageCat = Math.round(
				((budget.spendingLimit - amountLeftCurrencyCat) / budget.spendingLimit) * 100
			);
			return { amountLeftCurrencyCat, amountLeftPercentageCat };
		} else {
			return { amountLeftCurrencyCat: 0, amountLeftPercentageCat: 0 };
		}
	},
	updateBudgetPlan: async function (budgetPlan: BudgetPlan, fields: Partial<BudgetPlan>) {
		const result = BudgetPlanSchema.safeParse(budgetPlan);

		if (result.success === true) {
			const budgetPlanRef = doc(firestore, "BudgetPlan", budgetPlan.id!);
			await updateDoc(budgetPlanRef, { ...fields });
			return true;
		} else {
			return false;
		}
	},
	addNewBudgets: async function (budgetPlanId: string, newBudgets: Category[]) {
		const budgetPlanRef = doc(firestore, "BudgetPlan", budgetPlanId);
		const result = newBudgets.every(this.validateCategory);
		if (result === true) {
			const idRemoved = newBudgets.map((budgets) => {
				const { id, amountLeftCurrency, amountLeftPercentage, ...rest } = budgets;
				return rest;
			});
			await updateDoc(budgetPlanRef, {
				categories: arrayUnion(...idRemoved),
			});
			return true;
		} else {
			return false;
		}
	},
	findMyPlans: async function () {
		const budgetPlanRef = collection(firestore, "BudgetPlan");
		const budgetPlanQuery = query(budgetPlanRef, where("userUid", "==", auth.currentUser?.uid));
		return (await getDocs(budgetPlanQuery)).docs.map(
			(plan) => ({ id: plan.id, ...plan.data() } as BudgetPlan)
		);
	},
	closeBudgetPlan: async function (budgetPlanId: string) {
		const budgetPlanRef = doc(firestore, "BudgetPlan", budgetPlanId);

		await updateDoc(budgetPlanRef, {
			isActive: false,
		});
	},
	addNewPlannedPayments: async function (
		budgetPlanId: string,
		newPlannedPayments: PlannedPayment[]
	) {
		const budgetPlanRef = doc(firestore, "BudgetPlan", budgetPlanId);
		const result = newPlannedPayments.every(this.validatePlannedPayment);

		if (result === true) {
			const idRemoved = newPlannedPayments.map((planned) => {
				const { id, ...rest } = planned;
				return rest;
			});

			await updateDoc(budgetPlanRef, {
				plannedPayments: arrayUnion(...idRemoved),
			});

			return true;
		} else {
			return false;
		}
	},
};

export default budgetService;
