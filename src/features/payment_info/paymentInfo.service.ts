import { getAuth } from "firebase/auth";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import app from "../../firebaseConfig";
import { ThriftServiceProvider } from "../../service/thrift";
import {
	GroupAccount,
	GroupAccountSchema,
	PaymentInfo,
	PersonalAccount,
	PersonalAccountSchema,
} from "./paymentInfo.schema";

interface PaymentInfoServiceProvider extends ThriftServiceProvider<PaymentInfo> {
	getPersonalAccounts(): Promise<PersonalAccount[]>;
	updateAmount(
		amount: number,
		transactionType: "credit" | "debit",
		userUid: string,
		accountName: string
	): Promise<boolean>;
	getGroupAccount(groupId: string): Promise<GroupAccount>;
	updateGroupAmount(
		amount: number,
		transactionType: "credit" | "debit",
		groupId: string
	): Promise<boolean>;
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const paymentInfoService: PaymentInfoServiceProvider = {
	readAll: async function () {
		const paymentInfoRef = collection(firestore, "PaymentInfo");
		const paymentInfo = (await getDocs(paymentInfoRef)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as PaymentInfo)
		);
		return paymentInfo;
	},
	find: async function (id: string) {
		const paymentInfoRef = doc(firestore, "PaymentInfo", id);
		const paymentInfoDoc = await getDoc(paymentInfoRef);
		return { id: paymentInfoDoc.id, ...paymentInfoDoc.data() } as PersonalAccount;
	},
	addDoc: async function (entity: PaymentInfo): Promise<string | false> {
		const result =
			"userUid" in entity
				? PersonalAccountSchema.safeParse(entity)
				: GroupAccountSchema.safeParse(entity);

		if (result.success === true) {
			const paymentInfoRef = collection(firestore, "PaymentInfo");
			const { id, ...rest } = result.data;
			const newPaymentInfoRef = await addDoc(paymentInfoRef, rest);
			return newPaymentInfoRef.id;
		} else {
			return false;
		}
	},
	deleteDoc: function (id: string): Promise<void> {
		throw new Error("Function not implemented.");
	},
	getPersonalAccounts: async function () {
		const personalAccountRef = collection(firestore, "PaymentInfo");
		const accountQuery = query(
			personalAccountRef,
			orderBy("type"),
			where("userUid", "==", auth.currentUser?.uid)
		);
		const personalAccounts = (await getDocs(accountQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as PersonalAccount)
		);
		return personalAccounts;
	},
	updateAmount: async function (
		amount: number,
		transactionType: "credit" | "debit",
		userUid: string,
		accountName: string
	) {
		const paymentInfoRef = collection(firestore, "PaymentInfo");
		const paymentInfoQuery = query(
			paymentInfoRef,
			where("userUid", "==", userUid),
			where("name", "==", accountName)
		);

		const paymentInfoDoc = (await getDocs(paymentInfoQuery)).docs[0];
		const paymentInfo = paymentInfoDoc.data() as PersonalAccount;

		if (transactionType === "credit") {
			await updateDoc(paymentInfoDoc.ref, {
				balance: paymentInfo.balance + amount,
			});
			return true;
		} else {
			const isBalanceEnough = paymentInfo.balance - amount >= 0;

			if (isBalanceEnough) {
				await updateDoc(paymentInfoDoc.ref, {
					balance: paymentInfo.balance - amount,
				});
				return true;
			} else {
				return false;
			}
		}
	},
	getGroupAccount: async function (groupId: string) {
		const accountRef = collection(firestore, "PaymentInfo");
		const accountQuery = query(accountRef, where("groupId", "==", groupId));
		const accountDoc = (await getDocs(accountQuery)).docs[0];
		return { id: accountDoc.id, ...accountDoc.data() } as GroupAccount;
	},
	updateGroupAmount: async function (
		amount: number,
		transactionType: "credit" | "debit",
		groupId: string
	) {
		const paymentInfoRef = collection(firestore, "PaymentInfo");
		const paymentInfoQuery = query(paymentInfoRef, where("groupId", "==", groupId));

		const paymentInfoDoc = (await getDocs(paymentInfoQuery)).docs[0];
		const groupAccount = paymentInfoDoc.data() as GroupAccount;

		if (transactionType === "credit") {
			await updateDoc(paymentInfoDoc.ref, {
				balance: groupAccount.balance + amount,
			});
			return true;
		} else {
			const isBalanceEnough = groupAccount.balance - amount >= 0;

			if (isBalanceEnough) {
				await updateDoc(paymentInfoDoc.ref, {
					balance: groupAccount.balance - amount,
				});
				return true;
			} else {
				return false;
			}
		}
	},
};

export default paymentInfoService;
