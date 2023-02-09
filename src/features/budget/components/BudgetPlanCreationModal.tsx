import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import { Fragment } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { useMultiStepContainer } from "../../../context/MultiStepContext";

type BudgetPlanCreationModalProps = Pick<FormDialogProps, "open" | "toggleModal">;

const BudgetPlanCreationModal = ({ open, toggleModal }: BudgetPlanCreationModalProps) => {
	const steps = ["Budget Plan Details", "Budgets", "Threshold"];
	const {
		back,
		isFirstStep,
		next,
		currentStep,
		isLastStep,
		currentStepIndex,
		isValid,
	} = useMultiStepContainer();

	return (
		<FormDialog
			open={open}
			toggleModal={() => {
				// setFormData(undefined);
				
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
						<Button disabled={isValid} type='submit'>
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
