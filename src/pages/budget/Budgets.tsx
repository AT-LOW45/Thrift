import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { collection, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { MultiStep } from "../../context/MultiStepContext";
import { BudgetPlan, BudgetPlanSchema, BudgetPlanSchemaDefaults } from "../../features/budget";
import BudgetPlanCreationModal from "../../features/budget/components/BudgetPlanCreationModal";
import BudgetPlanTray from "../../features/budget/components/BudgetPlanTray";
import Second from "../../features/budget/components/budget_plan_creation/BudgetSetup";
import PlanOverview from "../../features/budget/components/budget_plan_creation/PlanOverview";
import Threshold from "../../features/budget/components/budget_plan_creation/Threshold";
import { Transaction } from "../../features/transaction/transaction.schema";
import app from "../../firebaseConfig";

const Budgets = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);

	useEffect(() => {
		const subscribeBudgetPlans = () => {
			const firestore = getFirestore(app);
			const budgetPlanRef = collection(firestore, "BudgetPlan");
			const transactionRef = collection(firestore, "Transaction");

			const budgetPlanStream = onSnapshot(budgetPlanRef, async (snapshot) => {
				const result = snapshot.docs.map(
					(doc) => ({ id: doc.id, ...doc.data() } as BudgetPlan)
				);

				const plans = await Promise.all(
					result.map(async (plan) => {
						const transactionQuery = query(
							transactionRef,
							where("budgetPlanId", "==", plan.id)
						);
						const transactions = (await getDocs(transactionQuery)).docs.map(
							(transac) => transac.data() as Transaction
						);

						const amountToDeduct = transactions.map((transac) =>
							"amount" in transac ? transac.amount : 0
						);

						const amountLeftCurrency =
							plan.spendingLimit -
							amountToDeduct.reduce((prev, cur) => prev + cur, 0);

						const amountLeftPercentage = Math.round(
							((plan.spendingLimit - amountLeftCurrency) / plan.spendingLimit) * 100
						);

						return {
							amountLeftCurrency,
							amountLeftPercentage,
							...plan,
						} as BudgetPlan;
					})
				);
				setBudgetPlans(() => {
					console.log(plans);
					return plans;
				});
			});
			return budgetPlanStream;
		};
		const unsub = subscribeBudgetPlans();

		return () => {
			unsub();
		};
	}, []);

	const toggleModal = () => {
		setModalOpen((open) => !open);
	};

	ChartJS.register(ArcElement, Tooltip, Legend);

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack direction='column' spacing={1}>
				<Typography variant='regularHeading'>Budgets</Typography>
				<Button
					variant='contained'
					color='primary'
					sx={{ width: "fit-content" }}
					endIcon={<AddIcon />}
					onClick={toggleModal}
				>
					Add New Budget Plan
				</Button>
			</Stack>

			<Grid2 container sx={{ mx: 0, mt: 3, p: 3 }} spacing={3}>
				{budgetPlans.map((plan) => (
					<BudgetPlanTray budgetPlan={plan} key={plan.id} />
				))}
			</Grid2>
			<MultiStep
				defaultValues={BudgetPlanSchemaDefaults.parse({})}
				steps={[<PlanOverview key={1} />, <Second key={2} />, <Threshold key={3} />]}
			>
				<BudgetPlanCreationModal open={modalOpen} toggleModal={toggleModal} />
			</MultiStep>
		</Box>
	);
};

export default Budgets;
