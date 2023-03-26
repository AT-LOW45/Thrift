import { useState, SyntheticEvent, ChangeEvent, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
	GroupIncome,
	GroupIncomeSchemaDefaults,
	labels,
} from "../../transaction/transaction.schema";
import transactionService from "../../transaction/transaction.service";

const useGroupContribution = (groupId: string, toggleModal: () => void) => {
	const [groupIncome, setGroupIncome] = useState<GroupIncome>(
		GroupIncomeSchemaDefaults.parse({})
	);
	const [label, setLabel] = useState("");
	const [availableLabels, setAvailableLabels] = useState<Set<string>>(new Set(labels));
	const [isValid, setIsValid] = useState(false);
	const { user } = useContext(AuthContext);

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
			setIsValid(result);
			return updated;
		});
	};

	const contribute = async () => {
        groupIncome.groupId = groupId
        groupIncome.madeBy = user?.uid!
		const result = await transactionService.addGroupIncome(groupIncome)
        if(typeof result === "string") {
            toggleModal()
        } else {
            console.log("unable to contribute to group")
        }
	};

	return {
		groupIncome,
		label,
		availableLabels,
		isValid,
		testAuto,
		testAutoFree,
		addLabel,
		removeLabel,
		handleChange,
		contribute,
	};
};

export default useGroupContribution;
