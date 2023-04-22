import { collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import app from "../../../firebaseConfig";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { Income, Transaction } from "../../transaction/transaction.schema";

const firestore = getFirestore(app);

const usePaymentInfoSummary = (accountId: string) => {
	const [chartData, setChartData] = useState<{ dates: string[]; amounts: number[] }>({
		dates: [],
		amounts: [],
	});
	const [areAccountRecordsLoading, setAreAccountRecordsLoading] = useState(true);
	const [mostRecentRecord, setMostRecentRecord] = useState<Transaction | Income>();

	useEffect(() => {
		const getAccountRecordsSummary = async () => {
			setAreAccountRecordsLoading(true);

			const transactionRef = collection(firestore, "Transaction");
			const transactionQuery = query(
				transactionRef,
				where("accountId", "==", accountId),
				orderBy("transactionDate", "desc")
			);

			const records = (await getDocs(transactionQuery)).docs.map(
				(record) => ({ id: record.id, ...record.data() } as Transaction | Income)
			);

			setMostRecentRecord(records[0]);

			if (records.length > 0) {
				const distinctDates = new Set(
					records.map((record) => {
						return new Date(
							(record.transactionDate as FirestoreTimestampObject).seconds * 1000
						).toLocaleDateString();
					})
				);

				const amountForDate = [] as number[];

				[...distinctDates].forEach((date) => {
					let currentDateAmount = 0;
					records.forEach((record) => {
						const stringDate = new Date(
							(record.transactionDate as FirestoreTimestampObject).seconds * 1000
						);

						if (stringDate.toLocaleDateString() === date) {
							const amount =
								"budgetPlanId" in record ? -record.amount : record.amount;

							currentDateAmount += amount;
						}
					});
					amountForDate.push(currentDateAmount);
				});

				const total = new Set(amountForDate);

				setChartData({
					amounts: [...total],
					dates: [...distinctDates],
				});
			}
			setAreAccountRecordsLoading(false);
		};
		getAccountRecordsSummary();
	}, [accountId]);

	const paymentInfoLabels = chartData.dates;

	const paymentInfoOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Account Transaction History",
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

	const paymentInfoData = {
		labels: paymentInfoLabels,
		datasets: [
			{
				label: "Account Transaction History",
				data: chartData.amounts,
				borderColor: "rgb(255, 99, 132)",
				backgroundColor: "rgba(255, 99, 132, 0.5)",
			},
		],
	};

	return { paymentInfoData, paymentInfoOptions, areAccountRecordsLoading, mostRecentRecord };
};

export default usePaymentInfoSummary;
