import {
	addDoc,
	collection,
	doc,
	getDocs,
	getFirestore,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import app from "../../firebaseConfig";
import { Notification, NotificationSchema } from "./notification.schema";
import { BudgetPlan } from "../budget";
import { getAuth } from "firebase/auth";
import { CrowdFund } from "../community/community.schema";
import { GroupIncome } from "../transaction/transaction.schema";
import { Group } from "../group_planning/group.schema";
import profileService from "../profile/profile.service";
import groupService from "../group_planning/group.service";

type NotificationServiceProvider = {
	createNotification(
		notification: Omit<Notification, "expireAt" | "read" | "dateCreated">
	): Promise<string | boolean>;
	createSpendingAlertTemplate(
		budgetPlan: BudgetPlan,
		amountLeftPercentage: number
	): Promise<string | boolean>;
	createCrowdfundEndTemplate(
		crowdfund: CrowdFund,
		receivingUsers: string[]
	): Promise<string | boolean>;
	createGroupContributionTemplate(
		groupIncome: GroupIncome,
		group: Group
	): Promise<string | boolean>;
	createMemberJoinTemplate(group: Group, newMembers: string[]): Promise<string | boolean>;
	markSelectedAsRead(notificationId: string): Promise<void>;
	markAllAsRead(): Promise<void>;
};

const firestore = getFirestore(app);
const auth = getAuth(app);

const notificationService: NotificationServiceProvider = {
	createNotification: async function (
		notification: Omit<Notification, "expireAt" | "read" | "dateCreated">
	) {
		const result = NotificationSchema.safeParse(notification);

		if (result.success === true) {
			const notificationRef = collection(firestore, "Notification");
			const { id, ...rest } = result.data;
			const newNotification = await addDoc(notificationRef, { ...rest });
			return newNotification.id;
		} else {
			return false;
		}
	},
	createSpendingAlertTemplate: async function (
		budgetPlan: BudgetPlan,
		amountLeftPercentage: number
	) {
		return await this.createNotification({
			sendTo: [auth.currentUser?.uid!],
			title: `Spending alert from ${budgetPlan.name}!`,
			message: `You are at risk of overspending for ${budgetPlan.name}!. Your current spending has reached ${amountLeftPercentage}% of your allocated budget plan amount of RM${budgetPlan.spendingLimit}. Please be mindful of your expenditure for the rest of the month.`,
			type: "budget alert",
		});
	},
	createCrowdfundEndTemplate: async function (crowdfund: CrowdFund, receivingUsers: string[]) {
		return await this.createNotification({
			sendTo: receivingUsers,
			message: `${crowdfund.name} has ended. You will be notified of the repayment period by the initiator soon`,
			title: `${crowdfund.name} concluded`,
			type: "crowdfund alert",
		});
	},
	createGroupContributionTemplate: async function (groupIncome: GroupIncome, group: Group) {
		const contributorProfile = await profileService.findProfile(groupIncome.madeBy);
		const groupMembers = await groupService.findMembers(group.id!);

		return await this.createNotification({
			title: `${contributorProfile.username} contributed to the group`,
			message: `${contributorProfile.username} contributed RM${groupIncome.amount} to the group.`,
			type: "group alert",
			sendTo: groupMembers.map((member) => member.userUid),
		});
	},
	createMemberJoinTemplate: async function (group: Group, newMembers: string[]) {
		const groupMembers = await groupService.findMembers(group.id!);

		return await this.createNotification({
			title: "New members joined the group",
			message: `${newMembers.join(", ")} joined ${group.name}. Let's start saving together!`,
			sendTo: groupMembers.map((member) => member.userUid),
			type: "group alert",
		});
	},
	markSelectedAsRead: async function (notificationId: string) {
		const notificationRef = doc(firestore, "Notification", notificationId);
		await updateDoc(notificationRef, {
			read: true,
		});
	},
	markAllAsRead: async function () {
		const notificationRef = collection(firestore, "Notification");
		const notificationQuery = query(
			notificationRef,
			where("sendTo", "array-contains", auth.currentUser?.uid!)
		);
		const notificationDocRefs = (await getDocs(notificationQuery)).docs.map((doc) => doc.ref);

		await Promise.all(
			notificationDocRefs.map(async (ref) => {
				await updateDoc(ref, {
					read: true,
				});
			})
		);
	},
};

export default notificationService;
