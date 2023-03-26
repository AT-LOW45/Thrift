import { TableCell, tableCellClasses, TableRow, styled } from "@mui/material";
import { useState, useEffect } from "react";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { GroupAccount, GroupAccountSchemaDefaults } from "../../payment_info/paymentInfo.schema";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import { Profile, ProfileSchemaDefaults } from "../../profile/profile.schema";
import profileService from "../../profile/profile.service";
import { GroupIncome, GroupTransaction } from "../../transaction/transaction.schema";
import transactionService from "../../transaction/transaction.service";
import { Group } from "../group.schema";
import groupService from "../group.service";

const useGroupDetailRetrieval = (group: Group) => {
	const [owner, setOwner] = useState<Profile>(ProfileSchemaDefaults.parse({}));
	const [members, setMembers] = useState<Profile[]>([]);
	const [groupTransactions, setGroupTransactions] = useState<(GroupTransaction | GroupIncome)[]>(
		[]
	);
	const [groupAccount, setGroupAccount] = useState<GroupAccount>(
		GroupAccountSchemaDefaults.parse({})
	);
	const [pendingTransactions, setPendingTransactions] = useState<
		Awaited<ReturnType<typeof transactionService.getPendingGroupTransactions>>
	>({ pendingTransactions: [], memberCount: 0 });

	useEffect(() => {
		const configureBudgetDetails = async () => {
			const foundOwner = await profileService.findProfile(group.owner);
			setOwner(foundOwner);

			const foundMembers = await groupService.findMembers(group.id!);
			setMembers(foundMembers);

			const foundGroupAccount = await paymentInfoService.getGroupAccount(group.id!);
			setGroupAccount(foundGroupAccount);

			const foundPendingTransactions = await transactionService.getPendingGroupTransactions(
				group.id!
			);
			const pendingTransacWithNames = await Promise.all(
				foundPendingTransactions.pendingTransactions.map(async (transac) => {
					const profile = await profileService.findProfile(transac.madeBy);
					return { ...transac, madeBy: profile.username } as GroupTransaction;
				})
			);
			setPendingTransactions({
				pendingTransactions: pendingTransacWithNames,
				memberCount: foundPendingTransactions.memberCount,
			});

			const foundGroupTransactions = await transactionService.getGroupTransactions(group.id!);
			const transactionsWithDateAndProfile = Promise.all(
				foundGroupTransactions.map(async (record) => {
					const transactionProfile = await profileService.findProfile(record.madeBy);

					return {
						...record,
						transactionDate: new Date(
							(record.transactionDate as FirestoreTimestampObject).seconds * 1000
						),
						madeBy: transactionProfile.username,
					} as GroupTransaction | GroupIncome;
				})
			);

			return transactionsWithDateAndProfile;
		};
		configureBudgetDetails().then((records) => setGroupTransactions(records));
	}, []);

	const StyledTableCell = styled(TableCell)(({ theme }) => ({
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: theme.palette.common.black,
			color: theme.palette.common.white,
		},
		[`&.${tableCellClasses.body}`]: {
			fontSize: 14,
		},
	}));

	const StyledTableRow = styled(TableRow)(({ theme }) => ({
		"&:nth-of-type(odd)": {
			backgroundColor: theme.palette.action.hover,
		},
		// hide last border
		"&:last-child td, &:last-child th": {
			border: 0,
		},
	}));

	return {
		owner,
		members,
		pendingTransactions,
		groupAccount,
		groupTransactions,
		StyledTableCell,
		StyledTableRow,
	};
};

export default useGroupDetailRetrieval;
