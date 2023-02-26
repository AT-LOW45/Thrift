import { addDoc, collection, getFirestore } from "firebase/firestore";
import { Profile, ProfileSchema } from "./profile.schema";
import app from "../../firebaseConfig";

interface ProfileServiceProvider {
	addProfile(profile: Profile): Promise<string | boolean>;
}

const firestore = getFirestore(app);

const profileService: ProfileServiceProvider = {
	addProfile: async function (profile: Profile) {
		const result = ProfileSchema.safeParse(profile);

		if (result.success === true) {
			const profileRef = collection(firestore, "UserProfile");
			const newProfileRef = await addDoc(profileRef, result.data);
			return newProfileRef.id;
		} else {
			return false;
		}
	},
};

export default profileService;
