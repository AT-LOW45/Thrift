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
import { FormDialogProps } from "../../../components/form/FormDialog";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { BudgetChip } from "../../budget";
import { GroupIncome, GroupTransaction } from "../transaction.schema";
import CloseIcon from "@mui/icons-material/Close";

type GroupRecordDetailsDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	groupRecord: GroupTransaction | GroupIncome;
};

const GroupRecordDetailsDialog = ({
	groupRecord,
	open,
	toggleModal,
}: GroupRecordDetailsDialogProps) => {
	const isGroupTransaction = (
		groupRecord: GroupTransaction | GroupIncome
	): groupRecord is GroupTransaction => "category" in groupRecord;

	const dateConverted = new Date(
		(groupRecord.transactionDate as FirestoreTimestampObject).seconds * 1000
	);

	return (
		<Portal>
			<Dialog open={open} onClose={toggleModal} fullWidth maxWidth='sm'>
				<Stack direction='row' justifyContent='space-between' alignItems='center' pr={2}>
					<DialogTitle>Group Record Details</DialogTitle>
					<IconButton onClick={toggleModal}>
						<CloseIcon />
					</IconButton>
				</Stack>
				<DialogContent dividers>
					<Stack spacing={2} sx={{ px: 2, py: 1 }}>
						<DialogContentText sx={{ width: "100%" }}>
							Transaction ID: {groupRecord.id}
						</DialogContentText>
						<Stack direction={{ sm: "column", md: "row" }} alignItems='flex-start'>
							{isGroupTransaction(groupRecord) && (
								<Stack
									justifyContent='center'
									alignItems='center'
									spacing={2}
									flexGrow={1}
								>
									<Typography variant='regularSubHeading'>Category</Typography>
									<BudgetChip option={groupRecord.category} />
									<Typography>{groupRecord.category}</Typography>
								</Stack>
							)}
							<Stack
								alignItems='center'
								flexGrow={1}
								justifyContent='center'
								spacing={2}
							>
								<Typography variant='regularSubHeading'>Amount</Typography>
								<Typography variant='numberHeading'>
									RM {groupRecord.amount}
								</Typography>
								{isGroupTransaction(groupRecord) &&
									groupRecord.status === false && (
										<Chip label='Amount to be deducted' color='warning' />
									)}
							</Stack>
						</Stack>

						<Divider />
						{isGroupTransaction(groupRecord) && (
							<Stack direction='row' sx={{ pt: 2 }} spacing={2}>
								<DialogContentText>Status:</DialogContentText>
								<Typography>
									{groupRecord.status === false
										? "Pending approval"
										: "Authorised"}
								</Typography>
							</Stack>
						)}
						<Stack direction='row' spacing={2}>
							<DialogContentText>{isGroupTransaction(groupRecord) ? "Made by: " : "Contributed by: "}</DialogContentText>
							<Typography>{groupRecord.madeBy}</Typography>
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
							{groupRecord.description}
						</Box>
						<DialogContentText>Labels:</DialogContentText>
						<Stack direction='row' spacing={1} flexWrap='wrap'>
							{[...groupRecord.labels].map((label) => (
								<Chip label={label} key={label} color='secondary' />
							))}
						</Stack>
					</Stack>
				</DialogContent>
			</Dialog>
		</Portal>
	);
};

export default GroupRecordDetailsDialog;
