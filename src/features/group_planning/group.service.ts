import {
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import { ThriftServiceProvider } from "../../service/thrift";
import { Group } from "./group.schema";
import app from "../../firebaseConfig";
import { Profile } from "../profile/profile.schema";

interface GroupServiceProvider extends Omit<ThriftServiceProvider<Group>, "readAll"> {
	findMembers(groupId: string): Promise<Profile[]>;
	findAvailableUserProfiles(): Promise<Profile[]>;
	enlistMembers(members: Set<Profile>, groupId: string): Promise<void>;
}

const firestore = getFirestore(app);

const groupService: GroupServiceProvider = {
	find: async function (id: string) {
		const groupRef = doc(firestore, "Group", id);
		const groupDoc = await getDoc(groupRef);
		return { id: groupDoc.id, ...groupDoc.data() } as Group;
	},
	addDoc: async function (group: Group) {
		throw new Error("function not implemented");
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
	},
};

export default groupService;
