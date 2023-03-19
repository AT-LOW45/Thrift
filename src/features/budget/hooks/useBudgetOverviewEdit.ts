import { useState, useEffect, ChangeEvent } from "react";
import { useEditable } from "../../../context/EditableContext";
import transactionService from "../../transaction/transaction.service";
import { BudgetPlan } from "../budget.schema";
import budgetService from "../budget.service";

const useBudgetOverviewEdit = () => {
	const { setFormContext, handleInputChange, formData, placeholderFormData, updateContext } =
		useEditable<BudgetPlan>();
	const [allocationData, setAllocationData] = useState<
		{ field: string; amount: number; colour: string }[]
	>([]);

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
			const overallAmountLeft = await budgetService.getRemainingOverallAmount(formData.id!);

			setAllocationData([
				{ field: "Allocated", amount: formData.spendingLimit, colour: "black" },
				{ field: "Spent", amount: myTransactions, colour: "red" },
				{ field: "Planned Payments", amount: plannedPayments, colour: "#F8964C" },
				{
					field: "Remaining",
					amount: overallAmountLeft.amountLeftCurrency,
					colour: "green",
				},
			]);
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

	const handleLimit = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		updateContext({ key: "spendingLimit", value: parseInt(event.target.value) }, (plan) => [
			budgetService.validatePlanPartial(plan),
		]);

	const handleNote = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		updateContext(event, (plan) => [budgetService.validatePlanPartial(plan)]);

	const getMathOperator = (index: number, array: typeof allocationData): string => {
		if (index === array.length - 1) return "";
		return index === array.length - 2 ? "=" : "-";
	};

	return {
		setFormContext,
		formData,
		placeholderFormData,
		updateContext,
		allocationData,
		handleSliderChange,
		getMathOperator,
		handleLimit,
		handleNote
	};
};

export default useBudgetOverviewEdit;
