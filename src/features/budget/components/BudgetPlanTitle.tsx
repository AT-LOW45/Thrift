import { Typography, TextField } from "@mui/material";
import React, { ChangeEvent } from "react";
import EditableField from "../../../components/form/editable/EditableField";
import { useEditable } from "../../../context/EditableContext";
import { BudgetPlan } from "../budget.schema";
import budgetService from "../budget.service";

const BudgetPlanTitle = () => {
	const { formData, setFormContext, updateContext, placeholderFormData } =
		useEditable<BudgetPlan>();

	const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) =>
		updateContext(event, (plan) => [budgetService.validatePlanPartial(plan)]);

	setFormContext((plan) => {
		budgetService.updateBudgetPlan(plan, { name: plan.name });
	});

	return (
		<EditableField compact>
			<EditableField.View>
				<Typography variant='regularHeading'>{formData.name}</Typography>
			</EditableField.View>
			<EditableField.Edit>
				<TextField
					variant='standard'
					name='name'
					value={placeholderFormData.name}
					onChange={handleTitleChange}
				/>
			</EditableField.Edit>
		</EditableField>
	);
};

export default BudgetPlanTitle;
