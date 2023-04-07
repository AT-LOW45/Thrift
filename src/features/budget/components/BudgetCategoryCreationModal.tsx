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
		removeGroup,
		setAmountLeft,
		setGroup,
		setSpendableAmount,
	} = useBudgetAddition(availableBudgets, toggleModal);

	return (
		<FormDialog
			actions={[
				<Button disabled={!isValid} key={1} onClick={addBudgets}>
					Finish
				</Button>,
			]}
			open={open}
			toggleModal={() => {
				setGroup([{ name: "" as ChipOptions, spendingLimit: 0 }]);
				setSpendableAmount(0);
				setAmountLeft(0);
				toggleModal();
			}}
			title="Budget Category Creation"
		>
			<Stack sx={{ py: 5, px: 10 }}>
				<Typography textAlign='center'>You can add new budgets here</Typography>
				<Typography
					variant='regularSubHeading'
					textAlign='center'
					color={amountLeft <= 0 ? "red" : "black"}
				>
					Spendable Amount: RM {amountLeft}
				</Typography>
				<Stack sx={{ my: 5, mx: { sm: 0, lg: 20 } }} spacing={3}>
					{group.map((cat, index) => (
						<Stack direction='row' key={cat.id} spacing={2}>
							<FormControl fullWidth variant='standard' sx={{ flexBasis: "40%" }}>
								<InputLabel>Account Type</InputLabel>
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
							<Button disabled={hasSingleGroup} onClick={() => removeGroup(index)}>
								Remove
							</Button>
						</Stack>
					))}
				</Stack>
				<Button
					variant='contained'
					sx={{ alignSelf: "center" }}
					onClick={addGroup}
					endIcon={<AddIcon />}
				>
					Add Budget
				</Button>
			</Stack>
		</FormDialog>
	);
};

export default BudgetCategoryCreationModal;
