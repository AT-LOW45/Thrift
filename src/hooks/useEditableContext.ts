import { SelectChangeEvent } from "@mui/material";
import { useInterpret } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import editableStateMachine from "../components/form/editable/editableStateMachine";
import { useFunctional } from "./useFunctional";

type Conditions = (boolean | boolean[])[];

const useEditableContext = <T extends object>(initialValues: T) => {
	const { curry } = useFunctional();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<T>(initialValues);
	const [placeholderFormData, setPlaceholderFromData] = useState<T>(initialValues)
	const [renderCount, setRenderCount] = useState(0);
	const [conditions, setConditions] = useState<Conditions>([]);
	const [isValid, setIsValid] = useState(true);
	const formRef = useRef<HTMLFormElement>(null);

	const editableService = useInterpret(editableStateMachine, {
		services: {
			submit: async () => {},
		},
	});

	const useSubmit = (
		bindFormData: () => typeof formData,
		setContext: (data: typeof formData) => Promise<void>
	) => {
		useEffect(() => {
			if (renderCount >= 2) {
				const doSubmit = async () => {
					isSubmitting && (await setContext(bindFormData()));
				};
				doSubmit().then(() => {
					const viewContainers = formRef.current?.querySelectorAll(".container.view");
					const editContainers = formRef.current?.querySelectorAll(".container.edit");

					viewContainers?.forEach((view) => view.classList.remove("hide"));
					editContainers?.forEach((edit) => edit.classList.add("hide"));
					editableService.send("deactivate edit");
				});
			} else {
				setRenderCount((count) => count + 1);
			}
		}, [isSubmitting]);
	};

	useEffect(() => {
		const evaluate = () => {
			const isConditionMet = conditions.every((result) => {
				return Array.isArray(result)
					? result.every((nestedResult) => nestedResult === true)
					: result;
			});
			setIsValid(conditions.length === 0 ? true : isConditionMet);
		};
		evaluate();
	}, [placeholderFormData]);

	const setFormContext = curry(useSubmit)(() => {
		setIsSubmitting((submit) => !submit);
		return placeholderFormData;
	});

	const updateContext = (
		event:
			| SelectChangeEvent
			| React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
			| { key: keyof any; value: any },
		assignValidators: (context: T) => Conditions
	) => {
		setPlaceholderFromData((data) => {
			const result =
				"key" in event
					? { ...data, [event.key]: event.value }
					: { ...data, [event.target.name]: event.target.value };
			const evaluation = assignValidators.call(null, result as T);
			setConditions(evaluation);
			return result as T;
		});
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((data) => {
			return { ...data, [event.target.name]: event.target.value };
		});
	};

	const handleModeSwitch = (event: React.MouseEvent, activate: boolean) => {
		activate && setPlaceholderFromData(formData)
		const parentContainer = event.currentTarget.closest(".container");
		const children = parentContainer?.closest(".editable-field")?.children!;
		let siblingEl;

		for (const child of children) {
			if (child !== parentContainer) {
				siblingEl = child;
				break;
			}
		}
		parentContainer?.classList.add("hide");
		(siblingEl as HTMLDivElement).classList.remove("hide");
	};

	return {
		handleModeSwitch,
		handleInputChange,
		updateContext,
		setFormContext,
		editableService,
		formData,
		formRef,
		setIsSubmitting,
		isSubmitting,
		isValid,
		placeholderFormData
	};
};

export default useEditableContext;
