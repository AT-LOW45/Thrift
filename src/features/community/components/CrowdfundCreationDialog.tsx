import { Button, DialogContentText, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ChangeEvent, useState } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { CrowdFund, CrowdfundSchemaDefaults } from "../community.schema";
import communityService from "../community.service";

type CrowdfundCreationDialogProps = Pick<FormDialogProps, "toggleModal" | "open">;

const CrowdfundCreationDialog = ({ open, toggleModal }: CrowdfundCreationDialogProps) => {
	const [crowdfund, setCrowdfund] = useState<CrowdFund>(CrowdfundSchemaDefaults.parse({}));
	const [isValid, setIsValid] = useState(false);

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setCrowdfund((fund) => {
			const value =
				event.target.name === "targetAmount"
					? parseInt(event.target.value)
					: event.target.value;

			const updated = { ...fund, [event.target.name]: value };
			setIsValid(communityService.validateCrowdfund(updated));
			return updated;
		});
	};

	const handleDateChange = (date: Dayjs | null) => {
		if (date !== null) {
			setCrowdfund((fund) => {
				const updated = { ...fund, endDate: date.toDate() } as CrowdFund;
				setIsValid(communityService.validateCrowdfund(updated));
				return updated;
			});
		}
	};

	const initiateCrowdfund = async () => {
		const result = await communityService.initiateCrowdfund(crowdfund);
		if (typeof result === "string") {
			toggleModal();
		} else {
			console.log("an error occurred while creating the crowdfund");
		}
	};

	return (
		<FormDialog
			open={open}
			toggleModal={toggleModal}
			actions={[
				<Button disabled={!isValid} key={1} onClick={initiateCrowdfund}>
					Initiate
				</Button>,
			]}
		>
			<Stack spacing={3} alignItems='center'>
				<DialogContentText>
					Trying to reach a goal? Start a crowdfund and enlist the help of other
					like-minded individuals!
				</DialogContentText>
				<TextField
					label='Title'
					helperText='Give your crowdfund an interesting title to draw attention'
					variant='standard'
					name='name'
					onChange={handleChange}
					value={crowdfund.name}
					required
					sx={{ minWidth: "50%" }}
				/>
				<TextField
					variant='standard'
					label='Target amount'
					helperText='Set a reasonable goal for your crowdfund'
					name='targetAmount'
					onChange={handleChange}
					value={isNaN(crowdfund.targetAmount) ? "" : crowdfund.targetAmount}
					required
					sx={{ minWidth: "50%" }}
				/>
				<TextField
					multiline
					minRows={5}
					required
					name='description'
					onChange={handleChange}
					helperText='Describe your crowdfund with ample detail to gather people in your cause'
					value={crowdfund.description}
					label='Description'
					sx={{ minWidth: "50%" }}
				/>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DatePicker
						minDate={dayjs(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))}
						label='End date'
						value={(crowdfund.endDate as Date).toDateString()}
						onChange={handleDateChange}
						renderInput={(params) => <TextField {...params} />}
					/>
				</LocalizationProvider>
			</Stack>
		</FormDialog>
	);
};

export default CrowdfundCreationDialog;
