import { getAuth } from "firebase/auth";
import {
	addDoc,
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
import { Profile } from "../profile/profile.schema";
import { Group, GroupSchema } from "./group.schema";
import profileService from "../profile/profile.service";
import { ZodError } from "zod";
import notificationService from "../notification/notification.service";

interface GroupServiceProvider extends Omit<ThriftServiceProvider<Group>, "readAll"> {
	findMembers(groupId: string): Promise<Profile[]>;
	findAvailableUserProfiles(): Promise<Profile[]>;
	enlistMembers(members: Set<Profile>, groupId: string): Promise<void>;
	validateGroupDetails(group: Group): true | ZodError<Group>["formErrors"]["fieldErrors"];
	leaveGroup(): Promise<void>; // used by group members
	kickMember(userProfile: Profile): Promise<void>; // used by group owners
}

const firestore = getFirestore(app);
const auth = getAuth(app);

const groupService: GroupServiceProvider = {
	find: async function (id: string) {
		const groupRef = doc(firestore, "Group", id);
		const groupDoc = await getDoc(groupRef);
		return { id: groupDoc.id, ...groupDoc.data() } as Group;
	},
	addDoc: async function (group: Group) {
		const result = GroupSchema.safeParse(group);

		if (result.success === true) {
			const groupRef = collection(firestore, "Group");
			const { groupAccount, id, members, ...rest } = result.data;

			const newGroupRef = await addDoc(groupRef, {
				members: Array.from(members),
				...rest,
			});

			return newGroupRef.id;
		} else {
			return false;
		}
	},
	findMembers: async function (groupId: string) {
		const profileRef = collection(firestore, "UserProfile");
		const profileQuery = query(profileRef, where("group", "==", groupId));
		return (await getDocs(profileQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Profile)
		);
	},
	deleteDoc: async function () {},
	findAvailableUserProfiles: async function () {
		const profileRef = collection(firestore, "UserProfile");
		const profileQuery = query(profileRef, where("group", "==", ""));
		const profiles = (await getDocs(profileQuery)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Profile)
		);
		return profiles;
	},
	enlistMembers: async function (members: Set<Profile>, groupId: string) {
		// update the "group" field of each user profile
		[...members].forEach(async (member) => {
			const profileRef = doc(firestore, "UserProfile", member.id!);
			await updateDoc(profileRef, {
				group: groupId,
			});
		});

		const group = await this.find(groupId);

		await notificationService.createMemberJoinTemplate(
			group,
			[...members].map((member) => member.username)
		);
	},
	validateGroupDetails: function (group: Group) {
		const GroupDetailsSchema = GroupSchema.pick({
			name: true,
			spendingLimit: true,
			transactionLimit: true,
		});

		const result = GroupDetailsSchema.safeParse(group);

		if (result.success === true) {
			return true;
		} else {
			return result.error.formErrors.fieldErrors;
		}
	},
	leaveGroup: async function () {
		const foundProfile = await profileService.findProfile(auth.currentUser?.uid!);
		const profileRef = doc(firestore, "UserProfile", foundProfile.id!);
		await updateDoc(profileRef, {
			group: "",
		});
	},
	kickMember: async function (userProfile: Profile) {
		const foundProfile = await profileService.findProfile(userProfile.userUid);
		const profileRef = doc(firestore, "UserProfile", foundProfile.id!);
		await updateDoc(profileRef, {
			group: "",
		});
	},
};

export default groupService;
