import { Button, DialogContentText, Stack, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ChangeEvent, useState, Fragment } from "react";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import { CrowdFund, CrowdfundSchemaDefaults } from "../community.schema";
import communityService from "../community.service";
import { ZodError } from "zod";
import { InfoBar } from "../../../components";

type CrowdfundCreationDialogProps = Pick<FormDialogProps, "toggleModal" | "open">;

const CrowdfundCreationDialog = ({ open, toggleModal }: CrowdfundCreationDialogProps) => {
	const [crowdfund, setCrowdfund] = useState<CrowdFund>(CrowdfundSchemaDefaults.parse({}));
	const [isValid, setIsValid] = useState(false);
	const [successInfoBarOpen, setSuccessInfoBarOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);
	const [newCrowdfundId, setNewCrowdfundId] = useState("");
	const [errorMessages, setErrorMessages] =
		useState<ZodError<CrowdFund>["formErrors"]["fieldErrors"]>();

	const validateState = (crowdfund: CrowdFund) => {
		const result = communityService.validateCrowdfund(crowdfund);

		if (result === true) {
			setErrorMessages(undefined);
			setIsValid(true);
		} else {
			setErrorMessages(result);
			setIsValid(false);
		}
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setCrowdfund((fund) => {
			const value =
				event.target.name === "targetAmount"
					? parseInt(event.target.value)
					: event.target.value;

			const updated = { ...fund, [event.target.name]: value };
			validateState(updated);
			return updated;
		});
	};

	const handleDateChange = (date: Dayjs | null) => {
		if (date !== null) {
			setCrowdfund((fund) => {
				const updated = { ...fund, endDate: date.toDate() } as CrowdFund;
				validateState(updated);
				return updated;
			});
		}
	};

	const initiateCrowdfund = async () => {
		const result = await communityService.initiateCrowdfund(crowdfund);
		if (typeof result === "string") {
			toggleModal();
			setNewCrowdfundId(result);
			setCrowdfund(CrowdfundSchemaDefaults.parse({}));
			setSuccessInfoBarOpen(true);
		} else {
			setErrorInfoBarOpen(true)
		}
	};

	return (
		<Fragment>
			<FormDialog
				open={open}
				toggleModal={toggleModal}
				actions={[
					<Button
						key={2}
						onClick={() => {
							toggleModal();
							setCrowdfund(CrowdfundSchemaDefaults.parse({}));
						}}
					>
						Cancel
					</Button>,
					<Button disabled={!isValid} key={1} onClick={initiateCrowdfund}>
						Initiate
					</Button>,
				]}
				title='Crowdfund Creation'
			>
				<Stack spacing={3} alignItems='center'>
					<DialogContentText>
						Trying to reach a goal? Start a crowdfund and enlist the help of other
						like-minded individuals!
					</DialogContentText>
					<TextField
						label='Title'
						helperText={errorMessages?.name ? errorMessages.name : ""}
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
						helperText={errorMessages?.targetAmount ? errorMessages.targetAmount : ""}
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
						helperText={errorMessages?.description ? errorMessages.description : ""}
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
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				message={`Initiated crowdfund with ID ${newCrowdfundId}`}
				type='success'
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				message='Unable to initiate crowdfund. Please try again later'
				type='success'
			/>
		</Fragment>
	);
};

export default CrowdfundCreationDialog;
