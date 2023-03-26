import { Stepper, Step, StepLabel, Stack } from "@mui/material";
import FormDialog from "../../../components/form/FormDialog";
import { useMultiStepContainer } from "../../../context/MultiStepContext";

const GroupCreationDialog = () => {
	const { currentStepIndex, currentStep } = useMultiStepContainer();

	const steps = ["Group Details", "Group Payment Details"];

	return (
		<FormDialog actions={[]} open={false} toggleModal={() => {}}>
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

export default GroupCreationDialog;
