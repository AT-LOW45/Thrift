import ClearIcon from "@mui/icons-material/Clear";
import {
	Autocomplete,
	Avatar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Portal,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { FormDialogProps } from "../../../components/form/FormDialog";
import useAddMember from "../hooks/useAddMember";

type AddMemberDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	groupId: string
};

const AddMemberDialog = ({ open, toggleModal, groupId }: AddMemberDialogProps) => {
	const {
		addUserToList,
		allAvailableProfiles,
		enlistMembers,
		handleSoloUsernameChange,
		handleUsernameChange,
		removeUserFromList,
		selectedUsers,
		username,
		setSelectedUsers,
	} = useAddMember(open, toggleModal, groupId);

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth maxWidth='sm'>
				<DialogContent sx={{ px: 6 }} dividers>
					<Stack spacing={3}>
						<Stack direction='row' spacing={2} alignItems='center' width='100%'>
							<Autocomplete
								autoComplete
								sx={{ flexGrow: 1 }}
								value={username}
								id='combo-box-demo'
								disableClearable
								freeSolo
								onChange={handleUsernameChange}
								options={[...allAvailableProfiles].map(
									(profile) => profile.username
								)}
								renderInput={(params) => (
									<TextField
										{...params}
										onChange={handleSoloUsernameChange}
										helperText='start typing and see users appear'
										InputProps={{
											...params.InputProps,
											type: "search",
										}}
									/>
								)}
							/>
							<Button color='tertiary' onClick={addUserToList}>
								Add
							</Button>
						</Stack>
						<Stack maxHeight='400px' overflow='auto' direction='row' flexWrap='wrap'>
							{[...selectedUsers].map((user, index) => (
								<Stack
									direction='row'
									flexBasis='50%'
									spacing={1}
									py={1}
									alignItems='center'
									justifyContent='center'
									key={user.id}
								>
									<Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
									<Typography>{user.username}</Typography>
									<IconButton onClick={() => removeUserFromList(user.username)}>
										<ClearIcon />
									</IconButton>
								</Stack>
							))}
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							toggleModal();
							setSelectedUsers(new Set());
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={enlistMembers}
						disabled={selectedUsers.size === 0 ? true : false}
					>
						Finish
					</Button>
				</DialogActions>
			</Dialog>
		</Portal>
	);
};

export default AddMemberDialog;
