import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ChipOptions, chipVariantHueList } from "../../budget/components/BudgetChip";
import paymentInfoService from "../../payment_info/paymentInfo.service";
import transactionService from "../transaction.service";

const useExpensesByCategoryData = (budgetPlanId: string) => {
	const [chartData, setChartData] = useState<{
		categories: ChipOptions[];
		amount: number[];
	}>({ categories: [], amount: [] });
	const [isCategoryDataLoading, setIsCategoryDataLoading] = useState(false);

	useEffect(() => {
		const getSpendingByCategory = async () => {
			setIsCategoryDataLoading(true);
			const personalAccounts = await paymentInfoService.getPersonalAccounts();

			const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

			if (personalAccounts.length !== 0) {
				const records = await transactionService.getChartSummary(
					where("accountId", "in", [...personalAccounts.map((plan) => plan.id)]),
					where("budgetPlanId", "==", budgetPlanId),
					where("transactionDate", ">=", firstDayOfMonth),
					where("transactionDate", "<=", new Date())
				);

				const distinctCategories = new Set(records.map((record) => record.category));

				const totalAmountForCategory = [] as number[];
				[...distinctCategories].forEach((cat) => {
					let totalAmount = 0;
					records.forEach((record) => {
						if (cat === record.category) {
							totalAmount += record.amount;
						}
					});
					totalAmountForCategory.push(totalAmount);
				});

				setChartData({
					categories: [...distinctCategories],
					amount: totalAmountForCategory,
				});
			}
			setIsCategoryDataLoading(false);
		};
		getSpendingByCategory();
	}, []);

	const barOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top" as const,
			},
			title: {
				display: true,
				text: "Expenses by Category",
			},
		},
		scales: {
			x: {
				title: {
					display: true,
					text: "Budget Category",
				},
			},
			y: {
				title: {
					display: true,
					text: "Amount (RM)",
				},
				beginAtZero: true,
			},
		},
	};

	const barData = {
		labels: chartData.categories,
		datasets: [
			{
				label: "Category",
				data: chartData.amount,
				backgroundColor: chartData.categories.map(
					(cat) => chipVariantHueList[cat as ChipOptions].secondaryHue
				),
			},
		],
	};

	return { isCategoryDataLoading, barData, barOptions };
};

export default useExpensesByCategoryData;
