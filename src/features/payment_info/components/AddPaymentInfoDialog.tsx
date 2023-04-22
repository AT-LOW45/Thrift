import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
} from "@mui/material";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import {
	PersonalAccount,
	PersonalAccountSchemaDefaults,
	accountTypes,
} from "../paymentInfo.schema";
import { ChangeEvent, Fragment, useContext, useState } from "react";
import { ZodError } from "zod";
import paymentInfoService from "../paymentInfo.service";
import { AuthContext } from "../../../context/AuthContext";
import { InfoBar } from "../../../components";

type AddPaymentInfoDialogProps = Pick<FormDialogProps, "open" | "toggleModal">;

const AddPaymentInfoDialog = ({ open, toggleModal }: AddPaymentInfoDialogProps) => {
	const { user } = useContext(AuthContext);
	const [personalAccount, setPersonalAccount] = useState<PersonalAccount>(
		PersonalAccountSchemaDefaults.parse({})
	);
	const [isValid, setIsValid] = useState(false);
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [newPaymentInfoId, setNewPaymentInfoId] = useState("");
	const [errorMessages, setErrorMessages] =
		useState<ZodError<PersonalAccount>["formErrors"]["fieldErrors"]>();

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
	) => {
		setPersonalAccount((acc) => {
			const value =
				event.target.name === "balance" ? parseInt(event.target.value) : event.target.value;
			const updated = { ...acc, [event.target.name]: value };
			const result = paymentInfoService.validatePersonalAccount(updated);

			if (result === true) {
				setErrorMessages(undefined);
				setIsValid(true);
			} else {
				setErrorMessages(result);
				setIsValid(false);
			}

			return updated;
		});
	};

	const addPaymentInfo = async () => {
		personalAccount.userUid = user?.uid!;

		const result = await paymentInfoService.addDoc(personalAccount);
		if (typeof result === "string") {
			toggleModal();
			setPersonalAccount(PersonalAccountSchemaDefaults.parse({}));
			setNewPaymentInfoId(result);
			setSuccessInfoBarOpen(true);
		} else {
			setErrorInfoBarOpen(true);
		}
	};

	return (
		<Fragment>
			<FormDialog
				title='Add Payment Info'
				toggleModal={() => {
					toggleModal();
					setPersonalAccount(PersonalAccountSchemaDefaults.parse({}));
				}}
				open={open}
				actions={[
					<Button
						key={1}
						onClick={() => {
							toggleModal();
							setPersonalAccount(PersonalAccountSchemaDefaults.parse({}));
						}}
					>
						Cancel
					</Button>,
					<Button key={2} disabled={!isValid} onClick={addPaymentInfo}>
						Finish
					</Button>,
				]}
			>
				<Stack spacing={4}>
					<TextField
						name='name'
						value={personalAccount.name}
						label='Account name'
						helperText={errorMessages?.name ? errorMessages.name : ""}
						onChange={handleInputChange}
					/>
					<TextField
						name='balance'
						value={isNaN(personalAccount.balance) ? "" : personalAccount.balance}
						label='Initial balance'
						helperText={errorMessages?.balance ? errorMessages.balance : ""}
						onChange={handleInputChange}
					/>
					<FormControl fullWidth variant='standard' sx={{ flexBasis: "40%" }}>
						<InputLabel>Account Type</InputLabel>
						<Select
							value={personalAccount.type}
							name='type'
							label='Account type'
							onChange={handleInputChange}
						>
							{accountTypes.map((val) => (
								<MenuItem key={val} value={val}>
									{val}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</FormDialog>
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				type='success'
				message={`Added payment info with ID ${newPaymentInfoId}`}
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='Unable to create payment info. Please try again later'
			/>
		</Fragment>
	);
};

export default AddPaymentInfoDialog;
