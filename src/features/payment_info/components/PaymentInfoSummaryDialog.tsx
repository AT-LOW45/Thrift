import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Portal,
	Stack,
	Typography,
} from "@mui/material";
import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FormDialogProps } from "../../../components/form/FormDialog";
import * as ChartAnnotation from "chartjs-plugin-annotation";
import usePaymentInfoSummary from "../hooks/usePaymentInfoSummary";
import { FirestoreTimestampObject } from "../../../service/thrift";
import CloseIcon from "@mui/icons-material/Close";

type PaymentInfoSummaryDialogProps = Pick<FormDialogProps, "open" | "toggleModal"> & {
	paymentInfoId: string;
};

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartAnnotation
);

const PaymentInfoSummaryDialog = ({
	open,
	toggleModal,
	paymentInfoId,
}: PaymentInfoSummaryDialogProps) => {
	const { areAccountRecordsLoading, paymentInfoData, paymentInfoOptions, mostRecentRecord } =
		usePaymentInfoSummary(paymentInfoId);

	return (
		<Portal>
			{!areAccountRecordsLoading && (
				<Dialog open={open} onClose={toggleModal} fullWidth maxWidth='lg'>
					<Stack
						direction='row'
						justifyContent='space-between'
						alignItems='center'
						pr={2}
					>
						<DialogTitle>Payment Info Details</DialogTitle>
						<IconButton onClick={toggleModal}>
							<CloseIcon />
						</IconButton>
					</Stack>
					<DialogContent dividers>
						<Stack spacing={3}>
							<Box>
								<Line
									options={paymentInfoOptions}
									data={paymentInfoData}
									style={{ height: "450px" }}
								/>
							</Box>

							<Typography variant='regularSubHeading'>Last Recorded</Typography>
							{mostRecentRecord && (
								<Stack
									sx={{
										px: 2,
										backgroundColor: "#EEF4F5",
										py: 3,
										// width: "fit-content",
									}}
									justifyContent='center'
									alignItems='center'
								>
									<Stack direction='row' spacing={5}>
										<Typography fontSize='1.5rem' fontWeight='700'>
											<sup>RM</sup>
											{mostRecentRecord?.amount}
										</Typography>
										<Typography>
											{new Date(
												(
													mostRecentRecord?.transactionDate as FirestoreTimestampObject
												).seconds * 1000
											).toLocaleDateString()}
										</Typography>
									</Stack>
									<Stack direction='row' spacing={2}>
										<Typography>{mostRecentRecord?.description}</Typography>
									</Stack>
								</Stack>
							)}
						</Stack>
					</DialogContent>
				</Dialog>
			)}
		</Portal>
	);
};

export default PaymentInfoSummaryDialog;
