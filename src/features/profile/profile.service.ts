import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import app from "../../firebaseConfig";
import { Profile, ProfileSchema } from "./profile.schema";

interface ProfileServiceProvider {
	addProfile(profile: Profile): Promise<string | boolean>;
	findProfile(userUid: string): Promise<Profile>;
	readAll(): Promise<Profile[]>;
	findProfileByUsername(username: string): Promise<Profile>
}

const firestore = getFirestore(app);

const profileService: ProfileServiceProvider = {
	readAll: async function () {
		const profileRef = collection(firestore, "UserProfile");
		return (await getDocs(profileRef)).docs.map(
			(snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Profile)
		);
	},
	addProfile: async function (profile: Profile) {
		const result = ProfileSchema.safeParse(profile);

		if (result.success === true) {
			const profileRef = collection(firestore, "UserProfile");
			const newProfileRef = await addDoc(profileRef, { ...result.data });
			return newProfileRef.id;
		} else {
			return false;
		}
	},
	findProfile: async function (userUid: string | undefined) {
		const profileRef = collection(firestore, "UserProfile");
		const profileQuery = query(profileRef, where("userUid", "==", userUid));
		const profile = await getDocs(profileQuery);
		return { ...profile.docs[0].data(), id: profile.docs[0].id } as Profile;
	},
	findProfileByUsername: async function(username: string) {
		const profileRef = collection(firestore, "UserProfile")
		const profileQuery = query(profileRef, where("username", "==", username))
		const profile = await getDocs(profileQuery)
		return { ...profile.docs[0].data(), id: profile.docs[0].id } as Profile;
	}
};

export default profileService;
