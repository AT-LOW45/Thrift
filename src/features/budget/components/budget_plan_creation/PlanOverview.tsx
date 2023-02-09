import {
	DialogContentText,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField
} from "@mui/material";
import React, { Fragment, useCallback } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import budgetService from "../../budget.service";
import { BudgetPlan } from "../../models";

const PlanOverview = () => {
	const { formData, updateContext, currentStepIndex } = useMultiStep<BudgetPlan>();

	const handleChanges = useCallback(
		(
			event:
				| SelectChangeEvent
				| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
				| React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
		) => {
			updateContext(event, (data) => {
				return [budgetService.validateName(data)];
			});
		},
		[formData, currentStepIndex]
	);

	const handleSpendLimit = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		const spendLimit = parseInt(event.target.value);
		updateContext({ key: "spendingLimit", value: spendLimit }, (data) => {
			return [budgetService.validateName(data)];
		});
	};

	return (
		<Fragment>
			<DialogContentText>
				Create a budget plan to start saving. First of all, tell us how you want to name it
				and provide an overall spending limit.
			</DialogContentText>
			<div>{}</div>
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
				defaultValue={formData.spendingLimit}
				helperText='Provide a spending limit for your new budget plan'
				variant='standard'
				required
				color='primary'
			/>
			<TextField
				sx={{ minWidth: "50%" }}
				id='outlined-multiline-static'
				label='Memo'
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
				<FormHelperText>With label + helper text</FormHelperText>
			</FormControl>
		</Fragment>
	);
};

export default PlanOverview;
