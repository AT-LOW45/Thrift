import {
	Button,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	List,
	ListItem,
	ListItemText,
	Portal,
	Stack,
} from "@mui/material";
import { Fragment, useState } from "react";
import { InfoBar } from "../../../components";
import { FormDialogProps } from "../../../components/form/FormDialog";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { GroupTransaction } from "../../transaction/transaction.schema";
import transactionService from "../../transaction/transaction.service";

type PendingTransactionDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	pendingTransactions: GroupTransaction[];
};

const PendingTransactionDialog = ({
	open,
	toggleModal,
	pendingTransactions,
}: PendingTransactionDialogProps) => {
	const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
	const [description, setDescription] = useState<string>("");
	const [infoInfoBarOpen, setInfoInfoBarOpen] = useState(false);
	const [updatedTransaction, setUpdatedTransaction] = useState<{
		transactionId: string;
		decision: boolean;
	}>();

	const toggleDescriptionModal = () => setDescriptionModalOpen((open) => !open);

	const findTransaction = (transactionId: string) => {
		const foundTransaction = pendingTransactions.find(
			(transac) => transac.id === transactionId
		);
		if (foundTransaction) {
			setDescription(foundTransaction.description!);
		}
		toggleDescriptionModal();
	};

	const decideTransactionStatus = async (transacId: string, decision: boolean) => {
		const result = await transactionService.decideTransactionStatus(transacId, decision);
		if (result) {
			toggleModal();
			setUpdatedTransaction({ transactionId: transacId, decision: decision });
			setInfoInfoBarOpen(true);
		} else {
			console.log("unable to update transaction");
		}
	};

	return (
		<Fragment>
			<Portal>
				<Dialog open={open} onClose={toggleModal} fullWidth maxWidth='md'>
					<DialogTitle id='alert-dialog-title'>Pending Transactions</DialogTitle>
					<DialogContent>
						<List>
							<Divider />
							{pendingTransactions.map((transac) => (
								<Fragment key={transac.id}>
									<ListItem sx={{ py: 1 }}>
										<Stack
											direction='row'
											py={1}
											spacing={5}
											alignItems='center'
										>
											<ListItemText primary={transac.madeBy} />
											<Button
												sx={{ display: "block", margin: "auto" }}
												onClick={() => findTransaction(transac.id!)}
											>
												View Description
											</Button>
											<ListItemText primary={`RM ${transac.amount}`} />
											<ListItemText
												primary={new Date(
													(
														transac.transactionDate as FirestoreTimestampObject
													).seconds * 1000
												).toLocaleDateString()}
											/>
											<Stack direction='row' spacing={1}>
												<Button
													variant='contained'
													onClick={() =>
														decideTransactionStatus(transac.id!, true)
													}
												>
													Approve
												</Button>
												<Button
													variant='contained'
													color='error'
													onClick={() =>
														decideTransactionStatus(transac.id!, false)
													}
												>
													Reject
												</Button>
											</Stack>
										</Stack>
									</ListItem>
									<Divider />
								</Fragment>
							))}
						</List>
					</DialogContent>
				</Dialog>
				<Dialog open={descriptionModalOpen} onClose={toggleDescriptionModal}>
					<DialogContentText sx={{ p: 3 }}>{description}</DialogContentText>
				</Dialog>
			</Portal>
			{updatedTransaction && (
				<InfoBar
					infoBarOpen={infoInfoBarOpen}
					setInfoBarOpen={setInfoInfoBarOpen}
					message={
						updatedTransaction.decision === true
							? `You approved ${updatedTransaction.transactionId}`
							: `You rejected ${updatedTransaction.transactionId}`
					}
					type='info'
				/>
			)}
		</Fragment>
	);
};

export default PendingTransactionDialog;
