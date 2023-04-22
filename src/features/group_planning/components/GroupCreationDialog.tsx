import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import { Fragment, useContext } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { AuthContext } from "../../../context/AuthContext";
import { useMultiStepContainer } from "../../../context/MultiStepContext";
import { PersonalAccount } from "../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import profileService from "../../profile/profile.service";
import { Group } from "../group.schema";
import groupService from "../group.service";

type GroupCreationDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	selectedAccount: PersonalAccount;
};

const GroupCreationDialog = ({ open, toggleModal, selectedAccount }: GroupCreationDialogProps) => {
	const {
		currentStepIndex,
		currentStep,
		next,
		isValid,
		isLastStep,
		isFirstStep,
		back,
		formData,
	} = useMultiStepContainer();
	const { user } = useContext(AuthContext);

	const steps = ["Group Details", "Group Payment Details"];

	const createGroup = async () => {
		(formData as Group).owner = user?.uid!;
		const { groupAccount } = formData as Group;
		const groupResult = await groupService.addDoc(formData as Group);

		if (typeof groupResult === "string") {
			groupAccount.groupId = groupResult;
			const groupAccResult = await paymentInfoService.createGroupAccount(groupAccount);

			if (typeof groupAccResult === "string") {
				const transactionResult = await paymentInfoService.updateAmount(
					groupAccount.balance,
					"debit",
					selectedAccount.userUid,
					selectedAccount.name
				);

				if (transactionResult === true) {
					const currentUser = await profileService.findProfile(user?.uid!);
					await groupService.enlistMembers(new Set([currentUser]), groupResult);
					const groupAcc = await paymentInfoService.getGroupAccount(groupAccResult);
					await paymentInfoService.addGroupMaintainer(groupAcc, currentUser);

					toggleModal();
				} else {
					console.log("unable to deduct from personal account");
				}
			} else {
				console.log("unable to create group account");
			}
		} else {
			console.log("unable to create group");
		}
	};

	return (
		<FormDialog
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
						<Button type='submit' disabled={isValid} onClick={createGroup}>
							Finish
						</Button>
					)}
				</Fragment>,
			]}
			open={open}
			toggleModal={toggleModal}
			title="Group Creation"
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

export default GroupCreationDialog;
