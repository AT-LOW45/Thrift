import { Typography, styled } from "@mui/material";
import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { BudgetPlan, budgetService } from "../../features/budget";
import { Post } from "../../features/community/community.schema";
import communityService from "../../features/community/community.service";
import { PersonalAccount } from "../../features/payment_info/paymentInfo.schema";
import paymentInfoService from "../../features/payment_info/paymentInfo.service";
import useMonthlyBudgetSummary from "../../features/transaction/hooks/useMonthlyBudgetSummary";
import useRecordChartSummary from "../../features/transaction/hooks/useRecordChartSummary";
import { Income, Transaction } from "../../features/transaction/transaction.schema";
import transactionService from "../../features/transaction/transaction.service";
import app from "../../firebaseConfig";

const firestore = getFirestore(app);

const useOverview = () => {
	const { recentTransactionsData, recentTransactionsOptions, areRecordsLoading } =
		useRecordChartSummary();
	const { pieData, areBudgetsLoading } = useMonthlyBudgetSummary();
	const [mostRecentRecord, setMostRecentRecord] = useState<{
		record: Income | Transaction;
		account: PersonalAccount;
	}>();
	const [currentMonthIncome, setCurrentMonthIncome] = useState<{
		totalAmount: number;
		mostRecentIncome: Income;
	}>();
	const [mostRecentBudget, setMostRecentBudget] = useState<{
		budgetPlan: BudgetPlan;
		transaction: Transaction;
	}>();
	const [recentPosts, setRecentPosts] = useState<Post[]>([]);

	useEffect(() => {
		const configureData = async () => {
			await getRecentRecord();
			await getCurrentMonthIncome();
			await getMostRecentBudget();
			await getRecentPosts();
		};
		configureData();
	}, []);

	const getRecentRecord = async () => {
		const recentRecord = await transactionService.findMostRecentRecord();
		if (recentRecord === null) {
			setMostRecentRecord(undefined);
		} else {
			const account = (await paymentInfoService.find(
				recentRecord.accountId
			)) as PersonalAccount;
			setMostRecentRecord({ record: recentRecord, account });
		}
	};

	const getCurrentMonthIncome = async () => {
		const personalAccounts = await paymentInfoService.getPersonalAccounts(true);

		const incomeRef = collection(firestore, "Transaction");
		const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
		const incomeQuery = query(
			incomeRef,
			where("transactionDate", ">=", firstDayOfMonth),
			where("transactionDate", "<=", new Date()),
			where("accountId", "in", [...personalAccounts.map((acc) => acc.id)]),
			orderBy("transactionDate", "desc")
		);

		const isIncome = (record: object): record is Income => "type" in record;

		const incomes = (await getDocs(incomeQuery)).docs;

		if (incomes.length === 0) {
			setCurrentMonthIncome(undefined);
		} else {
			const foundIncomes = incomes
				.map(
					(record) =>
						({
							id: record.id,
							...record.data(),
						} as Transaction | Income)
				)
				.filter(isIncome);

			if (foundIncomes[0] === undefined) {
				setCurrentMonthIncome(undefined);
			} else {
				const totalAmountForMonth = foundIncomes
					.map((income) => income.amount)
					.reduce((prev, next) => prev + next, 0);
				setCurrentMonthIncome({
					totalAmount: totalAmountForMonth,
					mostRecentIncome: foundIncomes[0],
				});
			}
		}
	};

	const getMostRecentBudget = async () => {
		const transactionRef = collection(firestore, "Transaction");
		const personalAccounts = await paymentInfoService.getPersonalAccounts(true);

		const transactionQuery = query(
			transactionRef,
			where("accountId", "in", [...personalAccounts.map((acc) => acc.id)]),
			orderBy("transactionDate", "desc")
		);

		const isTransaction = (record: object): record is Transaction => "budgetPlanId" in record;

		const transactions = (await getDocs(transactionQuery)).docs;

		if (transactions.length === 0) {
			setMostRecentBudget(undefined);
		} else {
			const transaction = transactions
				.map(
					(record) =>
						({
							id: record.id,
							...record.data(),
						} as Transaction | Income)
				)
				.filter(isTransaction)
				.filter((transac) => transac.budgetPlanId !== "N/A")[0];

			if (!transaction) {
				setMostRecentBudget(undefined);
			} else {
				const budgetPlan = await budgetService.find(transaction.budgetPlanId);
				setMostRecentBudget({ transaction, budgetPlan });
			}
		}
	};

	const getRecentPosts = async () => {
		const posts = await communityService.getMostRecentPosts();
		setRecentPosts(posts);
	};

	const styles = {
		paddingTop: 7,
		paddingBottom: 7,
		paddingLeft: 15,
		paddingRight: 15,
		display: "flex",
		alignItems: "center",
		borderRadius: "7px",
	};

	const TrendUpBadge = styled(Typography)(() => ({
		...styles,
		backgroundColor: "rgb(180, 255, 176)",
		color: "green",
	}));

	const TrendDownBadge = styled(Typography)(() => ({
		...styles,
		backgroundColor: "rgb(242, 136, 136)",
		color: "rgb(207, 0, 0)",
	}));

	return {
		recentTransactionsData,
		recentTransactionsOptions,
		areRecordsLoading,
		pieData,
		areBudgetsLoading,
		mostRecentRecord,
		currentMonthIncome,
		recentPosts,
		mostRecentBudget,
		TrendUpBadge,
		TrendDownBadge,
	};
};

export default useOverview;
