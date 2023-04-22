/**
 * Programmer Name: Koh Choon Mun
 * Program: MultiStepContext.tsx
 * Description: A wrapper component enfolding all components that use the multi-step feature
 * First written:
 * Edited on: 
 */

import { SelectChangeEvent } from "@mui/material";
import {
	createContext,
	Dispatch,
	PropsWithChildren,
	ReactElement,
	ReactNode,
	SetStateAction,
	useContext,
} from "react";
import useMultiStepContext from "../hooks/useMultiStepContext";

type MultiStepProps<T extends object> = {
	children: ReactNode;
	steps: ReactElement[];
	defaultValues: T;
};

type Conditions = (boolean | boolean[])[];
// TypeScript type alias that outlines all necessary variables and functions for the multi-step feature to work
export type MultiStepContextType<T extends object> = {
	updateContext: (
		event:
			| SelectChangeEvent
			| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| { key: keyof T; value: any },
		assignValidators: (context: T) => Conditions
	) => void;
	back(): void;
	next(): void;
	currentStep: ReactElement;
	isLastStep: boolean;
	isFirstStep: boolean;
	currentStepIndex: number;
	isValid: boolean;
	formData: T;
	setFormData: Dispatch<SetStateAction<T>>;
	setCurrentStepIndex: Dispatch<SetStateAction<number>>
};

/**
 * 1. creates the default multi step context
 * 2. values for this context will be initialised using React's context provider 
 */
export const MultiStepContext = createContext({} as MultiStepContextType<any>);

export const MultiStep = <T extends object>({
	children,
	steps,
	defaultValues,
}: PropsWithChildren<MultiStepProps<T>>) => {
	return (
		<MultiStepContext.Provider value={useMultiStepContext(defaultValues, steps)}>
			{children}
		</MultiStepContext.Provider>
	);
};

/**
 * 1. convenience hook (useContext hook not explicitly called in the components that consume these properties)
 * 2. uses React's useContext hook internally to return properties and functions 
 * required for a multi-step component
 * 3. logic defined in useMultiStepContext.ts
 */
export const useMultiStep = <T extends object>() => {
	const { formData, updateContext, currentStepIndex } =
		useContext<MultiStepContextType<T>>(MultiStepContext);
	return { formData, updateContext, currentStepIndex };
};

/**
 * 1. convenience hook (useContext hook not explicitly called in the components that consume these properties)
 * 2. also uses the useContext hook
 * 3. this hook is to provide variables and functions required for the parent component that
 * houses all multi-step components
 * 4. logic defined in useMultiStepContext.ts
 */
export const useMultiStepContainer = () => {
	const {
		back,
		currentStep,
		currentStepIndex,
		isFirstStep,
		isLastStep,
		isValid,
		next,
		formData,
		setFormData,
		setCurrentStepIndex
	} = useContext(MultiStepContext);
	return {
		back,
		currentStep,
		currentStepIndex,
		isFirstStep,
		isLastStep,
		isValid,
		formData,
		next,
		setFormData,
		setCurrentStepIndex
	};
};
