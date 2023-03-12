import { getAuth } from "firebase/auth";
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
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import app from "../../firebaseConfig";
import { ThriftServiceProvider } from "../../service/thrift";
import profileService from "../profile/profile.service";
import transactionService from "../transaction/transaction.service";
import { CrowdFund, CrowdfundSchema, Post, PostSchema } from "./community.schema";
import { Transaction } from "../transaction/transaction.schema";

type OmitThriftServiceProvider = Omit<
	ThriftServiceProvider<Post | CrowdFund>,
	"addDoc" | "readAll"
>;

interface CommunityServiceProvider extends OmitThriftServiceProvider {
	addPost(post: Post, selectedImage?: File): Promise<string | boolean>;
	validateCrowdfund(crowdfund: CrowdFund): boolean;
	initiateCrowdfund(crowdfund: CrowdFund): Promise<string | boolean>;
	contribute(
		userUid: string,
		donation: { accountName: string; accountId: string; amount: number },
		myCrowdfund: CrowdFund
	): Promise<string | boolean>;
	findMyCrowdfund(username: string): Promise<CrowdFund | null>;
}

const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const communityService: CommunityServiceProvider = {
	addPost: async function (post: Post, selectedImage?: File) {
		const result = PostSchema.safeParse(post);
		console.log(post);
		console.log("in process");

		if (result.success === true) {
			const postRef = collection(firestore, "Post");
			const profile = await profileService.findProfile(auth.currentUser?.uid!);

			if (selectedImage) {
				const storageRef = ref(storage, selectedImage.name);
				const upload = await uploadBytes(storageRef, selectedImage);
				const downloadURL = await getDownloadURL(upload.ref);

				const newPostRef = await addDoc(postRef, {
					title: result.data.title,
					body: result.data.body,
					mediaAttachment: downloadURL,
					postedBy: profile.username,
				} as Post);

				return newPostRef.id;
			} else {
				const newPostRef = await addDoc(postRef, {
					...result.data,
					postedBy: profile.username,
				} as Post);

				return newPostRef.id;
			}
		} else {
			return false;
		}
	},
	validateCrowdfund: function (crowdfund: CrowdFund) {
		const PartialCrowdfund = CrowdfundSchema.pick({
			name: true,
			targetAmount: true,
			description: true,
			endDate: true,
		});
		const result = PartialCrowdfund.safeParse(crowdfund);
		return result.success;
	},
	initiateCrowdfund: async function (crowdfund: CrowdFund) {
		const result = CrowdfundSchema.safeParse(crowdfund);

		if (result.success === true) {
			const crowdfundRef = collection(firestore, "Crowdfund");

			const profile = await profileService.findProfile(auth.currentUser?.uid!);

			const newCrowdfundRef = await addDoc(crowdfundRef, {
				...result.data,
				initiator: profile.username,
			} as CrowdFund);

			return newCrowdfundRef.id;
		} else {
			return false;
		}
	},
	findMyCrowdfund: async function (username: string) {
		const crowdfundRef = collection(firestore, "Crowdfund");
		const fundQuery = query(crowdfundRef, where("initiator", "==", username));
		const myCrowdfund = await getDocs(fundQuery);
		return myCrowdfund.docs.length === 0
			? null
			: ({ ...myCrowdfund.docs[0].data(), id: myCrowdfund.docs[0].id } as CrowdFund);
	},
	/**
	 * 1. add contributor to list
	 * 2. add transaction
	 * 3. deduct from account
	 */
	contribute: async function (
		userUid: string,
		donation: { accountName: string; accountId: string; amount: number },
		myCrowdfund: CrowdFund
	) {
		const contributorProfile = await profileService.findProfile(userUid);
		const crowdfundRef = doc(firestore, "Crowdfund", myCrowdfund.id!);

		const crowdfund = (await getDoc(crowdfundRef)).data() as CrowdFund;

		const hasContributed = crowdfund.contributors
			.map((cont) => cont.user)
			.includes(contributorProfile.username);

		if (!hasContributed) {
			await updateDoc(crowdfundRef, {
				contributors: arrayUnion({
					user: contributorProfile.username,
					amount: donation.amount,
				}),
			});
		} else {
			const contributorIndex = crowdfund.contributors.findIndex(
				(cont) => cont.user === contributorProfile.username
			);
			crowdfund.contributors[contributorIndex].amount =
				crowdfund.contributors[contributorIndex].amount + donation.amount;

			await updateDoc(crowdfundRef, {
				contributors: crowdfund.contributors,
			});
		}

		const transaction = {
			labels: new Set(),
			category: "crowdfund",
			transactionDate: new Date(),
			description: `Crowdfund contribution to ${myCrowdfund.name}`,
			amount: donation.amount,
			accountId: donation.accountId,
			accountName: donation.accountName,
		};

		return await transactionService.addDoc(transaction as Transaction);
	},
	deleteDoc: async function () {
		throw new Error("function not implemented");
	},
	find: async function (id: string) {
		throw new Error("function not implemented");
	},
};

export default communityService;
