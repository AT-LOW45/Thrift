import { DialogContentText, TextField } from "@mui/material";
import { ChangeEvent, Fragment, FocusEvent, useState } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { Group } from "../../group.schema";
import groupService from "../../group.service";
import { ZodError } from "zod";

const GroupDetailsSetup = () => {
	const { formData, updateContext } = useMultiStep<Group>();
	const [errorMessage, setErrorMessages] =
		useState<ZodError<Group>["formErrors"]["fieldErrors"]>();

	const handleGroupDetailsChange = (
		event:
			| ChangeEvent<HTMLInputElement>
			| FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
	) => {
		const value =
			event.target.name === "spendingLimit" || event.target.name === "transactionLimit"
				? parseInt(event.target.value)
				: event.target.value;
		updateContext({ key: event.target.name as keyof Group, value }, (group) => [
			(() => {
				const result = groupService.validateGroupDetails(group);

				if (result === true) {
					setErrorMessages(undefined);
					return true;
				} else {
					setErrorMessages(result);
					return false;
				}
			})(),
		]);
	};
	return (
		<Fragment>
			<DialogContentText>
				Manage your expenses in a group. Firstly, provide the group details to help people
				identify it
			</DialogContentText>
			<TextField
				autoFocus
				value={formData.name}
				label='Group name'
				name='name'
				onChange={handleGroupDetailsChange}
				onFocus={handleGroupDetailsChange}
				sx={{ minWidth: "50%" }}
				required
				helperText={errorMessage?.name ? errorMessage.name : ""}
				variant='standard'
			/>
			<TextField
				sx={{ minWidth: "50%" }}
				label='Spending limit per month'
				value={isNaN(formData.spendingLimit) ? "" : formData.spendingLimit}
				onChange={handleGroupDetailsChange}
				name='spendingLimit'
				type='number'
				helperText={errorMessage?.spendingLimit ? errorMessage.spendingLimit : ""}
				required
				variant='standard'
			/>
			<TextField
				sx={{ minWidth: "50%" }}
				label='Transaction limit per member'
				name='transactionLimit'
				value={isNaN(formData.transactionLimit) ? "" : formData.transactionLimit}
				onChange={handleGroupDetailsChange}
				type='number'
				helperText={errorMessage?.transactionLimit ? errorMessage.transactionLimit : ""}
				required
				variant='standard'
			/>
		</Fragment>
	);
};

export default GroupDetailsSetup;
