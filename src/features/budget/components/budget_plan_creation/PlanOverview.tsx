import {
	DialogContentText,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField
} from "@mui/material";
import React, { Fragment } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { BudgetPlan } from "../../budget.schema";
import budgetService from "../../budget.service";

const PlanOverview = () => {
	const { formData, updateContext } = useMultiStep<BudgetPlan>();

	const handleChanges = (
		event:
			| SelectChangeEvent
			| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
	) =>
		updateContext(event, (data) => {
			return [budgetService.validatePlanPartial(data)];
		});

	const handleSpendLimit = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		const spendLimit = parseInt(event.target.value);
		updateContext({ key: "spendingLimit", value: spendLimit }, (data) => {
			return [budgetService.validatePlanPartial(data)];
		});
	};

	return (
		<Fragment>
			<DialogContentText>
				Create a budget plan to start saving. First of all, tell us how you want to name it
				and provide an overall spending limit.
			</DialogContentText>
			<TextField
				sx={{ minWidth: "50%" }}
				autoFocus
				onFocus={handleChanges}
				label='Name'
				name='name'
				defaultValue={formData.name}
				onChange={handleChanges}
				helperText='Provide a name for your new budget plan'
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
				helperText='Provide a spending limit for your new budget plan'
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
				helperText='Add a short memo to describe this budget plan'
				rows={4}
			/>
			<FormControl variant='standard' sx={{ minWidth: "50%" }}>
				<InputLabel id='demo-simple-select-standard-label'>Age</InputLabel>
				<Select
					labelId='demo-simple-select-standard-label'
					id='demo-simple-select-standard'
					value={formData.renewalTerm}
					name='renewalTerm'
					onChange={handleChanges}
					label='Age'
				>
					<MenuItem value='biweekly'>biweekly</MenuItem>
					<MenuItem value='monthly'>monthly</MenuItem>
				</Select>
				{/* <FormHelperText></FormHelperText> */}
			</FormControl>
		</Fragment>
	);
};

export default PlanOverview;
