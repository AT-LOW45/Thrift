import { useState, useEffect, SyntheticEvent, ChangeEvent } from "react";
import { Profile } from "../../profile/profile.schema";
import groupService from "../group.service";

const useAddMember = (modalOpen: boolean, toggleModal: () => void, groupId: string) => {
	const [allAvailableProfiles, setAllAvailableProfiles] = useState<Set<Profile>>(new Set());
	const [username, setUsername] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<Set<Profile>>(new Set());

	useEffect(() => {
		const getProfiles = async () => {
			const profiles = await groupService.findAvailableUserProfiles();
			setAllAvailableProfiles(new Set(profiles));
		};
		getProfiles();
	}, [modalOpen]);

	const handleUsernameChange = (event: SyntheticEvent<Element, Event>, value: string) =>
		setUsername(value);

	const handleSoloUsernameChange = (event: ChangeEvent<HTMLInputElement>) =>
		setUsername(event.target.value);

	const addUserToList = () => {
		const hasUser = [...selectedUsers].map((user) => user.username).includes(username);
		const userExists = [...allAvailableProfiles]
			.map((profile) => profile.username)
			.includes(username);
		if (!hasUser && userExists) {
			setSelectedUsers((prevUsers) => {
				const foundProfile = [...allAvailableProfiles].find(
					(profile) => profile.username === username
				);
				const newUsers = new Set(prevUsers);
				newUsers.add(foundProfile!);

				setAllAvailableProfiles((prevProfiles) => {
					const newProfiles = new Set(prevProfiles);
					newProfiles.delete(foundProfile!);
					return newProfiles;
				});

				return newUsers;
			});
			setUsername("");
		}
	};

	const removeUserFromList = (username: string) => {
		const foundUser = [...selectedUsers].find((user) => user.username === username);
		setSelectedUsers((prevUsers) => {
			const updatedUserList = new Set(prevUsers);
			updatedUserList.delete(foundUser!);

			setAllAvailableProfiles((prevProfiles) => {
				const updatedProfileList = new Set(prevProfiles);
				updatedProfileList.add(foundUser!);
				return updatedProfileList;
			});

			return updatedUserList;
		});
	};

	const enlistMembers = async () => {
		try {
			await groupService.enlistMembers(selectedUsers, groupId);
            toggleModal()
		} catch (ex) {
			console.log("error while enlisting");
		}
	};

	return {
		allAvailableProfiles,
		username,
		selectedUsers,
		handleUsernameChange,
		handleSoloUsernameChange,
		addUserToList,
		removeUserFromList,
		enlistMembers,
		setSelectedUsers,
	};
};

export default useAddMember;
