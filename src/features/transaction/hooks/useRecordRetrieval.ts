import styled from "@emotion/styled";
import { DataGrid } from "@mui/x-data-grid";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import app from "../../../firebaseConfig";
import data_grid_configuration from "../../../pages/records/data_grid_configuration";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { budgetService } from "../../budget";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { Income, Transaction, TransactionSchemaDefaults } from "../transaction.schema";

const firestore = getFirestore(app);

const useRecordRetrieval = () => {
	const [records, setRecords] = useState<(Transaction | Income)[]>([]);

	useEffect(() => {
		const findMyRecords = async () => {
			const personalAccounts = await paymentInfoService.getPersonalAccounts();

			const recordRef = collection(firestore, "Transaction");
			const recordQuery = query(
				recordRef,
				where("accountId", "in", [...personalAccounts.map((acc) => acc.id)])
			);

			const recordStream = onSnapshot(recordQuery, async (snapshot) => {
				const myRecords = snapshot.docs.map(
					(doc) => ({ id: doc.id, ...doc.data() } as Transaction | Income)
				);

				const recordsWithBudgetPlanAndAccount = await Promise.all(myRecords.map(async (record) => {
					if ("category" in record && record.budgetPlanId !== "N/A") {
						const budgetPlan = await budgetService.find(record.budgetPlanId);
						const account = await paymentInfoService.find(record.accountId);
						return {
							accountName: account.name,
							budgetPlanName: budgetPlan.name,
							...record,
						} as Transaction;
					} else {
						const account = await paymentInfoService.find(record.accountId);
						return { accountName: account.name, ...record } as Income;
					}
				}))
				setRecords(recordsWithBudgetPlanAndAccount);
			});
			return recordStream;
		};
		const recordStream = findMyRecords();

		return () => {
			recordStream.then((unsub) => unsub());
		};
	}, []);

	const [open, setOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<Transaction | Income>(
		TransactionSchemaDefaults.parse({})
	);
	const [creationDialogOpen, setCreationDialogOpen] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);

	const toggleDialog = () => setOpen((isOpen) => !isOpen);

	const toggleCreationDialog = () => setCreationDialogOpen((isOpen) => !isOpen);

	const openDialog = (recordId: string) => {
		const record = records.find((rec) => rec.id === recordId);
		if (record) {
			setSelectedRecord(record);
			toggleDialog();
		}
	};

	const CustomDataGrid = styled(DataGrid)(() => ({
		"&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
			outline: "none",
		},
	}));

	const isTransaction = (record: Transaction | Income): record is Transaction =>
		"category" in record;

	const isIncome = (record: Transaction | Income): record is Income => "type" in record;

	const { columnsIncome, columnsTransactions } = data_grid_configuration(
		openDialog,
		toggleDialog
	);

	const incomeRow = records.filter(isIncome).map((income, index) => ({
		number: index + 1,
		id: income.id,
		type: income.type,
		amount: income.amount,
		transactionDate: new Date(
			(income.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
	}));

	const transactionRow = records.filter(isTransaction).map((transaction, index) => ({
		number: index + 1,
		id: transaction.id,
		category: transaction.category,
		budgetPlan: transaction.budgetPlanName,
		account: transaction.accountName,
		amount: transaction.amount,
		transactionDate: new Date(
			(transaction.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
	}));

	return {
		open,
		setOpen,
		selectedRecord,
		creationDialogOpen,
		toggleDialog,
		toggleCreationDialog,
		openDialog,
		CustomDataGrid,
		columnsIncome,
		columnsTransactions,
		incomeRow,
		transactionRow,
		setErrorInfoBarOpen,
	};
};

export default useRecordRetrieval;
