
import { SelectChangeEvent } from "@mui/material";
import { useState, useEffect, ChangeEvent } from "react";
import { useEditable } from "../../../context/EditableContext";
import useInputGroup from "../../../hooks/useInputGroup";
import { Category, BudgetPlan, CategorySchema } from "../budget.schema";
import budgetService from "../budget.service";
import { ChipOptions } from "../components/BudgetChip";
import { z as zod, ZodError } from "zod";

const useBudgetAddition = (
	availableBudgets: ChipOptions[],
	toggleModal: () => void,
	open: boolean
) => {
	const { group, addGroup, handleGroupUpdate, hasSingleGroup, removeGroup, setGroup } =
		useInputGroup<Category>(availableBudgets.length, {
			name: "" as ChipOptions,
			spendingLimit: 0,
		});
	const [isValid, setIsValid] = useState(false);
	const [uniqueCategoryError, setUniqueCategoryError] = useState<string>();
	const [spendableAmount, setSpendableAmount] = useState(0);
	const [amountLeft, setAmountLeft] = useState(0);
	const { formData } = useEditable<BudgetPlan>();
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false)
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false)
	const [errorMessages, setErrorMessages] =
		useState<ZodError<Category[]>["formErrors"]["fieldErrors"]>();

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

	const validateUniqueBudgets = (categories: Category[]) => {
		const budgets = categories.map((gr) => gr.name);
		const result = budgets.every((name, index) => budgets.indexOf(name) === index);
		if (result === true) {
			setUniqueCategoryError(undefined);
			return true;
		} else {
			setUniqueCategoryError("You have duplicate categories in different rows!");
			return false;
		}
	};

	const validateCategory = (categories: Category[]) => {
		const CategoryArraySchema = zod.array(CategorySchema);
		const result = CategoryArraySchema.safeParse(categories);

		if (result.success === true) {
			setErrorMessages(undefined);
			return true;
		} else {
			setErrorMessages(result.error.formErrors.fieldErrors);
			return false;
		}
	};

	const handleGroupChange = (
		index: number,
		event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent
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
					validateUniqueBudgets(groupResult) &&
					validateCategory(groupResult) &&
					left >= 0;
				setIsValid(result);

				return left;
			});
		});
	};

	const addBudgets = async () => {
		const result = await budgetService.addNewBudgets(formData.id!, group);
		if (result) {
			toggleModal();
			setSuccessInfoBarOpen(true)
		} else {
			setErrorInfoBarOpen(true)
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
		uniqueCategoryError,
		spendableAmount,
		amountLeft,
		errorMessages,
		successInfoBarOpen,
		errorInfoBarOpen,
		setSuccessInfoBarOpen,
		setErrorInfoBarOpen,
		setAmountLeft,
		setSpendableAmount,
		handleGroupChange,
		addBudgets,
	};
};

export default useBudgetAddition;
