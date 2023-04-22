import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import { Fragment, useState } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { useMultiStepContainer } from "../../../context/MultiStepContext";
import { BudgetPlan, BudgetPlanSchemaDefaults } from "../budget.schema";
import budgetService from "../budget.service";
import { InfoBar } from "../../../components";
import { FirestoreError } from "firebase/firestore";

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
		setCurrentStepIndex,
		formData,
	} = useMultiStepContainer();

	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [newBudgetPlanId, setNewBudgetPlanId] = useState("");

	const addNewBudgetPlan = async () => {
		try {
			const result = await budgetService.addDoc(
				plannedPaymentEnabled
					? formData
					: ({ ...formData, plannedPayments: null } as BudgetPlan)
			);

			if (typeof result === "string") {
				toggleModal();
				setNewBudgetPlanId(result);
				setFormData(BudgetPlanSchemaDefaults.parse({}));
				setCurrentStepIndex(0);
				setSuccessInfoBarOpen(true);
			} else {
				setErrorInfoBarOpen(true);
			}
		} catch (error) {
			setErrorInfoBarOpen(true)
		}
	};

	return (
		<Fragment>
			<FormDialog
				open={open}
				toggleModal={() => {
					toggleModal();
					setFormData(BudgetPlanSchemaDefaults.parse({}));
					setCurrentStepIndex(0);
				}}
				actions={[
					<Button
						key={4}
						onClick={() => {
							toggleModal();
							setFormData(BudgetPlanSchemaDefaults.parse({}));
							setCurrentStepIndex(0);
						}}
					>
						Cancel
					</Button>,
					<Fragment key={1}>
						{!isFirstStep && <Button onClick={back}>Back</Button>}
					</Fragment>,
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
				title='Budget Plan Creation'
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
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				type='success'
				message={`Created budget plan with ID ${newBudgetPlanId}`}
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='Unable to create budget plan. Please try again later.'
			/>
		</Fragment>
	);
};

export default BudgetPlanCreationModal;
