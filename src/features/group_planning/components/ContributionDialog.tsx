import {
	Autocomplete,
	Button,
	Chip,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Fragment } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { Group } from "../group.schema";
import useGroupContribution from "../hooks/useGroupContribution";

type ContributionDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	group: Group;
};

const ContributionDialog = ({ open, toggleModal, group }: ContributionDialogProps) => {
	const {
		addLabel,
		availableLabels,
		groupIncome,
		handleChange,
		label,
		removeLabel,
		testAuto,
		testAutoFree,
		isValid,
		contribute,
		handleAccountChange,
		errorMessages,
		personalAccounts,
		selectedAccount,
	} = useGroupContribution(group, toggleModal);

	return (
		<FormDialog
			actions={[
				<Button key={1} disabled={!isValid} onClick={contribute}>
					Finish
				</Button>,
			]}
			open={open}
			toggleModal={toggleModal}
			title="Contribute to your Group"
		>
			<Stack spacing={3}>
				<Stack direction='row' spacing={2} alignItems='center'>
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
							{selectedAccount === undefined
								? "You need to select a personal account to contribute to the group account"
								: ""}
						</FormHelperText>
					</FormControl>
					<Typography variant='numberHeading'>
						Balance: RM {selectedAccount ? selectedAccount.balance : "--"}
					</Typography>
				</Stack>

				<TextField
					type='number'
					value={isNaN(groupIncome.amount) ? "" : groupIncome.amount}
					variant='standard'
					name='amount'
					onChange={handleChange}
					sx={{ width: "50%" }}
					label='Amount'
					helperText={errorMessages?.amount ? errorMessages.amount[0] : ""}
				/>
				<TextField
					multiline
					minRows={4}
					onChange={handleChange}
					value={groupIncome.description}
					sx={{ width: "70%" }}
					name='description'
					label='Description'
				/>
				<Stack direction='row' spacing={2} alignItems='center'>
					<Autocomplete
						sx={{ width: "50%" }}
						freeSolo
						value={label}
						autoComplete
						id='free-solo-2-demo'
						onChange={testAuto}
						disableClearable
						options={[...availableLabels].map((label) => label)}
						renderInput={(params) => (
							<Fragment>
								<TextField
									{...params}
									label='Type label'
									onChange={testAutoFree}
									InputProps={{
										...params.InputProps,
										type: "search",
									}}
								/>
								<FormHelperText>
									Add from a predefined set of labels or create your own labels
								</FormHelperText>
							</Fragment>
						)}
					/>
					<Button color='tertiary' sx={{ height: "fit-content" }} onClick={addLabel}>
						Add label
					</Button>
				</Stack>
				<Stack direction='row' spacing={1}>
					{[...groupIncome.labels].map((label) => (
						<Chip
							label={label}
							key={label}
							color='secondary'
							onDelete={() => removeLabel(label)}
						/>
					))}
				</Stack>
			</Stack>
		</FormDialog>
	);
};

export default ContributionDialog;
