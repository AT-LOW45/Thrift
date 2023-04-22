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
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import {
	BudgetPlan,
	Category,
	PlannedPayment,
	PlannedPaymentSchemaDefaults,
} from "../../budget.schema";
import budgetService from "../../budget.service";
import { budgetTypes } from "../BudgetChip";
import { ZodError } from "zod";

type BudgetSetupProps = {
	enabled: boolean;
	setEnabled: Dispatch<SetStateAction<boolean>>;

};

const BudgetSetup = ({
	enabled,
	setEnabled,
}: BudgetSetupProps) => {
	const { formData, updateContext, currentStepIndex } = useMultiStep<BudgetPlan>();
	const [amountLeft, setAmountLeft] = useState(formData.spendingLimit);
	const [catErrorMessage, setCatErrorMessage] =
		useState<ZodError<Category>["formErrors"]["fieldErrors"]>();
	const [plannedErrorMessage, setPlannedErrorMessage] =
		useState<ZodError<PlannedPayment>["formErrors"]["fieldErrors"]>();

	const validators = (plan: BudgetPlan) => [
		(() => {
			const catResult = budgetService.validateCategory(plan.categories[0]);

			if (catResult === true) {
				setCatErrorMessage(undefined);
				return true;
			} else {
				setCatErrorMessage(catResult);
				return false;
			}
		})(),
		(() => {
			if (enabled === true) {
				const plannedResult = budgetService.validatePlannedPayment(
					plan.plannedPayments![0]
				);

				if (plannedResult === true) {
					setPlannedErrorMessage(undefined);
					return true;
				} else {
					setPlannedErrorMessage(plannedResult);
					return false;
				}
			} else {
				return true;
			}
		})(),
		budgetService.validateLimit(plan),
	];

	useEffect(() => {
		const updateAmountLeft = () => {
			setAmountLeft(() => {
				const limit = Number.isNaN(formData.categories[0].spendingLimit)
					? 0
					: formData.categories[0].spendingLimit;
				const amount = Number.isNaN(formData.plannedPayments![0].amount)
					? 0
					: formData.plannedPayments![0].amount;
				return formData.spendingLimit - limit - amount;
			});
		};
		updateAmountLeft();
	}, [
		formData.categories[0].spendingLimit,
		formData.plannedPayments![0].amount,
		currentStepIndex,
	]);

	useEffect(() => {
		const plannedPaymentValue =
			formData.plannedPayments![0].name !== "" || formData.plannedPayments![0].amount !== 0
				? formData.plannedPayments![0]
				: PlannedPaymentSchemaDefaults.parse({});
		updateContext({ key: "plannedPayments", value: [plannedPaymentValue] }, validators);
	}, [enabled]);

	const handleCategoryChange = (
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
	};

	const handlePlannedPaymentChange = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		const updated =
			event.target.name === "amount"
				? [{ ...formData.plannedPayments![0], amount: parseInt(event.target.value) }]
				: [{ ...formData.plannedPayments![0], [event.target.name]: event.target.value }];
		updateContext({ key: "plannedPayments", value: updated }, validators);
	};

	const handlePlannedPaymentDateChange = (date: dayjs.Dayjs | null) => {
		if (date !== null) {
			const updated = [{ ...formData.plannedPayments![0], startDate: date.toDate() }];
			updateContext({ key: "plannedPayments", value: updated }, validators);
		}
	};

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
					helperText={catErrorMessage?.spendingLimit ? catErrorMessage.spendingLimit : ""}
					color='primary'
				/>
			</Stack>

			<Stack sx={{ pt: 3 }} direction='column' spacing={3}>
				<FormGroup sx={{ width: "100%", mr: "auto", px: 10 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={enabled}
								onChange={() => {
									setEnabled((enabled) => {
										const updated = !enabled;
										updated === false && setPlannedErrorMessage(undefined);
										return updated;
									});
								}}
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
						disabled={!enabled}
						sx={{ flexBasis: "35%" }}
						label='Payment'
						value={enabled ? formData.plannedPayments![0].name : ""}
						onChange={handlePlannedPaymentChange}
						name='name'
						helperText={plannedErrorMessage?.name ? plannedErrorMessage.name : ""}
						variant='standard'
						required
						color='primary'
					/>
					<TextField
						disabled={!enabled}
						sx={{ flexBasis: "35%" }}
						type='number'
						label='Amount'
						name='amount'
						value={
							enabled
								? !Number.isNaN(formData.plannedPayments![0].amount) &&
								  formData.plannedPayments![0].amount
								: ""
						}
						onChange={handlePlannedPaymentChange}
						variant='standard'
						required
						helperText={plannedErrorMessage?.amount ? plannedErrorMessage.amount : ""}
						color='primary'
					/>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							disabled={!enabled}
							minDate={dayjs(new Date())}
							label='Start date'
							value={
								enabled
									? (
											formData.plannedPayments![0].startDate as Date
									  ).toDateString()
									: null
							}
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
