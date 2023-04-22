import { Stack, TextField, Typography, Button } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import EditableField from "../../../components/form/editable/EditableField";
import { useEditable } from "../../../context/EditableContext";
import { BudgetPlan } from "../budget.schema";
import BudgetItem from "./BudgetItem";
import AddIcon from "@mui/icons-material/Add";
import { budgetTypes, ChipOptions } from "./BudgetChip";
import BudgetCategoryCreationModal from "./BudgetCategoryCreationModal";
import PlannedPaymentCreationModal from "./PlannedPaymentCreationModal";

const BudgetCategories = () => {
	const { handleInputChange, setFormContext, formData } = useEditable<BudgetPlan>();
	const [availableBudgets, setAvailableBudgets] = useState<ChipOptions[]>([]);
	const [categoryCreationModalOpen, setCategoryCreationModalOpen] = useState(false);
	const [plannedPaymentCreationModalOpen, setPlannedPaymentCreationModalOpen] = useState(false);

	const toggleCategoryModal = () => setCategoryCreationModalOpen((open) => !open);
	const togglePlannedPaymentModal = () => setPlannedPaymentCreationModalOpen((open) => !open);

	setFormContext((cat) => {});

	useEffect(() => {
		const available = budgetTypes.filter(
			(type) => !formData.categories.map((cat) => cat.name).includes(type as ChipOptions)
		);
		setAvailableBudgets(available as ChipOptions[]);
	}, [formData.categories]);

	return (
		<Fragment>
			<Stack direction='column' spacing={3}>
				<Stack direction='row' spacing={3}>
					<Typography variant='regularSubHeading'>Budgets</Typography>
					<Button
						variant='contained'
						color='secondary'
						endIcon={<AddIcon />}
						onClick={toggleCategoryModal}
					>
						Add Budget
					</Button>
				</Stack>
				{formData.categories.map((cat) => (
					<EditableField key={cat.name} compact={false}>
						<EditableField.View>
							<BudgetItem item={cat} />
						</EditableField.View>
						<EditableField.Edit>
							<TextField
								onChange={handleInputChange}
								name='test'
								variant='standard'
							/>
						</EditableField.Edit>
					</EditableField>
				))}
			</Stack>
			<Stack direction='column' sx={{ mt: 10 }} spacing={5}>
				<Stack direction='row' spacing={3}>
					<Typography variant='regularSubHeading'>Planned Payments</Typography>
					<Button
						variant='contained'
						color='secondary'
						endIcon={<AddIcon />}
						onClick={togglePlannedPaymentModal}
					>
						Add Planned Payment
					</Button>
				</Stack>
				{formData.plannedPayments ? (
					formData.plannedPayments.map((planned, index) => (
						<EditableField compact={false} key={index}>
							<EditableField.View>
								<BudgetItem item={planned} />
							</EditableField.View>
							<EditableField.Edit>test</EditableField.Edit>
						</EditableField>
					))
				) : (
					<Typography variant='regularLight'>No planned payments yet</Typography>
				)}
			</Stack>
			<BudgetCategoryCreationModal
				open={categoryCreationModalOpen}
				toggleModal={toggleCategoryModal}
				availableBudgets={availableBudgets}
			/>
			<PlannedPaymentCreationModal
				open={plannedPaymentCreationModalOpen}
				toggleModal={togglePlannedPaymentModal}
			/>
		</Fragment>
	);
};

export default BudgetCategories;
