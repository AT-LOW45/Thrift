import { useState, useEffect, ChangeEvent } from "react";
import { ZodError } from "zod";
import { useEditable } from "../../../context/EditableContext";
import transactionService from "../../transaction/transaction.service";
import { BudgetPlan } from "../budget.schema";
import budgetService from "../budget.service";

const useBudgetOverviewEdit = () => {
	const { setFormContext, formData, placeholderFormData, updateContext } =
		useEditable<BudgetPlan>();
	const [allocationData, setAllocationData] = useState<
		{ field: string; amount: number; colour: string }[]
	>([]);
	const [amountUsed, setAmountUsed] = useState(0);
	const [errorMessages, setErrorMessages] =
		useState<ZodError<BudgetPlan>["formErrors"]["fieldErrors"]>();

	useEffect(() => {
		const getAmountSpent = async () => {
			const myTransactions = (await transactionService.getMyTransactions(formData.id!))
				.map((transac) => transac.amount)
				.reduce((prev, cur) => prev + cur, 0);
			const plannedPayments = formData.plannedPayments
				? formData.plannedPayments
						.map((planned) => planned.amount)
						.reduce((prev, cur) => prev + cur, 0)
				: 0;
			const { amountLeftCurrency, amountLeftPercentage } =
				await budgetService.getRemainingOverallAmount(formData.id!);

			setAllocationData([
				{ field: "Allocated", amount: formData.spendingLimit, colour: "black" },
				{ field: "Spent", amount: myTransactions, colour: "red" },
				{ field: "Planned Payments", amount: plannedPayments, colour: "#F8964C" },
				{
					field: "Remaining",
					amount: amountLeftCurrency,
					colour: "green",
				},
			]);

			setAmountUsed(amountLeftPercentage);
		};
		getAmountSpent();
	}, [formData]);

	setFormContext(
		async (plan) =>
			await budgetService.updateBudgetPlan(plan, {
				spendingLimit: plan.spendingLimit,
				spendingThreshold: plan.spendingThreshold,
				note: plan.note,
			})
	);

	const handleSliderChange = (event: Event, val: number | number[]) => {
		updateContext({ key: "spendingThreshold", value: val as number }, (plan) => {
			return [plan.spendingThreshold > 0 && plan.spendingThreshold <= 100];
		});
	};

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

	const handleLimit = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		updateContext({ key: "spendingLimit", value: parseInt(event.target.value) }, (plan) => [
			validateState(plan),
		]);

	const handleNote = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		updateContext(event, (plan) => [validateState(plan)]);

	const getMathOperator = (index: number, array: typeof allocationData): string => {
		if (index === array.length - 1) return "";
		return index === array.length - 2 ? "=" : "-";
	};

	return {
		setFormContext,
		formData,
		placeholderFormData,
		errorMessages,
		amountUsed,
		updateContext,
		allocationData,
		handleSliderChange,
		getMathOperator,
		handleLimit,
		handleNote,
	};
};

export default useBudgetOverviewEdit;
