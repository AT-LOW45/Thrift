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
import { Dispatch, Fragment, SetStateAction } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import BudgetChip from "../../budget/components/BudgetChip";
import { Income, incomeTypes, Transaction, TransactionSchemaDefaults } from "../transaction.schema";
import useCreateRecord from "../hooks/useCreateRecord";

type RecordCreationDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	openInfoBar: Dispatch<SetStateAction<boolean>>;
};

const RecordCreationDialog = ({ open, toggleModal, openInfoBar }: RecordCreationDialogProps) => {
	const {
		addLabel,
		removeLabel,
		label,
		availableLabels,
		budgetPlans,
		changeRecordType,
		handleSelectChange,
		handleAmountOrMemoChange,
		handleCategoryChange,
		handleSubmit,
		balance,
		record,
		recordType,
		amountLeftCategory,
		handleAccountChange,
		testAuto,
		accounts,
		budgets,
		isValid,
		testAutoFree,
		setRecord,
		setBudgets,
		setAmountLeftCategory,
		setBalance,
	} = useCreateRecord(toggleModal);

	return (
		<FormDialog
			actions={[
				<Button key={1} onClick={handleSubmit} disabled={!isValid}>
					Finish
				</Button>,
			]}
			open={open}
			toggleModal={() => {
				// setBudgets([]);
				// setAmountLeftCategory(undefined);
				// setBalance(undefined);
				// setRecord(TransactionSchemaDefaults.parse({}));
				setBudgets([]);
				toggleModal();
			}}
		>
			<Stack direction='column' spacing={2} sx={{ px: 5 }}>
				<Stack direction='row' spacing={2} alignItems='center'>
					<FormControl variant='standard' sx={{ minWidth: "50%" }}>
						<InputLabel id='recordType'>Record Type</InputLabel>
						<Select
							labelId='recordType'
							value={recordType}
							name='recordType'
							onChange={changeRecordType}
							label='Record Type'
						>
							<MenuItem value='income'>Income</MenuItem>
							<MenuItem value='transaction'>Transaction</MenuItem>
						</Select>
					</FormControl>
				</Stack>

				<Stack direction='row' alignItems='end' spacing={5}>
					<FormControl variant='standard' sx={{ flexGrow: 1 }}>
						<InputLabel id='account'>Account</InputLabel>
						<Select
							labelId='account'
							value={record.accountName ? record.accountName : ""}
							name='accountName'
							onChange={handleAccountChange}
							label='Account'
						>
							{accounts.length === 0 ? (
								<MenuItem value='Not selected'>Not selected</MenuItem>
							) : (
								accounts.map((account) => (
									<MenuItem value={account.name} key={account.id}>
										{account.name}
									</MenuItem>
								))
							)}
						</Select>
					</FormControl>
					<Stack sx={{ flexGrow: 1 }} direction='row' spacing={2}>
						<Typography variant='regularSubHeading'>Balance: </Typography>
						<Typography variant='numberHeading'>
							RM {balance !== undefined ? balance : "--"}
						</Typography>
					</Stack>
				</Stack>

				{recordType === "transaction" ? (
					<Stack direction='row' spacing={10} flexGrow={1}>
						<Stack direction='column' flexGrow={1} spacing={2} alignItems='center'>
							<FormControl variant='standard' sx={{ flexGrow: 1 }} fullWidth>
								<InputLabel id='budgetPlan'>Budget Plan</InputLabel>
								<Select
									labelId='budgetPlan'
									value={
										(record as Transaction).budgetPlanName
											? (record as Transaction).budgetPlanName
											: ""
									}
									name='budgetPlanName'
									onChange={handleSelectChange}
									label='Budget Plan'
								>
									{budgetPlans.map((plan) => (
										<MenuItem value={plan.name} key={plan.id}>
											{plan.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Stack>
						<Stack direction='column' flexGrow={1} spacing={2}>
							<Stack direction='row' flexGrow={1} spacing={2}>
								<FormControl variant='standard' sx={{ flexGrow: 1 }} fullWidth>
									<InputLabel id='category'>Category</InputLabel>
									<Select
										labelId='category'
										value={
											(record as Transaction).category && budgets.length !== 0
												? (record as Transaction).category
												: ""
										}
										name='category'
										onChange={handleCategoryChange}
										label='Category'
									>
										{budgets.length === 0 ? (
											<MenuItem value=''></MenuItem>
										) : (
											budgets.map((b) => (
												<MenuItem value={b.bud} key={b.bud}>
													{b.bud}
												</MenuItem>
											))
										)}
									</Select>
								</FormControl>
								{(record as Transaction).category && budgets.length !== 0 && (
									<BudgetChip option={(record as Transaction).category} />
								)}
							</Stack>
							<Stack
								direction='row'
								alignItems='baseline'
								spacing={2}
								justifyContent='center'
							>
								<Typography variant='regularSubHeading'>Remaining</Typography>
								<Typography variant='numberHeading'>
									RM
									{amountLeftCategory !== undefined ? amountLeftCategory : "--"}
								</Typography>
							</Stack>
						</Stack>
					</Stack>
				) : (
					<FormControl variant='standard' sx={{ width: "50%" }}>
						<InputLabel id='type'>Type</InputLabel>
						<Select
							labelId='type'
							value={(record as Income).type ? (record as Income).type : ""}
							name='type'
							onChange={handleSelectChange}
							label='Type'
						>
							{incomeTypes.map((type) => (
								<MenuItem value={type} key={type}>
									{type}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}

				<TextField
					type='number'
					value={isNaN(record.amount) ? "" : record.amount}
					variant='standard'
					name='amount'
					onChange={handleAmountOrMemoChange}
					sx={{ width: "50%" }}
					label='Amount'
				/>
				<TextField
					multiline
					minRows={4}
					onChange={handleAmountOrMemoChange}
					value={record.description}
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
					{[...record.labels].map((label) => (
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

export default RecordCreationDialog;
