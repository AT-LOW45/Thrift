import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import { Fragment, useState } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { useMultiStepContainer } from "../../../context/MultiStepContext";
import { BudgetPlan, BudgetPlanSchemaDefaults } from "../budget.schema";
import budgetService from "../budget.service";

type BudgetPlanCreationModalProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	plannedPaymentEnabled: boolean;
};

const BudgetPlanCreationModal = ({
	open,
	toggleModal,
	plannedPaymentEnabled,
}: BudgetPlanCreationModalProps) => {
	const steps = ["Budget Plan Details", "Budgets", "Threshold"];
	const {
		back,
		isFirstStep,
		next,
		currentStep,
		isLastStep,
		currentStepIndex,
		isValid,
		setFormData,
		formData,
	} = useMultiStepContainer();

	const addNewBudgetPlan = async () => {
		console.log(formData);
		const result = await budgetService.addDoc(
			plannedPaymentEnabled
				? formData
				: ({ ...formData, plannedPayments: null } as BudgetPlan)
		);

		if (typeof result === "string") {
			toggleModal();
		} else {
			console.log("something went wrong");
		}
	};

	return (
		<FormDialog
			open={open}
			toggleModal={() => {
				setFormData(BudgetPlanSchemaDefaults.parse({}));
				toggleModal();
			}}
			actions={[
				<Fragment key={1}>{!isFirstStep && <Button onClick={back}>Back</Button>}</Fragment>,
				<Fragment key={2}>
					{!isLastStep && (
						<Button onClick={next} disabled={isValid}>
							Next
						</Button>
					)}
				</Fragment>,
				<Fragment key={3}>
					{isLastStep && (
						<Button disabled={isValid} type='submit' onClick={addNewBudgetPlan}>
							Finish
						</Button>
					)}
				</Fragment>,
			]}
		>
			<Stepper sx={{}} activeStep={currentStepIndex} alternativeLabel>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			<Stack direction='column' alignItems='center' spacing={3} sx={{ mt: 2 }}>
				{currentStep}
			</Stack>
		</FormDialog>
	);
};

export default BudgetPlanCreationModal;
