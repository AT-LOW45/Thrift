import {
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import EditableField from "../../components/form/editable/EditableField";
import { useEditable } from "../../context/EditableContext";
import { marketAuxIndustries } from "../../service/marketaux";
import { Profile } from "./profile.schema";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProfileFields = () => {
	const { placeholderFormData, formData } = useEditable<Profile>();
	const { user } = useContext(AuthContext);

	return (
		<Stack spacing={2}>
			<EditableField compact={false}>
				<EditableField.View>
					<Typography variant='regularSubHeading'>{formData.username}</Typography>
				</EditableField.View>
				<EditableField.Edit>
					<TextField
						name='username'
						variant='standard'
						label='Username'
						value={placeholderFormData.username}
					/>
				</EditableField.Edit>
			</EditableField>
			<EditableField compact={false}>
				<EditableField.View>
					<Stack direction='row' spacing={2} alignItems='center'>
						<Typography>Interest:</Typography>
						<Typography>{formData.interest}</Typography>
					</Stack>
				</EditableField.View>
				<EditableField.Edit>
					<FormControl fullWidth variant='standard' sx={{ width: "50%" }}>
						<InputLabel>Interest</InputLabel>
						<Select
							value={placeholderFormData.interest}
							name='interest'
							label='Interest'
							// onChange={handleInputChange}
						>
							{marketAuxIndustries.map((val) => (
								<MenuItem key={val} value={val}>
									{val}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</EditableField.Edit>
			</EditableField>
			<Stack direction='row' alignItems='center' spacing={2}>
				<Typography>Email:</Typography>
				<Typography>{user?.email}</Typography>
			</Stack>
			<Stack direction='row' spacing={2}>
				<Typography>Group</Typography>
				<Typography>{formData.group}</Typography>
			</Stack>
		</Stack>
	);
};

export default ProfileFields;
