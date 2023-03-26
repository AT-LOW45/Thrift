import { SelectChangeEvent } from "@mui/material";
import { useState, useContext, useEffect, SyntheticEvent } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Group } from "../../group_planning/group.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { GroupTransaction, GroupTransactionSchemaDefaults, labels } from "../transaction.schema";
import transactionService from "../transaction.service";

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
			setIsValid(result && isWithinBounds);
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
			} else {
				console.log("unable to add group transaction");
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
			toggleConfirmationDialog();
		} else {
			console.log("unable to add group transaction");
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
		testAuto,
		testAutoFree,
		removeLabel,
		addLabel,
		handleChange,
		proceedWithTransac,
		confirmTransaction,
		toggleConfirmationDialog,
	};
};

export default useCreateGroupRecord;
