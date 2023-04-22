import { Button, Stack, TextField, Typography } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import FormDialog, { FormDialogProps } from "../../../components/form/FormDialog";
import usePlannedPaymentAddition from "../hooks/usePlannedPaymentAddition";
import AddIcon from "@mui/icons-material/Add";
import { InfoBar } from "../../../components";
import { Fragment } from "react";

type PlannedPaymentCreationModalProps = Pick<FormDialogProps, "open" | "toggleModal">;

const PlannedPaymentCreationModal = ({ open, toggleModal }: PlannedPaymentCreationModalProps) => {
	const {
		addGroup,
		amountLeft,
		errorMessages,
		group,
		handleGroupDateChange,
		handleGroupNameAndAmountChange,
		hasSingleGroup,
		isValid,
		removeGroup,
		setGroup,
		setAmountLeft,
		addPlannedPayments,
		errorInfoBarOpen,
		setErrorInfoBarOpen,
		successInfoBarOpen,
		setSuccessInfoBarOpen,
	} = usePlannedPaymentAddition(toggleModal, open);

	return (
		<Fragment>
			<FormDialog
				title='Planned Payment Creation'
				open={open}
				toggleModal={() => {
					setGroup([{ name: "", amount: 0, startDate: new Date() }]);
					toggleModal();
				}}
				actions={[
					<Button key={1} onClick={toggleModal}>
						Cancel
					</Button>,
					<Button key={2} disabled={!isValid} onClick={addPlannedPayments}>
						Finish
					</Button>,
				]}
			>
				<Stack sx={{ py: 5, px: 10 }}>
					<Typography textAlign='center'>Add new planned payments here</Typography>
					<Typography
						variant='regularSubHeading'
						textAlign='center'
						color={amountLeft <= 0 ? "red" : "black"}
					>
						Spendable Amount: RM {amountLeft}
					</Typography>
					<Stack sx={{ my: 5, mx: { sm: 0, lg: 20 } }} spacing={3}>
						{group.map((planned, index) => (
							<Stack key={planned.id} spacing={1}>
								<Stack direction='row' spacing={2}>
									<TextField
										name='name'
										label='Payment'
										variant='standard'
										value={planned.name}
										onChange={(e) => handleGroupNameAndAmountChange(index, e)}
									/>
									<TextField
										name='amount'
										type='number'
										label='Amount'
										variant='standard'
										value={isNaN(planned.amount) ? "" : planned.amount}
										onChange={(e) => handleGroupNameAndAmountChange(index, e)}
									/>
									<LocalizationProvider dateAdapter={AdapterDayjs}>
										<DatePicker
											minDate={dayjs(new Date())}
											label='Start date'
											value={planned.startDate as Date}
											onChange={(date) => handleGroupDateChange(index, date)}
											renderInput={(params) => <TextField {...params} />}
										/>
									</LocalizationProvider>
									<Button
										disabled={hasSingleGroup}
										onClick={() => {
											setAmountLeft((amount) => amount + planned.amount);
											removeGroup(index);
										}}
									>
										Remove
									</Button>
								</Stack>
								<Stack component='ul'>
									{errorMessages &&
										errorMessages[index] &&
										errorMessages[index]!.map((error, index) => (
											<Typography
												variant='regularLight'
												component='li'
												key={index}
											>
												{error}
											</Typography>
										))}
								</Stack>
							</Stack>
						))}
					</Stack>
					<Button
						variant='contained'
						sx={{ alignSelf: "center" }}
						onClick={addGroup}
						endIcon={<AddIcon />}
						disabled={group.length === 5}
					>
						Add
					</Button>
				</Stack>
			</FormDialog>
			<InfoBar
				infoBarOpen={successInfoBarOpen}
				setInfoBarOpen={setSuccessInfoBarOpen}
				type='success'
				message='New planned payments added to budget plan'
			/>
			<InfoBar
				infoBarOpen={errorInfoBarOpen}
				setInfoBarOpen={setErrorInfoBarOpen}
				type='error'
				message='Unable to add categories. Please try again later.'
			/>
		</Fragment>
	);
};

export default PlannedPaymentCreationModal;
