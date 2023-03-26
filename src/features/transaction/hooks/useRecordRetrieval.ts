import { styled } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import app from "../../../firebaseConfig";
import data_grid_configuration from "../../../pages/records/data_grid_configuration";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { budgetService } from "../../budget";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import profileService from "../../profile/profile.service";
import {
	GroupIncome,
	GroupTransaction,
	Income,
	Transaction,
	TransactionSchemaDefaults,
} from "../transaction.schema";
import groupService from "../../group_planning/group.service";
import { Unsubscribe } from "firebase/auth";
import { Group, GroupSchemaDefaults } from "../../group_planning/group.schema";

type RecordsStream = Promise<
	| {
			myRecordsStream: Promise<Unsubscribe>;
			groupRecordsStream: Promise<Unsubscribe>;
	  }
	| {
			myRecordsStream: Promise<Unsubscribe>;
			groupRecordsStream?: Promise<Unsubscribe>;
	  }
>;

const firestore = getFirestore(app);

const useRecordRetrieval = () => {
	const [records, setRecords] = useState<(Transaction | Income)[]>([]);
	const [groupRecords, setGroupRecords] = useState<(GroupTransaction | GroupIncome)[]>([]);
	const [hasGroup, setHasGroup] = useState(false);
	const [isGroupView, setIsGroupView] = useState(false);
	const [group, setGroup] = useState<Group>();
	const { user } = useContext(AuthContext);

	useEffect(() => {
		const retrieveRecords = async () => {
			const userProfile = await profileService.findProfile(user?.uid!);
			const groupId = userProfile.group;
			setHasGroup(groupId !== "" ? true : false);

			if (groupId !== "") {
				const foundGroup = await groupService.find(groupId);
				setGroup(foundGroup);
			}

			return groupId !== ""
				? {
						myRecordsStream: findMyRecords(),
						groupRecordsStream: findGroupRecords(groupId),
				  }
				: { myRecordsStream: findMyRecords() };
		};

		const recordsStream: RecordsStream = retrieveRecords();

		return () => {
			recordsStream.then((unsub) => {
				if (unsub.groupRecordsStream !== undefined) {
					Promise.all([unsub.groupRecordsStream, unsub.myRecordsStream]).then(
						(result) => {
							result[0]();
							result[1]();
						}
					);
				} else {
					unsub.myRecordsStream.then((result) => result());
				}
			});
		};
	}, []);

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

			const recordsWithBudgetPlanAndAccount = await Promise.all(
				myRecords.map(async (record) => {
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
				})
			);
			setRecords(recordsWithBudgetPlanAndAccount);
		});
		return recordStream;
	};

	const findGroupRecords = async (groupId: string) => {
		const groupRecordRef = collection(firestore, "GroupTransaction");
		const groupRecordQuery = query(groupRecordRef, where("groupId", "==", groupId));

		const groupRecordStream = onSnapshot(groupRecordQuery, async (snapshot) => {
			const groupRecords = snapshot.docs.map(
				(doc) => ({ id: doc.id, ...doc.data() } as GroupTransaction | GroupIncome)
			);

			const groupRecordsWithAccount = await Promise.all(
				groupRecords.map(async (record) => {
					const group = await groupService.find(groupId);
					return { groupName: group.name, ...record };
				})
			);

			setGroupRecords(groupRecordsWithAccount);
		});

		return groupRecordStream;
	};

	const [open, setOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<Transaction | Income>(
		TransactionSchemaDefaults.parse({})
	);
	const [creationDialogOpen, setCreationDialogOpen] = useState(false);
	const [groupRecordCreationDialog, setGroupCreationDialog] = useState(false);
	const [errorInfoBarOpen, setErrorInfoBarOpen] = useState(false);

	const toggleDialog = () => setOpen((isOpen) => !isOpen);

	const toggleCreationDialog = () => setCreationDialogOpen((isOpen) => !isOpen);

	const toggleGroupRecordCreationDialog = () => setGroupCreationDialog((open) => !open);

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

	const isGroupTransaction = (
		record: GroupTransaction | GroupIncome
	): record is GroupTransaction => "status" in record;

	const isGroupIncome = (record: GroupTransaction | GroupIncome): record is GroupIncome =>
		"type" in record;

	const { columnsIncome, columnsTransactions, columnsGroupTransactions, columnsGroupIncome } =
		data_grid_configuration(openDialog);

	const incomeRow = records.filter(isIncome).map((income, index) => ({
		number: index + 1,
		id: income.id,
		type: income.type,
		amount: income.amount,
		transactionDate: new Date(
			(income.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
	}));

	const groupIncomeRow = groupRecords.filter(isGroupIncome).map((groupIncome, index) => ({
		number: index + 1,
		id: groupIncome.id,
		amount: groupIncome.amount,
		transactionDate: new Date(
			(groupIncome.transactionDate as FirestoreTimestampObject).seconds * 1000
		).toLocaleDateString(),
		madeBy: groupIncome.madeBy,
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

	const groupTransactionRow = groupRecords
		.filter(isGroupTransaction)
		.map((groupTransaction, index) => ({
			number: index + 1,
			id: groupTransaction.id,
			category: groupTransaction.category,
			amount: groupTransaction.amount,
			transactionDate: new Date(
				(groupTransaction.transactionDate as FirestoreTimestampObject).seconds * 1000
			).toLocaleDateString(),
			status: groupTransaction.status
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
		columnsGroupTransactions,
		columnsGroupIncome,
		incomeRow,
		transactionRow,
		groupIncomeRow,
		groupTransactionRow,
		hasGroup,
		setHasGroup,
		isGroupView,
		group,
		setIsGroupView,
		setErrorInfoBarOpen,
		groupRecordCreationDialog,
		toggleGroupRecordCreationDialog,
	};
};

export default useRecordRetrieval;
