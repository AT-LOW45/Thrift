import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemText,
	Portal,
	Stack,
	Typography,
} from "@mui/material";
import PaymentInfoSummaryDialog from "../features/payment_info/components/PaymentInfoSummaryDialog";
import usePaymentInfoRetrieval from "../features/payment_info/hooks/usePaymentInfoRetrieval";
import AddPaymentInfoDialog from "../features/payment_info/components/AddPaymentInfoDialog";
import { Fragment } from "react";
import { InfoBar } from "../components";

const Account = () => {
	const {
		addPaymentInfoDialogOpen,
		cannotRemoveErrorDialogOpen,
		confirmAccountCloseDialogOpen,
		getPaymentDetails,
		paymentDetailsDialogOpen,
		removePaymentInfo,
		selectedPersonalAccountId,
		firestoreCollection,
		infoInfoBarOpen,
		setInfoInfoBarOpen,
		toggleAddPaymentDialog,
		toggleCannotRemoveDialog,
		toggleConfirmCloseDialog,
		togglePaymentDetailsDialog,
		setPendingDeleteAccountId,
	} = usePaymentInfoRetrieval();

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack>
				<Typography variant='regularHeading'>Accounts</Typography>
				<Button
					variant='contained'
					sx={{ width: "fit-content" }}
					onClick={toggleAddPaymentDialog}
				>
					Add New Payment Info
				</Button>
				<List sx={{ width: "100%", bgcolor: "background.paper", mt: 3 }}>
					{firestoreCollection.map((acc) => (
						<Fragment key={acc.id}>
							<ListItem sx={{ width: "100%" }}>
								<Stack direction='row' alignItems='center' sx={{ width: "100%" }}>
									<ListItemText primary={acc.name} />
									<ListItemText primary={`RM${acc.balance}`} />
									<ListItemText primary={acc.type} />
									<Divider
										orientation='vertical'
										flexItem
										sx={{ backgroundColor: "black" }}
									/>
									<Stack direction='row' spacing={2} px={1}>
										<Button
											variant='outlined'
											onClick={() => getPaymentDetails(acc.id!)}
										>
											View Summary
										</Button>
										<Button
											variant='outlined'
											onClick={() => {
												if (firestoreCollection.length !== 1) {
													setPendingDeleteAccountId(acc.id!);
													toggleConfirmCloseDialog();
												} else {
													toggleCannotRemoveDialog();
												}
											}}
										>
											Remove
										</Button>
									</Stack>
								</Stack>
							</ListItem>
							<Divider component='li' sx={{ backgroundColor: "gray" }} />
						</Fragment>
					))}
				</List>
			</Stack>
			<PaymentInfoSummaryDialog
				open={paymentDetailsDialogOpen}
				toggleModal={togglePaymentDetailsDialog}
				paymentInfoId={selectedPersonalAccountId}
			/>
			<AddPaymentInfoDialog
				open={addPaymentInfoDialogOpen}
				toggleModal={toggleAddPaymentDialog}
			/>
			<Portal>
				<Dialog open={confirmAccountCloseDialogOpen} onClose={toggleConfirmCloseDialog}>
					<DialogTitle>Remove this Payment Info?</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Removed payment accounts cannot be recovered. Proceed?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={toggleConfirmCloseDialog}>Disagree</Button>
						<Button onClick={removePaymentInfo}>Agree</Button>
					</DialogActions>
				</Dialog>
			</Portal>
			<Portal>
				<Dialog open={cannotRemoveErrorDialogOpen} onClose={toggleCannotRemoveDialog}>
					<DialogContent>
						<DialogContentText>
							You cannot remove your only payment account!
						</DialogContentText>
					</DialogContent>
				</Dialog>
			</Portal>
			<InfoBar
				infoBarOpen={infoInfoBarOpen}
				setInfoBarOpen={setInfoInfoBarOpen}
				message='Payment account removed'
				type='info'
			/>
		</Box>
	);
};

export default Account;
