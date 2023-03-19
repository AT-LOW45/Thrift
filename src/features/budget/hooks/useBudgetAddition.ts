import { SelectChangeEvent } from "@mui/material";
import { useState, useEffect } from "react";
import { useEditable } from "../../../context/EditableContext";
import useInputGroup from "../../../hooks/useInputGroup";
import { Category, BudgetPlan } from "../budget.schema";
import budgetService from "../budget.service";
import { ChipOptions } from "../components/BudgetChip";

const useBudgetAddition = (availableBudgets: ChipOptions[], toggleModal: () => void) => {
	const { group, addGroup, handleGroupUpdate, hasSingleGroup, removeGroup, setGroup } =
		useInputGroup<Category>(availableBudgets.length, {
			name: "" as ChipOptions,
			spendingLimit: 0,
		});
	const [isValid, setIsValid] = useState(false);
	const [spendableAmount, setSpendableAmount] = useState(0);
	const [amountLeft, setAmountLeft] = useState(0);
	const { formData } = useEditable<BudgetPlan>();

	const validateUniqueBudgets = (categories: Category[]) => {
		const budgets = categories.map((gr) => gr.name);
		return budgets.every((name, index) => budgets.indexOf(name) === index);
	};

	const validateCategory = (categories: Category[]) => {
		return categories.every((gr) => budgetService.validateCategory(gr));
	};

	const handleGroupChange = (
		index: number,
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent
	) => {
		const targetValue =
			event.target.name === "spendingLimit"
				? parseInt(event.target.value)
				: event.target.value;
		handleGroupUpdate(index, event.target.name, targetValue, (groupResult) => {
			setAmountLeft(() => {
				const left =
					spendableAmount -
					groupResult
						.map((cat) => cat.spendingLimit)
						.reduce((prev, next) => prev + (isNaN(next) ? 0 : next), 0);

				const result =
					validateUniqueBudgets(groupResult) && validateCategory(groupResult) && left > 0;
				setIsValid(result);

				return left;
			});
		});
	};

	useEffect(() => {
		const result =
			validateUniqueBudgets(group) && validateCategory(group) && spendableAmount > 0;
		setIsValid(result);
	}, [group.length]);

	useEffect(() => {
		const plannedPaymentAmount = formData.plannedPayments
			? formData.plannedPayments
					.map((planned) => planned.amount)
					.reduce((prev, cur) => prev + cur, 0)
			: 0;
		const spendable =
			formData.spendingLimit -
			formData.categories
				.map((cat) => cat.spendingLimit)
				.reduce((prev, next) => prev + next, 0) -
			plannedPaymentAmount;
		setSpendableAmount(spendable);
		setAmountLeft(spendable);
	}, [open]);

	const addBudgets = async () => {
		const result = await budgetService.addNewBudgets(formData.id!, group);
		if (result) {
			toggleModal();
		} else {
			console.log("something went wrong");
		}
	};

	return {
		group,
		addGroup,
		handleGroupUpdate,
		hasSingleGroup,
		removeGroup,
		setGroup,
		isValid,
		spendableAmount,
		amountLeft,
		setAmountLeft,
		setSpendableAmount,
		handleGroupChange,
		addBudgets,
	};
};

export default useBudgetAddition;
