import { getAuth } from "firebase/auth";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
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
	validateCategory(category: Category): boolean;
	validatePlanPartial(data: BudgetPlan): boolean;
	validatePlannedPayment(data: PlannedPayment): boolean;
	validateLimit(data: BudgetPlan): boolean;
	getRemainingOverallAmount(
		id: string
	): Promise<Required<Pick<BudgetPlan, "amountLeftCurrency" | "amountLeftPercentage">>>;
	getRemainingCategoryAmount(
		budgetPlanId: string,
		category: ChipOptions
	): Promise<{ amountLeftCurrencyCat: number; amountLeftPercentageCat: number }>;
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const budgetService: BudgetServiceProvider = {
	readAll: async function (): Promise<BudgetPlan[]> {
		const budgetPlanRef = collection(firestore, "BudgetPlan");
		const budgetPlanQuery = query(budgetPlanRef, where("userUid", "==", auth.currentUser?.uid));
		const budgetPlans = (await getDocs(budgetPlanQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as BudgetPlan)
		);
		return budgetPlans;
	},
	find: async function (): Promise<BudgetPlan> {
		throw new Error("function not implemented");
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
		return result.success;
	},
	validatePlanPartial: function (data: BudgetPlan) {
		const PartialBudgetPlanSchema = BudgetPlanSchema.pick({
			name: true,
			note: true,
			renewalTerm: true,
			spendingLimit: true,
		});
		const result = PartialBudgetPlanSchema.safeParse(data);
		return result.success;
	},
	validatePlannedPayment: function (planned: PlannedPayment) {
		const result = PlannedPaymentSchema.safeParse(planned);
		return result.success;
	},
	validateLimit: function (plan: BudgetPlan) {
		return (
			plan.categories[0].spendingLimit + plan.plannedPayments![0].amount < plan.spendingLimit
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
};

export default budgetService;
