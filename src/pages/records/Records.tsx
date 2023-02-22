import { Box, Button, Stack, styled, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import RecordDetailsDialog from "../../features/transaction/components/RecordDetailsDialog";
import RecordCreationDialog from "../../features/transaction/components/RecrodCreationDialog";
import {
	Income,
	Transaction,
	TransactionSchemaDefaults,
} from "../../features/transaction/transaction.schema";
import useRealtimeUpdate from "../../hooks/useRealtimeUpdate";
import { FirestoreTimestampObject } from "../../service/thrift";
import data_grid_configuration from "./data_grid_configuration";

const Records = () => {
	const { firestoreCollection } = useRealtimeUpdate<Transaction | Income>({
		data: { collection: "Transaction" },
	});
	const [open, setOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<Transaction | Income>(
		TransactionSchemaDefaults.parse({})
	);
	const [creationDialogOpen, setCreationDialogOpen] = useState(false);

	const toggleDialog = () => {
		setOpen((isOpen) => !isOpen);
	};

	const toggleCreationDialog = () => {
		setCreationDialogOpen((isOpen) => !isOpen);
	};

	const openDialog = (recordId: string) => {
		const record = firestoreCollection.find((rec) => rec.id === recordId);
		if (record) {
			console.log(record.labels);
			setSelectedRecord(record);
			toggleDialog();
		}
	};

	const CustomDataGrid = styled(DataGrid)(() => ({
		"&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
			outline: "none",
		},
	}));

	const isTransaction = (record: Transaction | Income): record is Transaction => {
		return "category" in record;
	};

	const isIncome = (record: Transaction | Income): record is Income => {
		return "type" in record;
	};

	const { columnsIncome, columnsTransactions } = data_grid_configuration(
		openDialog,
		toggleDialog
	);

	const incomeRow = firestoreCollection.filter(isIncome).map((income, index) => ({
		number: index + 1,
		id: income.id,
		type: income.type,
		amount: income.amount,
		transactionDate: new Date(
			(income.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
	}));

	const transactionRow = firestoreCollection.filter(isTransaction).map((transaction, index) => ({
		number: index + 1,
		id: transaction.id,
		category: transaction.category,
		budgetPlan: transaction.budgetPlanName,
		amount: transaction.amount,
		transactionDate: new Date(
			(transaction.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
	}));

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

			<RecordCreationDialog open={creationDialogOpen} toggleModal={toggleCreationDialog} />
			<RecordDetailsDialog open={open} toggleModal={toggleDialog} record={selectedRecord} />
		</Box>
	);
};

export default Records;
