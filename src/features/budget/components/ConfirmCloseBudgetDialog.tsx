import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Portal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FormDialogProps } from "../../../components/form/FormDialog";
import budgetService from "../budget.service";

type ConfirmCloseBudgetDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	budgetPlanId: string;
};

const ConfirmCloseBudgetDialog = ({
	open,
	toggleModal,
	budgetPlanId,
}: ConfirmCloseBudgetDialogProps) => {
	const navigate = useNavigate();

	const closeBudgetPlan = async () => {
		await budgetService.closeBudgetPlan(budgetPlanId);
		navigate("/budgets");
	};

	return (
		<Portal>
			<Dialog
				open={open}
				onClose={toggleModal}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>Close This Budget Plan?</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						Once you close a budget plan, it will be permanently archived and can no
						longer be accessed. Proceed?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={toggleModal}>Disagree</Button>
					<Button onClick={closeBudgetPlan}>Agree</Button>
				</DialogActions>
			</Dialog>
		</Portal>
	);
};

export default ConfirmCloseBudgetDialog;
