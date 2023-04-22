import { Box, Button, Fab, Stack, Tooltip, Typography } from "@mui/material";
import RecordCreationDialog from "../../features/transaction/components/RecordCreationDialog";
import RecordDetailsDialog from "../../features/transaction/components/RecordDetailsDialog";
import useRecordRetrieval from "../../features/transaction/hooks/useRecordRetrieval";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import GroupRecordCreationDialog from "../../features/transaction/components/GroupRecordCreationDialog";
import GroupRecordDetailsDialog from "../../features/transaction/components/GroupRecordDetailsDialog";

const Records = () => {
	const {
		CustomDataGrid,
		columnsIncome,
		columnsTransactions,
		creationDialogOpen,
		open,
		selectedRecord,
		toggleCreationDialog,
		toggleDialog,
		hasGroup,
		columnsGroupTransactions,
		columnsGroupIncome,
		transactionRow,
		incomeRow,
		groupIncomeRow,
		groupTransactionRow,
		isGroupView,
		selectedGroupRecord,
		groupRecordDialogOpen,
		setIsGroupView,
		groupRecordCreationDialog,
		toggleGroupRecordDialog,
		toggleGroupRecordCreationDialog,
		group,
	} = useRecordRetrieval();

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack direction='column' spacing={2}>
				<Typography variant='regularHeading'>Records</Typography>
				{!isGroupView ? (
					<Button
						variant='contained'
						sx={{ width: "fit-content" }}
						onClick={toggleCreationDialog}
					>
						Add new record
					</Button>
				) : (
					<Button
						variant='contained'
						sx={{ width: "fit-content" }}
						onClick={toggleGroupRecordCreationDialog}
					>
						Add new group transaction
					</Button>
				)}
			</Stack>

			<Stack
				direction='column'
				spacing={3}
				sx={{ height: "450px", width: "100%", mt: 5 }}
				px={3}
			>
				<Typography variant='regularSubHeading'>Income</Typography>

				<CustomDataGrid
					sx={{ border: "1px solid gray" }}
					rows={!isGroupView ? incomeRow : groupIncomeRow}
					columns={!isGroupView ? columnsIncome : columnsGroupIncome}
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
				px={3}
			>
				<Typography variant='regularSubHeading'>Transactions</Typography>

				<CustomDataGrid
					sx={{ border: "1px solid gray" }}
					rows={!isGroupView ? transactionRow : groupTransactionRow}
					columns={!isGroupView ? columnsTransactions : columnsGroupTransactions}
					pageSize={5}
					rowsPerPageOptions={[5]}
					checkboxSelection
					disableSelectionOnClick
					experimentalFeatures={{ newEditingApi: true }}
				/>
			</Stack>

			{!isGroupView ? (
				<RecordCreationDialog
					open={creationDialogOpen}
					toggleModal={toggleCreationDialog}
				/>
			) : (
				<GroupRecordCreationDialog
					open={groupRecordCreationDialog}
					toggleModal={toggleGroupRecordCreationDialog}
					group={group!}
				/>
			)}

			<RecordDetailsDialog open={open} toggleModal={toggleDialog} record={selectedRecord} />
			<GroupRecordDetailsDialog
				open={groupRecordDialogOpen}
				toggleModal={toggleGroupRecordDialog}
				groupRecord={selectedGroupRecord}
			/>

			{hasGroup && (
				<Tooltip
					title={`switch to ${isGroupView ? "personal" : "group"} view`}
					sx={{ position: "fixed", zIndex: 50, bottom: 30, left: 210 }}
					placement='left'
				>
					<Fab
						color='primary'
						aria-label='add'
						onClick={() => setIsGroupView((group) => !group)}
					>
						<ChangeCircleIcon />
					</Fab>
				</Tooltip>
			)}
		</Box>
	);
};

export default Records;
