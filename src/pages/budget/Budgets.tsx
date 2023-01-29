import AddIcon from "@mui/icons-material/Add";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, Button, Stack, styled, SxProps, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Tray } from "../../components";
import { BudgetChip } from "../../features/budget";
import { ChipOptions } from "../../features/budget/components/BudgetChip";
import BudgetPlanTray from "../../features/budget/components/BudgetPlanTray";
import { doughnutData } from "./mock_chart_data";

const Budgets = () => {
	const toolbarPlaceholderRef = useRef<HTMLDivElement>(null);

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

	const mockTimeLineData: { amount: number; date: string; budget: ChipOptions }[] = [
		{ amount: 50, date: "xx/xx/xx", budget: "entertainment" },
		{ amount: 30, date: "xx/xx/xx", budget: "groceries" },
		{ amount: 90, date: "xx/xx/xx", budget: "entertainment" },
	];

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack direction='column' spacing={1}>
				<Typography variant='regularHeading'>Budgets</Typography>
				<Button
					variant='contained'
					color='primary'
					sx={{ width: "fit-content" }}
					endIcon={<AddIcon />}
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
							<Timeline position='alternate'>
								{mockTimeLineData.map((data, index, array) => (
									<TimelineItem key={index}>
										<TimelineSeparator>
											<TimelineConnector />
											<BudgetChip option={data.budget} />
											<TimelineConnector
												sx={
													index === array.length - 1
														? {
																border: "1.6px gray dashed",
																backgroundColor: "inherit",
														  }
														: {}
												}
											/>
										</TimelineSeparator>
										<TimelineContent sx={{ py: "30px", px: 2 }}>
											<Typography variant='h6' component='span'>
												RM {data.amount}
											</Typography>
											<Typography>{data.date}</Typography>
										</TimelineContent>
									</TimelineItem>
								))}
							</Timeline>
						</Tray>
					</Stack>
				</BudgetOverviewGrid>
			</Grid2>
		</Box>
	);
};

export default Budgets;
