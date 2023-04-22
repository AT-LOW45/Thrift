import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Portal,
	Stack,
	Typography,
} from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import { FormDialogProps } from "../../../components/form/FormDialog";
import { Profile } from "../../profile/profile.schema";
import groupService from "../group.service";
import { InfoBar } from "../../../components";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import app from "../../../firebaseConfig";
import { AuthContext } from "../../../context/AuthContext";

type RemoveMemberDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	groupId: string;
};

const firestore = getFirestore(app);

const RemoveMemberDialog = ({ groupId, open, toggleModal }: RemoveMemberDialogProps) => {
	const [userProfiles, setUserProfiles] = useState<Profile[]>([]);
	const {user} = useContext(AuthContext)
	const [confirmRemoveDialogOpen, setConfirmRemoveDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<Profile>();
	const [infoInfoBarOpen, setInfoInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);

	useEffect(() => {
		const getMembers = () => {
			const profileRef = collection(firestore, "UserProfile");
			const profileQuery = query(profileRef, where("group", "==", groupId));
			const profileStream = onSnapshot(profileQuery, (snapshot) => {
				const profiles = snapshot.docs.map(
					(profile) => ({ id: profile.id, ...profile.data() } as Profile)
				);
				setUserProfiles(profiles);
			});
			return profileStream;
		};
		const unsub = getMembers();

		return () => unsub();
	}, []);

	const toggleConfirmRemoveDialog = () => setConfirmRemoveDialogOpen((open) => !open);

	const displayConfirmation = (user: Profile) => {
		setSelectedUser(user);
		toggleConfirmRemoveDialog();
	};

	const hideConfirmation = () => {
		setSelectedUser(undefined);
		toggleConfirmRemoveDialog();
	};

	const removeMember = async () => {
		if (selectedUser) {
			await groupService.kickMember(selectedUser);
			toggleConfirmRemoveDialog();
			setInfoInfoBarOpen(true);
		} else {
			setErrorInfoBarOpen(true);
		}
	};

	return (
		<Fragment>
			<Portal>
				<Dialog open={open} onClose={toggleModal} fullWidth maxWidth='sm'>
					<DialogContent>
						<Stack spacing={2}>
							{userProfiles.map((member) => (
								<Stack direction='row' flexGrow={1} key={member.id} alignItems="center">
									<Box flexBasis='50%'>{member.username}</Box>
									<Box flexBasis='50%'>
										{member.userUid === user?.uid! ? (
											<Typography variant="regularLight">You</Typography>
										) : (
											<Button
												variant='outlined'
												onClick={() => displayConfirmation(member)}
											>
												Remove
											</Button>
										)}
									</Box>
								</Stack>
							))}
						</Stack>
					</DialogContent>
					<DialogActions>
						<Button onClick={toggleModal}>Done</Button>
					</DialogActions>
				</Dialog>
			</Portal>
			<Portal>
				<Dialog open={confirmRemoveDialogOpen} onClose={toggleConfirmRemoveDialog}>
					<DialogTitle>Remove this member?</DialogTitle>
					<DialogContent>
						<DialogContentText>
							You are about to remove {selectedUser?.username} from the group. You can
							reinvite this user in the future if they are not part of any group.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={hideConfirmation}>Cancel</Button>
						<Button onClick={removeMember}>Yes, I'm sure</Button>
					</DialogActions>
				</Dialog>
			</Portal>
			<InfoBar
				infoBarOpen={infoInfoBarOpen}
				setInfoBarOpen={setInfoInfoBarOpen}
				type='info'
				message={`${selectedUser?.userUid} removed`}
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='An error occurred while removing the member. Please try again later'
			/>
		</Fragment>
	);
};

export default RemoveMemberDialog;
