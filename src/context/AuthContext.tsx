/**
 * Programmer Name: Koh Choon Mun
 * Program: AuthContext.tsx
 * Description: A wrapper component that contains system authentication properties
 * First written: 6/3/2023
 * Edited on: 29/4/2023
 */

import {
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User,
} from "firebase/auth";
import { createContext, ReactNode, useMemo, useState } from "react";
import { PersonalAccount } from "../features/payment_info/paymentInfo.schema";
import paymentInfoService from "../features/payment_info/paymentInfo.service";
import { Profile } from "../features/profile/profile.schema";
import profileService from "../features/profile/profile.service";
import app from "../firebaseConfig";
import { Registration } from "../pages/register/Register";

type AuthProps = { children: ReactNode };

export type AuthContextType = {
	signUpWithEmailAndPassword(registrationInfo: Registration): Promise<string | boolean>;
	login(email: string, password: string): Promise<string | boolean>;
	logout(): Promise<void>;
	user: User | null;
};

export const AuthContext = createContext({} as AuthContextType);
const auth = getAuth(app);

const Auth = ({ children }: AuthProps) => {
	const [user, setUser] = useState<User | null>(null);

	onAuthStateChanged(auth, (currentUser) => setUser(currentUser));

	const signUpWithEmailAndPassword = async (registrationInfo: Registration) => {
		try {
			// create user, then add user profile and payment info
			const { email, password, interest, paymentInfo, username } = registrationInfo;

			const allUsers = await profileService.readAll();
			const usernameRegistered = allUsers.map((user) => user.username).includes(username);

			// the system does not support duplicate usernames
			if (!usernameRegistered) {
				const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

				const profileResult = await profileService.addProfile({
					username,
					interest,
					userUid: userCredentials.user.uid,
					group: "",
				} as Profile);

				const paymentInfoResult = await Promise.all(
					paymentInfo.map(
						async (info) =>
							await paymentInfoService.addDoc({
								...info,
								userUid: userCredentials.user.uid,
							} as PersonalAccount)
					)
				);

				const finalResult =
					typeof profileResult !== "boolean" &&
					paymentInfoResult.every((res) => typeof res !== "boolean");

				return finalResult;
			} else {
				throw new Error(`The username '${username}' has been taken. Please choose another`);
			}
		} catch (exception) {
			return exception instanceof Error ? exception.message : false;
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const userCredentials = await signInWithEmailAndPassword(auth, email, password);
			return userCredentials ? true : false;
		} catch (exception) {
			return exception instanceof Error ? exception.message : false;
		}
	};

	const logout = async () => {
		try {
			await signOut(auth);
		} catch (exception) {
			console.log("unable to sign out");
		}
	};

	const memoizedAuthContext = useMemo(
		() => ({ signUpWithEmailAndPassword, login, logout, user }),
		[user]
	);

	return <AuthContext.Provider value={memoizedAuthContext}>{children}</AuthContext.Provider>;
};

export default Auth;
