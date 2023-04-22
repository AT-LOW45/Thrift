import {
	DialogContentText,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import {
	ChangeEvent,
	Dispatch,
	FocusEvent,
	Fragment,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { GroupAccount, PersonalAccount } from "../../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../../payment_info/paymentInfo.service";
import { Group } from "../../group.schema";
import { ZodError } from "zod";

type GroupAccountSetupProps = {
	personalAccounts: PersonalAccount[];
	selectedAccount: PersonalAccount | undefined;
	setSelectedAccount: Dispatch<SetStateAction<PersonalAccount | undefined>>;
};

const GroupAccountSetup = ({
	personalAccounts,
	selectedAccount,
	setSelectedAccount,
}: GroupAccountSetupProps) => {
	const { formData, updateContext } = useMultiStep<Group>();
	const [errorMessages, setErrorMessages] =
		useState<ZodError<GroupAccount>["formErrors"]["fieldErrors"]>();
	const [insufficientAmountError, setInsufficientAmountError] = useState<string>();

	const handleAccountChange = (event: SelectChangeEvent) => {
		const foundAccount = personalAccounts.find((acc) => acc.name === event.target.value);
		setSelectedAccount(foundAccount);
	};

	const validateState = (groupAccount: GroupAccount) => {
		const result = paymentInfoService.validateGroupAccount(groupAccount);

		if (result === true) {
			setErrorMessages(undefined);
			return true;
		} else {
			setErrorMessages(result);
			return false;
		}
	};

	const validateAmount = (groupAccount: GroupAccount) => {
		if (selectedAccount) {
			if (isNaN(groupAccount.balance)) {
				return false;
			} else {
				if (groupAccount.balance <= selectedAccount.balance) {
					setInsufficientAmountError(undefined);
					return true;
				} else {
					setInsufficientAmountError(
						"Your personal account balance is insufficient for this initial funding"
					);
					return false;
				}
			}
		} else {
			return false;
		}
	};

	// also validate when selected account changes
	useEffect(() => {
		updateContext({ key: "groupAccount", value: formData.groupAccount }, (group) => [
			validateState(group.groupAccount),
			validateAmount(group.groupAccount),
		]);
	}, [selectedAccount]);

	const handleGroupAccountChange = (
		event:
			| ChangeEvent<HTMLInputElement>
			| FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
	) => {
		const updated =
			event.target.name === "balance"
				? { ...formData.groupAccount, balance: parseInt(event.target.value) }
				: { ...formData.groupAccount, name: event.target.value };
		updateContext({ key: "groupAccount", value: updated }, (group) => [
			validateState(group.groupAccount),
			validateAmount(group.groupAccount),
		]);
	};

	return (
		<Fragment>
			<DialogContentText>
				Next, set up a account that manages all transactions made by group members (yourself
				included)
			</DialogContentText>
			<TextField
				autoFocus
				sx={{ minWidth: "50%" }}
				label='Account name'
				value={formData.groupAccount.name}
				onChange={handleGroupAccountChange}
				name='name'
				helperText={errorMessages?.name ? errorMessages.name : ""}
				required
				variant='standard'
			/>
			{/* add personal account selection */}
			<Stack direction='row' spacing={2} alignItems='center' width='50%'>
				<FormControl variant='standard' sx={{ width: "50%" }}>
					<InputLabel id='account'>Account</InputLabel>
					<Select
						labelId='account'
						value={selectedAccount ? selectedAccount.name : ""}
						name='accountName'
						onChange={handleAccountChange}
						label='Account'
					>
						{personalAccounts.map((acc) => (
							<MenuItem value={acc.name} key={acc.id}>
								{acc.name}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>
						Configure your group account with an initial balance. This amount will be
						deducted from one of your personal accounts
					</FormHelperText>
				</FormControl>
				<Typography variant='numberHeading'>
					Balance: RM {selectedAccount ? selectedAccount.balance : "--"}
				</Typography>
			</Stack>
			<TextField
				sx={{ minWidth: "50%" }}
				label='Initial balance'
				helperText={errorMessages?.balance ? errorMessages.balance : ""}
				name='balance'
				required
				type='number'
				value={isNaN(formData.groupAccount.balance) ? "" : formData.groupAccount.balance}
				onChange={handleGroupAccountChange}
				variant='standard'
			/>
			{insufficientAmountError && (
				<Typography variant='regularLight'>{insufficientAmountError}</Typography>
			)}
		</Fragment>
	);
};

export default GroupAccountSetup;
