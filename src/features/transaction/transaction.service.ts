import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	DocumentData,
	DocumentReference,
	getDoc,
	getDocs,
	getFirestore,
	limit,
	orderBy,
	query,
	QueryConstraint,
	updateDoc,
	where,
} from "firebase/firestore";
import { ThriftServiceProvider } from "../../service/thrift";
import {
	GroupIncome,
	GroupIncomeSchema,
	GroupTransaction,
	GroupTransactionSchema,
	Income,
	IncomeSchema,
	Transaction,
	TransactionSchema,
} from "./transaction.schema";
import app from "../../firebaseConfig";
import paymentInfoService from "../payment_info/paymentInfo.service";
import { getAuth } from "firebase/auth";
import { ZodError } from "zod";
import { budgetService } from "../budget";
import notificationService from "../notification/notification.service";
import groupService from "../group_planning/group.service";

interface TransactionServiceProvider
	extends Omit<
		ThriftServiceProvider<Transaction | Income>,
		"addDoc" | "readAll" | "find" | "deleteDoc"
	> {
	validateRecordDetails(
		record: Transaction | Income
	): true | ZodError<Transaction | Income>["formErrors"]["fieldErrors"];
	findMostRecentRecord(): Promise<Transaction | Income | null>;
	getMyTransactions(budgetPlanId: string): Promise<Transaction[]>;
	addRecord(record: Transaction | Income): Promise<string | boolean>;
	getGroupTransactions(groupId: string): Promise<GroupTransaction[]>;
	validateGroupRecordDetails(
		record: GroupTransaction | GroupIncome
	): true | ZodError<GroupIncome | GroupTransaction>["formErrors"]["fieldErrors"];
	addGroupTransaction(
		record: GroupTransaction,
		transactionLimit: number
	): Promise<string | boolean>;
	addGroupIncome(record: GroupIncome): Promise<string | boolean>;
	getPendingGroupTransactions(
		groupId: string
	): Promise<{ pendingTransactions: GroupTransaction[]; memberCount: number }>;
	decideTransactionStatus(transactionId: string, decision: boolean): Promise<boolean>;
	getChartSummary(...queryConstraints: QueryConstraint[]): Promise<Transaction[]>;
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const transactionService: TransactionServiceProvider = {
	addRecord: async function (record: Transaction | Income) {
		const result =
			"category" in record
				? TransactionSchema.safeParse(record)
				: IncomeSchema.safeParse(record);

		if (result.success === true) {
			const transactionRef = collection(firestore, "Transaction");
			let newRecordRef: DocumentReference<DocumentData>;

			if ("category" in result.data) {
				const { labels, accountName, budgetPlanName, ...rest } = result.data;
				newRecordRef = await addDoc(transactionRef, {
					labels: Array.from(labels),
					...rest,
				});
			} else {
				const { labels, accountName, ...rest } = result.data;
				newRecordRef = await addDoc(transactionRef, {
					labels: Array.from(labels),
					...rest,
				});
			}

			const transactionMade = await paymentInfoService.updateAmount(
				result.data.amount,
				"category" in record ? "debit" : "credit",
				auth.currentUser?.uid!,
				result.data.accountName!
			);

			if (
				"category" in result.data &&
				result.data.category !== "crowdfund" &&
				transactionMade
			) {
				const budgetPlanId = result.data.budgetPlanId;
				const { amountLeftPercentage } = await budgetService.getRemainingOverallAmount(
					budgetPlanId
				);
				const budgetPlan = await budgetService.find(budgetPlanId);
				if (amountLeftPercentage >= budgetPlan.spendingThreshold) {
					await notificationService.createSpendingAlertTemplate(
						budgetPlan,
						amountLeftPercentage
					);
				}
			}

			return transactionMade ? newRecordRef.id : false;
		} else {
			return false;
		}
	},
	validateRecordDetails: function (record: Transaction | Income) {
		const result =
			"category" in record
				? TransactionSchema.safeParse(record)
				: IncomeSchema.safeParse(record);

		if (result.success === true) {
			return true;
		} else {
			return result.error.formErrors.fieldErrors;
		}
	},
	getMyTransactions: async function (budgetPlanId: string) {
		const personalAccounts = await paymentInfoService.getPersonalAccounts();
		const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

		const recordRef = collection(firestore, "Transaction");
		const recordQuery = query(
			recordRef,
			where("accountId", "in", [...personalAccounts.map((acc) => acc.id)]),
			where("budgetPlanId", "==", budgetPlanId),
			where("transactionDate", ">=", firstDayOfMonth),
			where("transactionDate", "<=", new Date())
		);

		return (await getDocs(recordQuery)).docs.map(
			(transac) => ({ id: transac.id, ...transac.data() } as Transaction)
		);
	},
	getGroupTransactions: async function (groupId: string) {
		const transactionRef = collection(firestore, "GroupTransaction");
		const transactionQuery = query(
			transactionRef,
			where("groupId", "==", groupId),
			limit(3),
			orderBy("transactionDate", "desc")
		);
		return (await getDocs(transactionQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as GroupTransaction)
		);
	},
	validateGroupRecordDetails: function (record: GroupTransaction | GroupIncome) {
		const result =
			"status" in record
				? GroupTransactionSchema.safeParse(record)
				: GroupIncomeSchema.safeParse(record);

		return result.success === true ? true : result.error.formErrors.fieldErrors;
	},
	addGroupTransaction: async function (record: GroupTransaction, transactionLimit: number) {
		const result = GroupTransactionSchema.safeParse(record);

		if (result.success === true) {
			const transactionRef = collection(firestore, "GroupTransaction");

			if (result.data.amount > transactionLimit) {
				result.data.status = false;
			}

			const { labels, groupName, ...rest } = result.data;
			const newGroupRecordRef = await addDoc(transactionRef, {
				labels: Array.from(labels),
				...rest,
			});

			const transactionMade =
				result.data.amount > transactionLimit
					? true
					: await paymentInfoService.updateGroupAmount(
							result.data.amount,
							"debit",
							result.data.groupId
					  );
			return transactionMade ? newGroupRecordRef.id : false;
		} else {
			return false;
		}
	},
	addGroupIncome: async function (record: GroupIncome) {
		const result = GroupIncomeSchema.safeParse(record);

		if (result.success === true) {
			const groupTransactionRef = collection(firestore, "GroupTransaction");

			const { labels, groupName, ...rest } = result.data;
			const newGroupRecordRef = await addDoc(groupTransactionRef, {
				labels: Array.from(labels),
				...rest,
			});

			const group = await groupService.find(record.groupId);

			const contributionNotificationResult =
				await notificationService.createGroupContributionTemplate(result.data, group);

			const transactionMade = await paymentInfoService.updateGroupAmount(
				result.data.amount,
				"credit",
				result.data.groupId
			);

			return transactionMade ? newGroupRecordRef.id : false;
		} else {
			return false;
		}
	},
	getPendingGroupTransactions: async function (groupId: string) {
		const groupTransacRef = collection(firestore, "GroupTransaction");
		const groupTransacQuery = query(
			groupTransacRef,
			where("groupId", "==", groupId),
			where("status", "==", false)
		);

		const pendingTransactions = (await getDocs(groupTransacQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as GroupTransaction)
		);

		const members = pendingTransactions.map((transac) => transac.madeBy);
		const uniqueMembers = new Set(members);

		return { pendingTransactions, memberCount: uniqueMembers.size };
	},
	decideTransactionStatus: async function (transactionId: string, decision: boolean) {
		const groupTransactionRef = doc(firestore, "GroupTransaction", transactionId);
		const selectedTransactionDoc = await getDoc(groupTransactionRef);
		const selectedTransaction = {
			id: selectedTransactionDoc.id,
			...selectedTransactionDoc.data(),
		} as GroupTransaction;

		decision === true
			? await updateDoc(groupTransactionRef, {
					status: true,
			  })
			: await deleteDoc(groupTransactionRef);

		const transactionMade =
			decision === true
				? await paymentInfoService.updateGroupAmount(
						selectedTransaction.amount,
						"debit",
						selectedTransaction.groupId
				  )
				: true;

		await notificationService.createGroupTransactionUpdateTemplate(
			selectedTransaction,
			decision
		);

		return transactionMade;
	},
	getChartSummary: async function (...queryConstraints: QueryConstraint[]) {
		const recordRef = collection(firestore, "Transaction");
		const recordQuery = query(recordRef, ...queryConstraints);

		const isTransaction = (record: object): record is Transaction => "budgetPlanId" in record;

		const records = (await getDocs(recordQuery)).docs
			.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Transaction | Income))
			.filter(isTransaction);

		return records;
	},
	findMostRecentRecord: async function () {
		const personalAccounts = await paymentInfoService.getPersonalAccounts();
		const recordRef = collection(firestore, "Transaction");
		const recordQuery = query(
			recordRef,
			where("accountId", "in", [...personalAccounts.map((acc) => acc.id)]),
			orderBy("transactionDate", "desc"),
			limit(1)
		);

		const recordDoc = (await getDocs(recordQuery)).docs;
		if (recordDoc.length === 0) {
			return null;
		} else {
			return { id: recordDoc[0].id, ...recordDoc[0].data() } as Transaction | Income;
		}
	},
};

export default transactionService;
