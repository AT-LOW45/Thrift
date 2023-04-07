import {
	getFirestore,
	collection,
	query,
	where,
	orderBy,
	getDocs,
	limit,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { BudgetPlan, budgetService } from "../../features/budget";
import { PersonalAccount } from "../../features/payment_info/paymentInfo.schema";
import paymentInfoService from "../../features/payment_info/paymentInfo.service";
import useMonthlyBudgetSummary from "../../features/transaction/hooks/useMonthlyBudgetSummary";
import useRecordChartSummary from "../../features/transaction/hooks/useRecordChartSummary";
import { Income, Transaction } from "../../features/transaction/transaction.schema";
import transactionService from "../../features/transaction/transaction.service";
import { Post } from "../../features/community/community.schema";
import communityService from "../../features/community/community.service";

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

	const firestore = getFirestore();

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
		const personalAccounts = await paymentInfoService.getPersonalAccounts();

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
		const personalAccounts = await paymentInfoService.getPersonalAccounts();

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

	useEffect(() => {
		const configureData = async () => {
			await getRecentRecord();
			await getCurrentMonthIncome();
			await getMostRecentBudget();
			await getRecentPosts();
		};
		configureData();
	}, []);

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
	};
};

export default useOverview;
