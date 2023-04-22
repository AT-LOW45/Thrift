import { TableCell, TableRow, styled, tableCellClasses } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import app from "../../../firebaseConfig";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { GroupAccount, GroupAccountSchemaDefaults } from "../../payment_info/paymentInfo.schema";
import { Profile, ProfileSchemaDefaults } from "../../profile/profile.schema";
import profileService from "../../profile/profile.service";
import { GroupIncome, GroupTransaction } from "../../transaction/transaction.schema";
import transactionService from "../../transaction/transaction.service";
import { Group } from "../group.schema";

const firestore = getFirestore(app);

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

			const memberRef = collection(firestore, "UserProfile");
			const memberQuery = query(memberRef, where("group", "==", group.id!));
			const memberStream = onSnapshot(memberQuery, (snapshot) => {
				const members = snapshot.docs.map(
					(member) => ({ id: member.id, ...member.data() } as Profile)
				);
				setMembers(members);
			});

			const groupAccountRef = collection(firestore, "PaymentInfo");
			const groupAccountQuery = query(groupAccountRef, where("groupId", "==", group.id!));
			const groupAccountStream = onSnapshot(groupAccountQuery, (snapshot) => {
				const groupAccount = {
					id: snapshot.docs[0].id,
					...snapshot.docs[0].data(),
				} as GroupAccount;
				setGroupAccount(groupAccount);
			});

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
			const transactionsWithDateAndProfile = await Promise.all(
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
			setGroupTransactions(transactionsWithDateAndProfile);

			return { groupAccountStream, memberStream };
		};
		const unsubStreams = configureBudgetDetails();

		return () => {
			unsubStreams.then((stream) => {
				stream.groupAccountStream();
				stream.memberStream();
			});
		};
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
