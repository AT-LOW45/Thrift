import { Box, Button, Stack, Typography } from "@mui/material";
import RecordCreationDialog from "../../features/transaction/components/RecordCreationDialog";
import RecordDetailsDialog from "../../features/transaction/components/RecordDetailsDialog";
import useRecordRetrieval from "../../features/transaction/hooks/useRecordRetrieval";

const Records = () => {
	const {
		CustomDataGrid,
		columnsIncome,
		columnsTransactions,
		creationDialogOpen,
		incomeRow,
		open,
		setErrorInfoBarOpen,
		selectedRecord,
		toggleCreationDialog,
		toggleDialog,
		transactionRow,
	} = useRecordRetrieval();

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack direction='column' spacing={2}>
				<Typography variant='regularHeading'>Records</Typography>
				<Button
					variant='contained'
					sx={{ width: "fit-content" }}
					onClick={toggleCreationDialog}
				>
					Add new record
				</Button>
			</Stack>

			<Stack direction='column' spacing={3} sx={{ height: "450px", width: "100%", mt: 5 }}>
				<Typography variant='regularSubHeading'>Income</Typography>

				<CustomDataGrid
					sx={{ border: "1px solid gray" }}
					rows={incomeRow}
					columns={columnsIncome}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
					disableSelectionOnClick
					experimentalFeatures={{ newEditingApi: true }}
				/>
			</Stack>

			<Stack
				direction='column'
				spacing={3}
				sx={{ height: "450px", width: "100%", mt: 6, mb: 5 }}
			>
				<Typography variant='regularSubHeading'>Transactions</Typography>

				<CustomDataGrid
					sx={{ border: "1px solid gray" }}
					rows={transactionRow}
					columns={columnsTransactions}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
					disableSelectionOnClick
					experimentalFeatures={{ newEditingApi: true }}
				/>
			</Stack>

			<RecordCreationDialog
				open={creationDialogOpen}
				toggleModal={toggleCreationDialog}
				openInfoBar={setErrorInfoBarOpen}
			/>
			<RecordDetailsDialog open={open} toggleModal={toggleDialog} record={selectedRecord} />
		</Box>
	);
};

export default Records;
