import {
	Box,
	DialogContentText,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
} from "@mui/material";
import { ChangeEvent, Fragment, FocusEvent, useState } from "react";
import { ZodError } from "zod";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { BudgetPlan } from "../../budget.schema";
import budgetService from "../../budget.service";

const PlanOverview = () => {
	const { formData, updateContext } = useMultiStep<BudgetPlan>();
	const [errorMessages, setErrorMessages] =
		useState<ZodError<BudgetPlan>["formErrors"]["fieldErrors"]>();

	const validateState = (budgetPlan: BudgetPlan) => {
		const result = budgetService.validatePlanPartial(budgetPlan);
		if (result === true) {
			setErrorMessages(undefined);
			return true;
		} else {
			setErrorMessages(result);
			return false;
		}
	};

	const handleChanges = (
		event:
			| SelectChangeEvent
			| ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
	) => updateContext(event, (data) => [validateState(data)]);

	const handleSpendLimit = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		const spendLimit = parseInt(event.target.value);
		updateContext({ key: "spendingLimit", value: spendLimit }, (data) => [validateState(data)]);
	};

	return (
		<Fragment>
			<DialogContentText>
				Create a budget plan to start saving. First of all, tell us how you want to name it
				and provide an overall spending limit.
			</DialogContentText>

			<TextField
				autoFocus
				sx={{ minWidth: "50%" }}
				onFocus={handleChanges}
				label='Budget Plan Name'
				name='name'
				defaultValue={formData.name}
				onChange={handleChanges}
				helperText={errorMessages?.name ? errorMessages.name : ""}
				variant='standard'
				required
				color='primary'
			/>
			<TextField
				sx={{ minWidth: "50%" }}
				label='Spending Limit'
				name='spendingLimit'
				onChange={handleSpendLimit}
				type='number'
				value={isNaN(formData.spendingLimit) ? "" : formData.spendingLimit}
				helperText={errorMessages?.spendingLimit ? errorMessages.spendingLimit : ""}
				variant='standard'
				required
				color='primary'
			/>
			<TextField
				sx={{ minWidth: "50%" }}
				id='outlined-multiline-static'
				label='Memo'
				name='note'
				onChange={handleChanges}
				multiline
				value={formData.note}
				helperText={errorMessages?.note ? errorMessages.note : ""}
				rows={4}
			/>
			<FormControl variant='standard' sx={{ minWidth: "50%" }}>
				<InputLabel id='demo-simple-select-standard-label'>
					Your budgets will be renewed based on the provided term
				</InputLabel>
				<Select
					labelId='demo-simple-select-standard-label'
					id='demo-simple-select-standard'
					value={formData.renewalTerm}
					name='renewalTerm'
					onChange={handleChanges}
					label='Renewal Term'
				>
					<MenuItem value='biweekly'>biweekly</MenuItem>
					<MenuItem value='monthly'>monthly</MenuItem>
				</Select>
			</FormControl>
		</Fragment>
	);
};

export default PlanOverview;
