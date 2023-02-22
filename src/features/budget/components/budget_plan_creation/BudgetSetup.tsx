import {
	Checkbox,
	DialogContentText,
	FormControl,
	FormControlLabel,
	FormGroup,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import budgetService from "../../budget.service";
import { BudgetPlan } from "../../budget.schema";
import { budgetTypes } from "../BudgetChip";

const validators = (plan: BudgetPlan) => [
	budgetService.validateCategory(plan.categories[0]),
	budgetService.validatePlannedPayment(plan.plannedPayments[0]),
	budgetService.validateLimit(plan),
];

const BudgetSetup = () => {
	const { formData, updateContext, currentStepIndex } = useMultiStep<BudgetPlan>();
	const [enabled, setEnabled] = useState(false);
	const [amountLeft, setAmountLeft] = useState(formData.spendingLimit);

	useEffect(() => {
		const updateAmountLeft = () => {
			setAmountLeft(() => {
				const limit = Number.isNaN(formData.categories[0].spendingLimit)
					? 0
					: formData.categories[0].spendingLimit;
				const amount = Number.isNaN(formData.plannedPayments[0].amount)
					? 0
					: formData.plannedPayments[0].amount;
				return formData.spendingLimit - limit - amount;
			});
		};
		updateAmountLeft();
	}, [
		formData.categories[0].spendingLimit,
		formData.plannedPayments[0].amount,
		currentStepIndex,
	]);

	const handleCategoryChange = useCallback(
		(
			event:
				| SelectChangeEvent
				| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
				| React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
		) => {
			const updated =
				event.target.name === "spendingLimit"
					? [{ ...formData.categories[0], spendingLimit: parseInt(event.target.value) }]
					: [{ ...formData.categories[0], [event.target.name]: event.target.value }];
			updateContext({ key: "categories", value: updated }, validators);
		},
		[formData, currentStepIndex]
	);

	const handlePlannedPaymentchange = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			const updated =
				event.target.name === "amount"
					? [{ ...formData.plannedPayments[0], amount: parseInt(event.target.value) }]
					: [{ ...formData.plannedPayments[0], [event.target.name]: event.target.value }];
			updateContext({ key: "plannedPayments", value: updated }, validators);
		},
		[formData]
	);

	const handlePlannedPaymentDateChange = useCallback(
		(date: dayjs.Dayjs | null) => {
			if (date !== null) {
				const updated = [{ ...formData.plannedPayments[0], startDate: date.toDate() }];
				updateContext({ key: "plannedPayments", value: updated }, validators);
			}
		},
		[formData]
	);

	return (
		<Fragment>
			<DialogContentText sx={{ px: 10 }} textAlign='center'>
				Let's start with adding budgets for your spending. The cumulative amount cannot
				exceed the budget plan total. You can add more after setting up your budget plan
			</DialogContentText>
			<Typography
				variant='regularSubHeading'
				sx={{ color: amountLeft < 0 ? "red" : "black" }}
			>
				RM {amountLeft}
			</Typography>
			<Stack direction='row' spacing={2} sx={{ width: "60%" }} alignSelf='center'>
				<FormControl sx={{ flexBasis: "50%" }} variant='standard'>
					<InputLabel id='demo-simple-select-standard-label'>Budget</InputLabel>
					<Select
						value={formData.categories[0].name}
						name='name'
						label='Budget'
						autoFocus
						onFocus={handleCategoryChange}
						onChange={handleCategoryChange}
					>
						{budgetTypes.map((val) => (
							<MenuItem key={val} value={val}>
								{val}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<TextField
					sx={{ flexBasis: "50%" }}
					type='number'
					label='Spending Limit'
					name='spendingLimit'
					value={
						!Number.isNaN(formData.categories[0].spendingLimit) &&
						formData.categories[0].spendingLimit
					}
					onChange={handleCategoryChange}
					variant='standard'
					required
					color='primary'
				/>
			</Stack>
			<Stack sx={{ pt: 3 }} direction='column' spacing={3}>
				<FormGroup sx={{ width: "100%", mr: "auto", px: 10 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={!enabled}
								onChange={() => setEnabled((enabled) => !enabled)}
							/>
						}
						label='Include planned payment'
					/>
				</FormGroup>
				<DialogContentText sx={{ px: 10 }} textAlign='center'>
					Your balance will be deducted automatically on the specified day of each month
					beginning from the start date. The cumulative amount is included in the budget
					plan total even if the start date is much later.
				</DialogContentText>
				<Stack direction='row' spacing={2} alignSelf='center' sx={{ width: "70%" }}>
					<TextField
						disabled={enabled}
						sx={{ flexBasis: "35%" }}
						label='Payment'
						onChange={handlePlannedPaymentchange}
						name='name'
						variant='standard'
						required
						color='primary'
					/>
					<TextField
						disabled={enabled}
						sx={{ flexBasis: "35%" }}
						type='number'
						label='Amount'
						name='amount'
						value={
							!Number.isNaN(formData.plannedPayments[0].amount) &&
							formData.plannedPayments[0].amount
						}
						onChange={handlePlannedPaymentchange}
						variant='standard'
						required
						color='primary'
					/>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							disabled={enabled}
							minDate={dayjs(new Date())}
							label='Basic example'
							value={(formData.plannedPayments[0].startDate as Date).toDateString()}
							onChange={handlePlannedPaymentDateChange}
							renderInput={(params) => <TextField {...params} />}
						/>
					</LocalizationProvider>
				</Stack>
			</Stack>
		</Fragment>
	);
};

export default BudgetSetup;
