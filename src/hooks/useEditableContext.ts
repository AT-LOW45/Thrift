import { useInterpret } from "@xstate/react";
import { useEffect, useRef, useState } from "react";
import editableStateMachine from "../components/form/editable/editableStateMachine";
import { useFunctional } from "./useFunctional";

const useEditableContext = <T extends object>(initialValues: T) => {
	const { curry } = useFunctional();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState<T>(initialValues);
	const [renderCount, setRenderCount] = useState(0);
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

	const setFormContext = curry(useSubmit)(() => {
		setIsSubmitting((submit) => !submit);
		return formData;
	});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((data) => {
			return { ...data, [event.target.name]: event.target.value };
		});
	};

	const handleModeSwitch = (event: React.MouseEvent) => {
		const parentContainer = event.currentTarget.closest(".container");
		const children = parentContainer?.closest(".editable-field")?.children!;
		let sibilingEl;

		for (const child of children) {
			if (child !== parentContainer) {
				sibilingEl = child;
				break;
			}
		}

		parentContainer?.classList.add("hide");
		(sibilingEl as HTMLDivElement).classList.remove("hide");
	};

    return {
		handleModeSwitch,
		handleInputChange,
		setFormContext,
		editableService,
		formData,
        formRef,
        setIsSubmitting,
        isSubmitting
	};
}

export default useEditableContext