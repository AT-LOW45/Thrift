import { SelectChangeEvent } from "@mui/material";
import { ChangeEvent, SyntheticEvent, useContext, useEffect, useState } from "react";
import { ZodError } from "zod";
import { AuthContext } from "../../../context/AuthContext";
import { PersonalAccount } from "../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import profileService from "../../profile/profile.service";
import {
	GroupIncome,
	GroupIncomeSchemaDefaults,
	labels,
} from "../../transaction/transaction.schema";
import transactionService from "../../transaction/transaction.service";
import { Group } from "../group.schema";

const useGroupContribution = (group: Group, toggleModal: () => void) => {
	const [groupIncome, setGroupIncome] = useState<GroupIncome>(
		GroupIncomeSchemaDefaults.parse({})
	);
	const [label, setLabel] = useState("");
	const [availableLabels, setAvailableLabels] = useState<Set<string>>(new Set(labels));
	const [isValid, setIsValid] = useState(false);
	const { user } = useContext(AuthContext);
	const [personalAccounts, setPersonalAccounts] = useState<PersonalAccount[]>([]);
	const [selectedAccount, setSelectedAccount] = useState<PersonalAccount>();
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [contributionAmount, setContributionAmount] = useState(0);
	const [errorMessages, setErrorMessages] =
		useState<ZodError<GroupIncome>["formErrors"]["fieldErrors"]>();

	useEffect(() => {
		const getPersonalAccounts = async () => {
			const foundAccounts = await paymentInfoService.getPersonalAccounts();
			setPersonalAccounts(foundAccounts);
		};
		getPersonalAccounts();
	}, []);

	useEffect(() => {
		const check = () => {
			if (selectedAccount) {
				const hasEnough = selectedAccount.balance >= groupIncome.amount;
				const isRecordValid = transactionService.validateGroupRecordDetails(groupIncome);
				if (isRecordValid === true) {
					setIsValid(hasEnough);
				} else {
					setIsValid(false);
				}
			}
		};
		check();
	}, [selectedAccount]);

	const testAuto = (event: SyntheticEvent<Element, Event>, value: string) => {
		setLabel(value);
	};

	const testAutoFree = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setLabel(event.target.value);
	};

	const removeLabel = (label: string) => {
		setGroupIncome((record) => {
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
			!groupIncome.labels.has(label) &&
			setGroupIncome((record) => {
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

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setGroupIncome((record) => {
			const value =
				event.target.name === "amount" ? parseInt(event.target.value) : event.target.value;
			const updated = { ...record, [event.target.name]: value };
			const result = transactionService.validateGroupRecordDetails(updated);

			if (result === true) {
				setErrorMessages(undefined);
				setIsValid(true && selectedAccount !== undefined);
			} else {
				setErrorMessages(result);
				setIsValid(false && selectedAccount !== undefined);
			}
			return updated;
		});
	};

	const handleAccountChange = (event: SelectChangeEvent) => {
		const foundAccount = personalAccounts.find((acc) => acc.name === event.target.value);
		setSelectedAccount(() => {
			const result = transactionService.validateGroupRecordDetails(groupIncome);
			if (result === true) {
				setErrorMessages(undefined);
				setIsValid(true && selectedAccount !== undefined);
			} else {
				setErrorMessages(result);
				setIsValid(false && selectedAccount !== undefined);
			}
			return foundAccount;
		});
	};

	const contribute = async () => {
		groupIncome.groupId = group.id!;
		groupIncome.madeBy = user?.uid!;

		const transactionResult = await paymentInfoService.updateAmount(
			groupIncome.amount,
			"debit",
			user?.uid!,
			selectedAccount!.name
		);

		if (transactionResult === true) {
			const result = await transactionService.addGroupIncome(groupIncome);
			if (typeof result === "string") {
				const foundProfile = await profileService.findProfile(user?.uid!);
				const foundGroupAcc = await paymentInfoService.getGroupAccount(group.id!);

				await paymentInfoService.addGroupMaintainer(foundGroupAcc, foundProfile);
				toggleModal();
				setContributionAmount(groupIncome.amount);
				setSuccessInfoBarOpen(true);
				setGroupIncome(GroupIncomeSchemaDefaults.parse({}));
			} else {
				setErrorInfoBarOpen(true);
			}
		} else {
			setErrorInfoBarOpen(true);
		}
	};

	return {
		groupIncome,
		label,
		availableLabels,
		isValid,
		personalAccounts,
		selectedAccount,
		errorMessages,
		successInfoBarOpen,
		errorInfoBarOpen,
		contributionAmount,
		setSuccessInfoBarOpen,
		setErrorInfoBarOpen,
		testAuto,
		testAutoFree,
		addLabel,
		removeLabel,
		handleChange,
		contribute,
		handleAccountChange,
		setGroupIncome,
	};
};

export default useGroupContribution;
