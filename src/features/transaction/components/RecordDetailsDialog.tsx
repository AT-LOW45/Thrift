import {
	Box,
	Chip,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	Portal,
	Stack,
	Typography,
} from "@mui/material";
import { Fragment } from "react";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { BudgetChip } from "../../budget";
import { Income, Transaction } from "../transaction.schema";
import CloseIcon from "@mui/icons-material/Close";

type RecordDetailsDialogProps = {
	open: boolean;
	toggleModal(): void;
	record: Transaction | Income;
};

const RecordDetailsDialog = ({ open, toggleModal, record }: RecordDetailsDialogProps) => {
	const isTransaction = (record: Transaction | Income): record is Transaction =>
		"category" in record;

	const dateConverted = new Date(
		(record.transactionDate as FirestoreTimestampObject).seconds * 1000
	);

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth={true} maxWidth='sm'>
				<Stack direction='row' justifyContent='space-between' alignItems='center' pr={2}>
					<DialogTitle>Record Details</DialogTitle>
					<IconButton onClick={toggleModal}>
						<CloseIcon />
					</IconButton>
				</Stack>
				<DialogContent dividers>
					<Stack direction='column' spacing={2} sx={{ px: 2, py: 1 }}>
						<DialogContentText sx={{ width: "100%" }}>
							Transaction ID: {record.id}
						</DialogContentText>
						<Stack direction={{ sm: "column", md: "row" }} alignItems='flex-start'>
							<Stack
								direction='column'
								justifyContent='center'
								alignItems='center'
								spacing={2}
								flexGrow={1}
							>
								{isTransaction(record) ? (
									<Fragment>
										<Typography variant='regularSubHeading'>
											Category
										</Typography>
										<BudgetChip option={record.category} />
										<Typography>{record.category}</Typography>
									</Fragment>
								) : (
									<Fragment>
										<Typography variant='regularSubHeading'>Type</Typography>
										<Typography>{record.type}</Typography>
									</Fragment>
								)}
							</Stack>
							<Stack
								direction='column'
								alignItems='center'
								flexGrow={1}
								justifyContent='center'
								spacing={2}
							>
								<Typography variant='regularSubHeading'>Amount</Typography>
								<Typography variant='numberHeading'>RM {record.amount}</Typography>
							</Stack>
							{isTransaction(record) && (
								<Stack
									direction='column'
									alignItems='center'
									flexGrow={1}
									justifyContent='center'
									spacing={2}
								>
									<Typography variant='regularSubHeading'>Budget Plan</Typography>
									<Typography>{record.budgetPlanName}</Typography>
								</Stack>
							)}
						</Stack>
						<Divider />
						<Stack direction='row' sx={{ pt: 2 }} spacing={2}>
							<DialogContentText>
								{isTransaction(record) ? "Deducted from:" : "Credited to:"}
							</DialogContentText>
							<Typography>{record.accountName}</Typography>
						</Stack>
						<Stack direction='row' spacing={2}>
							<DialogContentText>Transaction Date: </DialogContentText>
							<Typography>
								{dateConverted.toLocaleDateString()},{" "}
								{dateConverted.toLocaleTimeString("en-US")}
							</Typography>
						</Stack>
						<DialogContentText>Description:</DialogContentText>
						<Box
							sx={{
								mx: 2,
								p: 2,
								backgroundColor: "rgba(232, 232, 232, 0.7)",
								borderRadius: "10px",
							}}
						>
							{record.description}
						</Box>
						<DialogContentText>Labels:</DialogContentText>
						<Stack direction='row' spacing={1} flexWrap='wrap'>
							{[...record.labels].map((label) => (
								<Chip label={label} key={label} color='secondary' />
							))}
						</Stack>
					</Stack>
				</DialogContent>
			</Dialog>
		</Portal>
	);
};

export default RecordDetailsDialog;
