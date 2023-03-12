import { addDoc, collection, getFirestore } from "firebase/firestore";
import { ThriftServiceProvider } from "../../service/thrift";
import { Income, IncomeSchema, Transaction, TransactionSchema } from "./transaction.schema";
import app from "../../firebaseConfig";
import paymentInfoService from "../payment_info/paymentInfo.service";
import { getAuth } from "firebase/auth";

interface TransactionServiceProvider extends ThriftServiceProvider<Transaction | Income> {
	validateRecordDetails(record: Transaction | Income): boolean;
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
	addDoc: async function (entity: Transaction | Income) {
		const result =
			"category" in entity
				? TransactionSchema.safeParse(entity)
				: IncomeSchema.safeParse(entity);

		if (result.success === true) {
			const transactionRef = collection(firestore, "Transaction");
			const { labels, ...rest } = result.data;
			const newRecordRef = await addDoc(transactionRef, {
				labels: Array.from(labels),
				...rest,
			});

			const transactionMade = await paymentInfoService.updateAmount(
				result.data.amount,
				"category" in entity ? "debit" : "credit",
				auth.currentUser?.uid!,
				entity.accountName
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
};

export default transactionService;
