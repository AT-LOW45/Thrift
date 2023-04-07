import { TextField, Typography } from "@mui/material";
import { ChangeEvent, useState } from "react";
import { ZodError } from "zod";
import EditableField from "../../../components/form/editable/EditableField";
import { useEditable } from "../../../context/EditableContext";
import { BudgetPlan } from "../budget.schema";
import budgetService from "../budget.service";

const BudgetPlanTitle = () => {
	const { formData, setFormContext, updateContext, placeholderFormData } =
		useEditable<BudgetPlan>();
	const [errorMessages, setErrorMessages] =
		useState<ZodError<BudgetPlan>["formErrors"]["fieldErrors"]>();

	const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) =>
		updateContext(event, (plan) => [
			(() => {
				const result = budgetService.validatePlanPartial(plan);
				if (result === true) {
					setErrorMessages(undefined);
					return true;
				} else {
					setErrorMessages(result);
					return false;
				}
			})(),
		]);

	setFormContext((plan) => budgetService.updateBudgetPlan(plan, { name: plan.name }));

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
					helperText={errorMessages?.name ? errorMessages.name : ""}
				/>
			</EditableField.Edit>
		</EditableField>
	);
};

export default BudgetPlanTitle;
