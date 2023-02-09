import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Stack, styled, SxProps, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Tray } from "../../components";
import { MultiStep } from "../../context/MultiStepContext";
import BudgetPlanCreationModal from "../../features/budget/components/BudgetPlanCreationModal";
import BudgetPlanTray from "../../features/budget/components/BudgetPlanTray";
import BudgetTimeline from "../../features/budget/components/BudgetTimeline";
import Second from "../../features/budget/components/budget_plan_creation/BudgetSetup";
import PlanOverview from "../../features/budget/components/budget_plan_creation/PlanOverview";
import Threshold from "../../features/budget/components/budget_plan_creation/Threshold";
import { doughnutData } from "./mock_chart_data";

const Budgets = () => {
	const toolbarPlaceholderRef = useRef<HTMLDivElement>(null);
	const [modalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		const scrollEvent = () => {
			if (toolbarPlaceholderRef !== null) {
				if (window.scrollY > 200) {
					toolbarPlaceholderRef.current!.style.height = "10vh";
				} else {
					toolbarPlaceholderRef.current!.style.height = "0";
				}
			}
		};
		window.addEventListener("scroll", scrollEvent);
		return () => window.removeEventListener("scroll", scrollEvent);
	}, []);

	const toggleModal = () => {
		setModalOpen((open) => !open);
	};

	const BudgetOverviewGrid = styled(Grid2)(({ theme }) => ({
		overflowY: "auto",
		height: "100vh",
		position: "sticky",
		top: 0,
		padding: "0.5rem",
		display: "none",
		[theme.breakpoints.up("lg")]: {
			display: "flex",
		} satisfies SxProps,
		"&::-webkit-scrollbar": {
			width: "0.3rem",
		} satisfies SxProps,
		"&::-webkit-scrollbar-thumb": {
			background: theme.palette.tertiary.main,
		} satisfies SxProps,
	}));

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

			<Grid2 container sx={{ mx: 0, mt: 3, p: 3 }}>
				<Grid2 xs={12} md={6}>
					<Stack direction='column' spacing={3}>
						<BudgetPlanTray />
						<BudgetPlanTray />
						<BudgetPlanTray />
						<BudgetPlanTray />
						<BudgetPlanTray />
					</Stack>
				</Grid2>

				{/* provide offset on large screens */}
				<Grid2 xs={1} sx={{ display: { xs: "none", md: "flex" } }} />

				<BudgetOverviewGrid container xs={5}>
					<Box
						sx={{ width: "100%", transition: "all 200ms ease-out", height: 0 }}
						ref={toolbarPlaceholderRef}
					/>

					<Stack direction='column' spacing={3}>
						{/* chart */}
						<Tray title='Budget Breakdown'>
							<Doughnut data={doughnutData} />
						</Tray>

						{/* timeline */}
						<Tray title='Recently Accessed Budgets' transparent>
							<BudgetTimeline />
						</Tray>
					</Stack>
				</BudgetOverviewGrid>
			</Grid2>
			<MultiStep
				defaultValues={{
					id: "1",
					name: "budget plan",
					categories: [
						{
							name: "entertainment",
							spendingLimit: 12,
							id: "",
							colourScheme: { primaryHue: "", secondaryHue: "" },
							iconType: "entertainment",
						},
					],
					note: "",
					plannedPayments: [{ amount: 12, startDate: new Date(), name: "", id: "" }],
					renewalTerm: "monthly",
					spendingLimit: 12,
					spendingThreshold: 80,
				}}
				steps={[<PlanOverview key={1} />, <Second key={2} />, <Threshold key={3} />]}
			>
				<BudgetPlanCreationModal open={modalOpen} toggleModal={toggleModal} />
			</MultiStep>
		</Box>
	);
};

export default Budgets;
