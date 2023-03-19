import { SelectChangeEvent } from "@mui/material";
import React, { createContext, PropsWithChildren, ReactNode, useContext, useMemo } from "react";
import { ActorRefFrom } from "xstate";
import editableStateMachine from "../components/form/editable/editableStateMachine";
import useEditableContext from "../hooks/useEditableContext";
import { Curry } from "../hooks/useFunctional";

type Conditions = (boolean | boolean[])[];
type EditableProps<T extends object> = { children: ReactNode; initialValues: T };
export type EditableContextType<T extends object> = {
	handleModeSwitch(event: React.MouseEvent, activate: boolean): void;
	editableService: ActorRefFrom<typeof editableStateMachine>;
	handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void;
	setFormContext: Curry<[x: (event: T) => void], void>;
	formData: T;
	placeholderFormData: T;
	updateContext: (
		event:
			| SelectChangeEvent
			| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| { key: keyof T; value: any },
		assignValidators: (context: T) => Conditions
	) => void;
	isValid: boolean;
};

export const EditableContext = createContext({} as EditableContextType<any>);

export const Editable = <T extends object>({
	children,
	initialValues,
}: PropsWithChildren<EditableProps<T>>): JSX.Element => {
	const {
		editableService,
		formData,
		handleInputChange,
		handleModeSwitch,
		setFormContext,
		formRef,
		setIsSubmitting,
		isSubmitting,
		updateContext,
		isValid,
		placeholderFormData,
	} = useEditableContext(initialValues);

	const memoizedContext = useMemo(
		() => ({
			editableService,
			formData,
			handleInputChange,
			handleModeSwitch,
			setFormContext,
			updateContext,
			isValid,
			placeholderFormData,
		}),
		[isSubmitting, placeholderFormData, isValid]
	);

	return (
		<EditableContext.Provider value={memoizedContext}>
			<form
				ref={formRef}
				action='POST'
				onSubmit={(e) => {
					e.preventDefault();
					setIsSubmitting((submit) => !submit);
				}}
				style={{ margin: 0 }}
			>
				{children}
			</form>
		</EditableContext.Provider>
	);
};

export const useEditable = <T extends object>() => {
	const {
		editableService,
		formData,
		handleInputChange,
		handleModeSwitch,
		setFormContext,
		updateContext,
		isValid,
		placeholderFormData,
	} = useContext<EditableContextType<T>>(EditableContext);
	return {
		editableService,
		formData,
		handleInputChange,
		handleModeSwitch,
		setFormContext,
		updateContext,
		isValid,
		placeholderFormData,
	};
};
