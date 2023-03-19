import { addDoc, collection, DocumentData, DocumentReference, getDocs, getFirestore, query, where } from "firebase/firestore";
import { ThriftServiceProvider } from "../../service/thrift";
import { Income, IncomeSchema, Transaction, TransactionSchema } from "./transaction.schema";
import app from "../../firebaseConfig";
import paymentInfoService from "../payment_info/paymentInfo.service";
import { getAuth } from "firebase/auth";

interface TransactionServiceProvider extends Omit<ThriftServiceProvider<Transaction | Income>, "addDoc"> {
	validateRecordDetails(record: Transaction | Income): boolean;
	getMyTransactions(budgetPlanId: string): Promise<Transaction[]>;
	addRecord(record: Transaction | Income): Promise<string | boolean>;
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const transactionService: TransactionServiceProvider = {
	readAll: async function (): Promise<Transaction[]> {
		throw new Error("not implemented");
	},
	find: async function (id: string): Promise<Transaction> {
		throw new Error("not implemented");
	},
	addRecord: async function (record: Transaction | Income) {
		const result =
			"category" in record
				? TransactionSchema.safeParse(record)
				: IncomeSchema.safeParse(record);

		if (result.success === true) {
			const transactionRef = collection(firestore, "Transaction");
			let newRecordRef: DocumentReference<DocumentData>

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

			return transactionMade ? newRecordRef.id : false;
		} else {
			return false;
		}
	},
	deleteDoc: async function (id: string): Promise<void> {},
	validateRecordDetails: function (record: Transaction | Income) {
		const result =
			"category" in record
				? TransactionSchema.safeParse(record)
				: IncomeSchema.safeParse(record);

		return result.success;
	},
	getMyTransactions: async function (budgetPlanId: string) {
		const personalAccounts = await paymentInfoService.getPersonalAccounts();

		const recordRef = collection(firestore, "Transaction");
		const recordQuery = query(
			recordRef,
			where("accountId", "in", [...personalAccounts.map((acc) => acc.id)]),
			where("budgetPlanId", "==", budgetPlanId)
		);

		return (await getDocs(recordQuery)).docs.map(
			(transac) => ({ id: transac.id, ...transac.data() } as Transaction)
		);
	},
};

export default transactionService;
