import { where, orderBy, limit, QueryConstraint } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { budgetService } from "../../budget";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import transactionService from "../transaction.service";

const useRecordChartSummary = (budgetPlanId?: string) => {
	const [chartData, setChartData] = useState<{
		dates: string[];
		amount: number[];
	}>({
		dates: [],
		amount: [],
	});
	const [areRecordsLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getTenMostRecentRecords = async () => {
			setIsLoading(true);
			const personalAccounts = await paymentInfoService.getPersonalAccounts();

			if (personalAccounts.length !== 0) {
				let constraints;

				if (budgetPlanId) {
					constraints = [
						where("accountId", "in", [...personalAccounts.map((plan) => plan.id)]),
						where("budgetPlanId", "==", budgetPlanId),
						orderBy("transactionDate", "desc"),
						limit(10),
					];
				} else {
					constraints = [
						where("accountId", "in", [...personalAccounts.map((plan) => plan.id)]),
						orderBy("transactionDate", "desc"),
						limit(10),
					];
				}

				const records = await transactionService.getChartSummary(...constraints);
				if (records.length > 0) {
					const distinctDates = new Set(
						records.map((record) => {
							return new Date(
								(record.transactionDate as FirestoreTimestampObject).seconds * 1000
							).toLocaleDateString();
						})
					);

					const totalAmountForDate = [] as number[];
					[...distinctDates].forEach((date) => {
						let totalAmount = 0;
						records.forEach((record) => {
							const stringDate = new Date(
								(record.transactionDate as FirestoreTimestampObject).seconds * 1000
							);

							if (stringDate.toLocaleDateString() === date) {
								totalAmount += record.amount;
							}
						});
						totalAmountForDate.push(totalAmount);
					});

					const cumulativeAmount = new Set(totalAmountForDate);

					setChartData({
						amount: [...cumulativeAmount],
						dates: [...distinctDates],
					});
				}
			}
			setIsLoading(false);
		};
		getTenMostRecentRecords();
	}, []);

	const recentTransactionsLabels = chartData.dates;

	const recentTransactionsOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Recent Transactions",
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: "Date",
				},
				ticks: {
					autoSkip: true,
					maxTicksLimit: 10,
				},
			},
			y: {
				title: {
					display: true,
					text: "Amount (RM)",
				},
			},
		},
	};

	const recentTransactionsData = {
		labels: recentTransactionsLabels,
		datasets: [
			{
				label: "Recent Transaction",
				data: chartData.amount,
				borderColor: "rgb(255, 99, 132)",
				backgroundColor: "rgba(255, 99, 132, 0.5)",
			},
		],
	};

	return { recentTransactionsData, recentTransactionsOptions, areRecordsLoading };
};

export default useRecordChartSummary;
