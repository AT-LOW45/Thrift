import { where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ChipOptions, chipVariantHueList } from "../../budget/components/BudgetChip";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import transactionService from "../transaction.service";

const useMonthlyBudgetSummary = () => {
	const [chartData, setChartData] = useState<{
		category: string[];
		transactionCount: number[];
	}>({ category: [], transactionCount: [] });
	const [areBudgetsLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getTenMostRecentRecords = async () => {
			setIsLoading(true);
			const personalAccounts = await paymentInfoService.getPersonalAccounts();

			const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

			if (personalAccounts.length !== 0) {
				const records = await transactionService.getChartSummary(
					where("accountId", "in", [...personalAccounts.map((plan) => plan.id)]),
					where("transactionDate", ">=", firstDayOfMonth),
					where("transactionDate", "<=", new Date()),
				);

				if (records.length > 0) {
					const distinctCategories = new Set(records.map((record) => record.category));

					const noOfTransactions = [] as number[];
					[...distinctCategories].forEach((category) => {
						let count = 0;
						records.forEach((record) => {
							if (record.category === category) {
								count++;
							}
						});
						noOfTransactions.push(count);
					});

					setChartData({
						category: [...distinctCategories],
						transactionCount: noOfTransactions,
					});
				}
			}

			setIsLoading(false);
		};
		getTenMostRecentRecords();
	}, []);

	const pieData = {
		labels: chartData.category,
		datasets: [
			{
				label: "No. of transactions",
				data: chartData.transactionCount,
				backgroundColor: chartData.category.map(
					(cat) => chipVariantHueList[cat as ChipOptions].secondaryHue
				),
				borderWidth: 1,
			},
		],
	};

	return { areBudgetsLoading, pieData };
};

export default useMonthlyBudgetSummary;
