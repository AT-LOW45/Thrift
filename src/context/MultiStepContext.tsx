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
};

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

export const useMultiStep = <T extends object>() => {
	const { formData, updateContext, currentStepIndex } =
		useContext<MultiStepContextType<T>>(MultiStepContext);
	return { formData, updateContext, currentStepIndex };
};

export const useMultiStepContainer = () => {
	const { back, currentStep, currentStepIndex, isFirstStep, isLastStep, isValid, next } =
		useContext(MultiStepContext);
	return { back, currentStep, currentStepIndex, isFirstStep, isLastStep, isValid, next };
};
