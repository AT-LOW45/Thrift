import {
	Autocomplete,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	Portal,
	TextField,
	Typography,
} from "@mui/material";
import { Fragment } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import BudgetChip, { budgetTypes } from "../../budget/components/BudgetChip";
import { Group } from "../../group_planning/group.schema";
import useCreateGroupRecord from "../hooks/useCreateGroupRecord";
import { GroupTransactionSchemaDefaults } from "../transaction.schema";
import { InfoBar } from "../../../components";

type GroupRecordCreationDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	group: Group;
};

const GroupRecordCreationDialog = ({
	open,
	toggleModal,
	group,
}: GroupRecordCreationDialogProps) => {
	const {
		accountBalance,
		addLabel,
		availableLabels,
		confirmTransaction,
		groupTransacConfirmationDialogOpen,
		groupTransaction,
		handleChange,
		isValid,
		label,
		errorMessages,
		proceedWithTransac,
		removeLabel,
		testAuto,
		testAutoFree,
		toggleConfirmationDialog,
		setGroupTransaction,
		errorInfoBarOpen, 
		newRecordId,
		setErrorInfoBarOpen,
		setSuccessInfoBarOpen,
		successInfoBarOpen,
	} = useCreateGroupRecord(group, toggleModal);

	return (
		<Fragment>
			<FormDialog
				actions={[
					<Button
						key={2}
						onClick={() => {
							toggleModal();
							setGroupTransaction(GroupTransactionSchemaDefaults.parse({}));
						}}
					>
						Cancel
					</Button>,
					<Button key={1} disabled={!isValid} onClick={proceedWithTransac}>
						Finish
					</Button>,
				]}
				open={open}
				toggleModal={toggleModal}
				title='Group Record Creation'
			>
				<Stack spacing={3} sx={{ px: 5 }}>
					<Box>
						<Typography variant='numberHeading'>
							Account Balance: RM {accountBalance}
						</Typography>
						<Typography>
							You are allowed to spend RM {group.transactionLimit}. A transaction
							exceeding this amount will require the group owner's approval
						</Typography>
					</Box>
					<Stack direction='row' spacing={2}>
						<FormControl variant='standard' sx={{ maxWidth: "50%" }} fullWidth>
							<InputLabel id='category'>Category</InputLabel>
							<Select
								labelId='category'
								value={groupTransaction.category}
								name='category'
								onChange={handleChange}
								label='Category'
							>
								{budgetTypes.map((budget) => (
									<MenuItem value={budget} key={budget}>
										{budget}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<BudgetChip option={groupTransaction.category} />
					</Stack>

					<TextField
						type='number'
						value={isNaN(groupTransaction.amount) ? "" : groupTransaction.amount}
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
						value={groupTransaction.description}
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
										Add from a predefined set of labels or create your own
										labels
									</FormHelperText>
								</Fragment>
							)}
						/>
						<Button color='tertiary' sx={{ height: "fit-content" }} onClick={addLabel}>
							Add label
						</Button>
					</Stack>
					<Stack direction='row' spacing={1}>
						{[...groupTransaction.labels].map((label) => (
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
			<Portal>
				<Dialog
					open={groupTransacConfirmationDialogOpen}
					onClose={toggleConfirmationDialog}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'
				>
					<DialogTitle id='alert-dialog-title'>Transaction Limit Alert</DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-description'>
							Your transaction amount of RM {groupTransaction.amount} is greater than
							your authorised limit of RM {group.transactionLimit}. The group owner
							needs to approve your request before this transaction will go through.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={toggleConfirmationDialog}>Disagree</Button>
						<Button onClick={confirmTransaction}>Agree</Button>
					</DialogActions>
				</Dialog>
			</Portal>
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				type='success'
				message={`Created group transaction with ID ${newRecordId}`}
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='An error occurred while attempting to create the group transaction. Please try again later'
			/>
		</Fragment>
	);
};

export default GroupRecordCreationDialog;
