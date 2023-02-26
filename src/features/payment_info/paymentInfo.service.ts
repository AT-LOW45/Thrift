import { addDoc, collection, getDocs, getFirestore, orderBy, query } from "firebase/firestore";
import { ThriftServiceProvider } from "../../service/thrift";
import {
	GroupAccountSchema,
	PaymentInfo,
	PaymentInfoSchema,
	PersonalAccount,
	PersonalAccountSchema,
} from "./paymentInfo.schema";
import app from "../../firebaseConfig";

interface PaymentInfoServiceProvider extends ThriftServiceProvider<PaymentInfo> {
	getPersonalAccounts(): Promise<PersonalAccount[]>;
}

const firestore = getFirestore(app);

const paymentInfoService: PaymentInfoServiceProvider = {
	readAll: async function () {
		const paymentInfoRef = collection(firestore, "PaymentInfo");
		const paymentInfo = (await getDocs(paymentInfoRef)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as PaymentInfo)
		);
		return paymentInfo;
	},
	find: function (id: string) {
		throw new Error("Function not implemented.");
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
		const accountQuery = query(personalAccountRef, orderBy("type"));
		const personalAccounts = (await getDocs(accountQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as PersonalAccount)
		);
		return personalAccounts;
	},
};

export default paymentInfoService;
