import { useState, ChangeEvent, useEffect } from "react";
import useInputGroup from "../../../hooks/useInputGroup";
import { BudgetPlan, PlannedPayment, PlannedPaymentSchema } from "../budget.schema";
import dayjs from "dayjs";
import { ZodError, z as zod } from "zod";
import { useEditable } from "../../../context/EditableContext";
import budgetService from "../budget.service";

const usePlannedPaymentAddition = (toggleModal: () => void, open: boolean) => {
	const { addGroup, group, handleGroupUpdate, hasSingleGroup, removeGroup, setGroup } =
		useInputGroup<PlannedPayment>(5, { name: "", amount: 0, startDate: new Date() });
	const { formData } = useEditable<BudgetPlan>();
	const [isValid, setIsValid] = useState(false);
	const [spendableAmount, setSpendableAmount] = useState(0);
	const [amountLeft, setAmountLeft] = useState(0);
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [errorMessages, setErrorMessages] =
		useState<ZodError<PlannedPayment[]>["formErrors"]["fieldErrors"]>();

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

	useEffect(() => {
		const result = validatePlannedPayments(group) && spendableAmount > 0;
		setIsValid(result);
	}, [group.length]);

	const validatePlannedPayments = (plannedPayments: PlannedPayment[]) => {
		const PlannedPaymentArraySchema = zod.array(PlannedPaymentSchema);
		const result = PlannedPaymentArraySchema.safeParse(plannedPayments);

		if (result.success === true) {
			setErrorMessages(undefined);
			return true;
		} else {
			setErrorMessages(result.error.formErrors.fieldErrors);
			return false;
		}
	};

	const handleGroupNameAndAmountChange = (
		index: number,
		event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		const value =
			event.target.name === "amount" ? parseInt(event.target.value) : event.target.value;

		handleGroupUpdate(index, event.target.name, value, (groupResult) => {
			setAmountLeft(() => {
				const left =
					spendableAmount -
					groupResult
						.map((planned) => planned.amount)
						.reduce((prev, next) => prev + (isNaN(next) ? 0 : next), 0);

				const result = validatePlannedPayments(groupResult) && left >= 0;
				setIsValid(result);

				return left;
			});
		});
	};

	const handleGroupDateChange = (index: number, date: dayjs.Dayjs | null) => {
		if (date !== null) {
			handleGroupUpdate(index, "startDate", date.toDate(), (groupResult) => {
				const result = validatePlannedPayments(groupResult);

				setIsValid(result);
			});
		}
	};

	const addPlannedPayments = async () => {
		const result = await budgetService.addNewPlannedPayments(formData.id!, group);
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
		handleGroupNameAndAmountChange,
		handleGroupDateChange,
		hasSingleGroup,
		successInfoBarOpen,
		errorInfoBarOpen,
		setSuccessInfoBarOpen,
		setErrorInfoBarOpen,
		removeGroup,
		setGroup,
		setSpendableAmount,
		setAmountLeft,
		addPlannedPayments,
		isValid,
		spendableAmount,
		amountLeft,
		errorMessages,
	};
};

export default usePlannedPaymentAddition;
