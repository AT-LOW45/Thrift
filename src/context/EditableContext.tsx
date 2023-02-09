import React, {
	createContext,
	PropsWithChildren,
	ReactNode, useContext, useMemo
} from "react";
import { ActorRefFrom } from "xstate";
import editableStateMachine from "../components/form/editable/editableStateMachine";
import useEditableContext from "../hooks/useEditableContext";
import { Curry } from "../hooks/useFunctional";

type EditableProps<T extends object> = { children: ReactNode; initialValues: T };
export type EditableContextType<T extends object> = {
	handleModeSwitch(event: React.MouseEvent): void;
	editableService: ActorRefFrom<typeof editableStateMachine>;
	handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void;
	setFormContext: Curry<[x: (event: T) => void], void>;
	formData: T;
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
	} = useEditableContext(initialValues);

	const memoizedContext = useMemo(
		() => ({
			editableService,
			formData,
			handleInputChange,
			handleModeSwitch,
			setFormContext,
		}),
		[isSubmitting, formData]
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
	const { editableService, formData, handleInputChange, handleModeSwitch, setFormContext } =
		useContext<EditableContextType<T>>(EditableContext);
	return { editableService, formData, handleInputChange, handleModeSwitch, setFormContext };
};
