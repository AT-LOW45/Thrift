/**
 * Programmer Name: Koh Choon Mun
 * Program: MultiStepContext.tsx
 * Description: Hook that defines all logic for the multi-step feature
 * First written: 9/2/2023
 * Edited on: 29/4/2023
 */

import { SelectChangeEvent } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

type Conditions = (boolean | boolean[])[];

/**
 * 1. business logic hook - separates code from MultiStepContext for improved readability
 * 2. defines all variables and functions required for the MultiStepContext to work
 * 3. ONLY to be used in MultiStepContext.tsx
 */
const useMultiStepContext = <T extends object>(defaultValues: T, steps: ReactElement[]) => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [formData, setFormData] = useState<T>(defaultValues); // keeps track of all values entered by the user even between different steps
	const [isValid, setIsValid] = useState(false);
	const [conditions, setConditions] = useState<Conditions>([]);

	/**
	 * 1.validates all conditions supplied by the consumer to ensure integrity of entered value
	 * 2. runs every time the formData variable changes
	 * 3. also runs when the user navigates between steps
	 */
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

	// navigates to the following step and empties the validation rules
	const next = () => {
		setCurrentStepIndex((index) => {
			if (index >= steps.length - 1) return index;
			setConditions([]);
			return index + 1;
		});
	};

	// returns to the previous step and empties the validation rules
	const back = () => {
		setCurrentStepIndex((index) => {
			if (index <= 0) return index;
			setConditions([]);
			return index - 1;
		});
	};

	/**
	 * 1. called when the user makes changes to the form data (typing, selecting an option etc.)
	 * 2. sets the validators supplied by the consumer
	 */
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
			const evaluation = assignValidators(result)
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
		setCurrentStepIndex
	};
};

export default useMultiStepContext;
