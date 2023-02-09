import { SelectChangeEvent } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

type Conditions = (boolean | boolean[])[];

const useMultiStepContext = <T extends object>(defaultVaues: T, steps: ReactElement[]) => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [formData, setFormData] = useState<T>(defaultVaues);
	const [isValid, setIsValid] = useState(false);
	const [conditions, setConditions] = useState<Conditions>([]);

	useEffect(() => {
		const evaluate = () => {
			const isConditionMet = conditions.every((result) => {
				return Array.isArray(result)
					? result.every((nestedResult) => nestedResult === true)
					: result;
			});
			setIsValid(conditions.length === 0 ? true : !isConditionMet);
		};
		evaluate();
	}, [formData, currentStepIndex]);

	const next = () => {
		setCurrentStepIndex((index) => {
			if (index >= steps.length - 1) return index;
			setConditions([]);
			return index + 1;
		});
	};

	const back = () => {
		setCurrentStepIndex((index) => {
			if (index <= 0) return index;
			setConditions([]);
			return index - 1;
		});
	};

	const updateContext = (
		event:
			| SelectChangeEvent
			| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| { key: keyof any; value: any },
		assignValidators: (context: T) => Conditions
	) => {
		setFormData((data) => {
			const result =
				"key" in event
					? { ...data, [event.key]: event.value }
					: { ...data, [event.target.name]: event.target.value };
			const evaluation = assignValidators.call(null, result as T);
			setConditions(evaluation);
			return result as T;
		});
	};

	return {
		next,
		updateContext,
		back,
		isValid,
		currentStep: steps[currentStepIndex],
		currentStepIndex,
		isFirstStep: currentStepIndex === 0,
		isLastStep: currentStepIndex === steps.length - 1,
		formData: formData,
		setFormData,
	};
};

export default useMultiStepContext;
