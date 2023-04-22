import { SelectChangeEvent } from "@mui/material";
import { useState, useContext, useEffect, SyntheticEvent } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Group } from "../../group_planning/group.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { GroupTransaction, GroupTransactionSchemaDefaults, labels } from "../transaction.schema";
import transactionService from "../transaction.service";
import { ZodError } from "zod";

const useCreateGroupRecord = (group: Group, toggleModal: () => void) => {
	const [groupTransaction, setGroupTransaction] = useState<GroupTransaction>(
		GroupTransactionSchemaDefaults.parse({})
	);
	const [availableLabels, setAvailableLabels] = useState<Set<string>>(new Set(labels));
	const [isValid, setIsValid] = useState(false);
	const [accountBalance, setAccountBalance] = useState(0);
	const [label, setLabel] = useState("");
	const { user } = useContext(AuthContext);
	const [groupTransacConfirmationDialogOpen, setGroupTransacConfirmationDialogOpen] =
		useState(false);
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [newRecordId, setNewRecordId] = useState("");
	const [errorMessages, setErrorMessages] =
		useState<ZodError<GroupTransaction>["formErrors"]["fieldErrors"]>();

	useEffect(() => {
		const findGroupAccount = async () => {
			const groupAccount = await paymentInfoService.getGroupAccount(group.id!);
			setAccountBalance(groupAccount.balance);
			setGroupTransaction((record) => ({
				...record,
				groupId: group.id!,
				madeBy: user?.uid!,
			}));
		};
		findGroupAccount();
	}, []);

	const testAuto = (event: SyntheticEvent<Element, Event>, value: string) => {
		setLabel(value);
	};

	const testAutoFree = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setLabel(event.target.value);
	};

	const removeLabel = (label: string) => {
		setGroupTransaction((record) => {
			const selectedLabels = record.labels;
			selectedLabels.delete(label);

			labels.has(label) &&
				setAvailableLabels((availableLabels) => {
					availableLabels.add(label);
					return availableLabels;
				});

			return { ...record, labels: selectedLabels };
		});
	};

	const addLabel = () => {
		label !== "" &&
			!groupTransaction.labels.has(label) &&
			setGroupTransaction((record) => {
				const selectedLabels = record.labels;
				selectedLabels.add(label);

				labels.has(label) &&
					setAvailableLabels((availableLabels) => {
						availableLabels.delete(label);
						return availableLabels;
					});

				return { ...record, labels: selectedLabels };
			});
		setLabel("");
	};

	const handleChange = (
		event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | SelectChangeEvent
	) => {
		setGroupTransaction((record) => {
			const value =
				event.target.name === "amount" ? parseInt(event.target.value) : event.target.value;
			const updated = { ...record, [event.target.name]: value };
			const result = transactionService.validateGroupRecordDetails(updated);
			const isWithinBounds = updated.amount <= accountBalance;
			if (result === true) {
				setErrorMessages(undefined);
				setIsValid(true && isWithinBounds);
			} else {
				setErrorMessages(result);
				setIsValid(false && isWithinBounds);
			}
			return updated;
		});
	};

	const proceedWithTransac = async () => {
		const isOver = groupTransaction.amount > group.transactionLimit;
		if (isOver) {
			toggleConfirmationDialog();
		} else {
			const result = await submitRecordRequest();
			if (typeof result === "string") {
				toggleModal();
				if (groupTransacConfirmationDialogOpen === true) {
					toggleConfirmationDialog();
				}

				setNewRecordId(result);
				setSuccessInfoBarOpen(true);
				setGroupTransaction(GroupTransactionSchemaDefaults.parse({}));
			} else {
				setErrorInfoBarOpen(true);
			}
		}
	};

	const submitRecordRequest = async (): Promise<string | boolean> => {
		return await transactionService.addGroupTransaction(
			groupTransaction,
			group.transactionLimit
		);
	};

	const confirmTransaction = async () => {
		const result = await submitRecordRequest();
		if (typeof result === "string") {
			toggleModal();
			if (groupTransacConfirmationDialogOpen === true) {
				toggleConfirmationDialog();
			}

			setNewRecordId(result);
			setSuccessInfoBarOpen(true);
			setGroupTransaction(GroupTransactionSchemaDefaults.parse({}));
		} else {
			setErrorInfoBarOpen(true);
		}
	};

	const toggleConfirmationDialog = () => setGroupTransacConfirmationDialogOpen((open) => !open);

	return {
		groupTransaction,
		availableLabels,
		isValid,
		accountBalance,
		label,
		groupTransacConfirmationDialogOpen,
		errorMessages,
		successInfoBarOpen,
		errorInfoBarOpen,
		newRecordId,
		setSuccessInfoBarOpen,
		setErrorInfoBarOpen,
		testAuto,
		testAutoFree,
		removeLabel,
		addLabel,
		handleChange,
		proceedWithTransac,
		confirmTransaction,
		toggleConfirmationDialog,
		setGroupTransaction,
	};
};

export default useCreateGroupRecord;
