import AddIcon from "@mui/icons-material/Add";
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import useBudgetAddition from "../hooks/useBudgetAddition";
import { ChipOptions } from "./BudgetChip";
import { Fragment } from "react";
import { InfoBar } from "../../../components";

type BudgetCategoryCreationModalProps = Pick<FormDialogProps, "toggleModal" | "open"> & {
	availableBudgets: ChipOptions[];
};

const BudgetCategoryCreationModal = ({
	availableBudgets,
	open,
	toggleModal,
}: BudgetCategoryCreationModalProps) => {
	const {
		addBudgets,
		addGroup,
		amountLeft,
		group,
		handleGroupChange,
		hasSingleGroup,
		isValid,
		setAmountLeft,
		removeGroup,
		errorMessages,
		setGroup,
		uniqueCategoryError,
		errorInfoBarOpen,
		setErrorInfoBarOpen,
		setSuccessInfoBarOpen,
		successInfoBarOpen,
	} = useBudgetAddition(availableBudgets, toggleModal, open);

	return (
		<Fragment>
			<FormDialog
				actions={[
					<Button key={1} onClick={toggleModal}>
						Cancel
					</Button>,
					<Button disabled={!isValid} key={2} onClick={addBudgets}>
						Finish
					</Button>,
				]}
				open={open}
				toggleModal={() => {
					setGroup([{ name: "" as ChipOptions, spendingLimit: 0 }]);
					toggleModal();
				}}
				title='Budget Category Creation'
			>
				<Stack sx={{ py: 5, px: 10 }}>
					<Typography textAlign='center'>You can add new budgets here</Typography>
					<Typography
						variant='regularSubHeading'
						textAlign='center'
						color={amountLeft < 0 ? "red" : "black"}
					>
						Spendable Amount: RM {amountLeft}
					</Typography>
					<Stack sx={{ my: 5, mx: { sm: 0, lg: 20 } }} spacing={3}>
						{group.map((cat, index) => (
							<Stack key={cat.id} spacing={1}>
								<Stack direction='row' spacing={2}>
									<FormControl
										fullWidth
										variant='standard'
										sx={{ flexBasis: "40%" }}
									>
										<InputLabel>Category</InputLabel>
										<Select
											value={cat.name}
											name='name'
											label='Budget'
											onChange={(e) => handleGroupChange(index, e)}
										>
											{availableBudgets.map((val) => (
												<MenuItem key={val} value={val}>
													{val}
												</MenuItem>
											))}
										</Select>
									</FormControl>
									<TextField
										name='spendingLimit'
										type='number'
										label='Spending Limit'
										variant='standard'
										value={isNaN(cat.spendingLimit) ? "" : cat.spendingLimit}
										onChange={(e) => handleGroupChange(index, e)}
									/>
									<Button
										disabled={hasSingleGroup}
										onClick={() => {
											setAmountLeft((amount) => amount + cat.spendingLimit);
											removeGroup(index);
										}}
									>
										Remove
									</Button>
								</Stack>
								<Stack component='ul'>
									{errorMessages &&
										errorMessages[index] &&
										errorMessages[index]!.map((error, index) => (
											<Typography
												variant='regularLight'
												component='li'
												key={index}
											>
												{error}
											</Typography>
										))}
								</Stack>
							</Stack>
						))}
					</Stack>
					<Button
						variant='contained'
						sx={{ alignSelf: "center" }}
						onClick={addGroup}
						endIcon={<AddIcon />}
						disabled={group.length === availableBudgets.length}
					>
						Add
					</Button>
					{uniqueCategoryError && (
						<Typography textAlign='center' variant='regularLight' pt={2}>
							{uniqueCategoryError}
						</Typography>
					)}
				</Stack>
			</FormDialog>
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				type='success'
				message="New categories added to budget plan"
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='Unable to add categories. Please try again later.'
			/>
		</Fragment>
	);
};

export default BudgetCategoryCreationModal;
