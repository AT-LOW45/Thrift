import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
	Avatar,
	Button,
	Divider,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
	ArcElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { Fragment } from "react";
import { Line, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { Tray } from "../../components";
import { FirestoreTimestampObject } from "../../service/thrift";
import useOverview from "./useOverview";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
ChartJS.register(ArcElement, Tooltip, Legend);

const Overview = () => {
	const {
		areBudgetsLoading,
		areRecordsLoading,
		currentMonthIncome,
		mostRecentBudget,
		mostRecentRecord,
		pieData,
		recentTransactionsData,
		recentTransactionsOptions,
		recentPosts,
	} = useOverview();
	const navigate = useNavigate();

	return (
		<Grid2 container spacing={4} sx={{ p: 3, m: 0 }}>
			<Tray
				colSpan={{ xs: 12, lg: 4 }}
				title='Balance'
				actions={<Button onClick={() => navigate("/accounts")}>More</Button>}
			>
				{mostRecentRecord ? (
					<Stack spacing={2}>
						<Stack spacing={1} alignItems='center'>
							<Typography variant='numberHeading'>
								RM{mostRecentRecord.account.balance}
							</Typography>
							<Typography>{mostRecentRecord.account.name}</Typography>
						</Stack>
						<Stack
							direction='row'
							spacing={3}
							justifyContent='center'
							alignItems='center'
						>
							<Typography
								sx={
									"budgetPlanId" in mostRecentRecord.record
										? {
												py: 1,
												px: 2,
												display: "flex",
												alignItems: "center",
												borderRadius: "7px",
												backgroundColor: "rgb(242, 136, 136)",
												color: "rgb(207, 0, 0)",
										  }
										: {
												py: 1,
												px: 2,
												display: "flex",
												alignItems: "center",
												borderRadius: "7px",
												backgroundColor: "rgb(180, 255, 176)",
												color: "green",
										  }
								}
							>
								RM{mostRecentRecord.record.amount}
								{"budgetPlanId" in mostRecentRecord.record ? (
									<TrendingDownIcon />
								) : (
									<TrendingUpIcon />
								)}
							</Typography>
							<Typography variant='regularLight'>
								recorded on{" "}
								{new Date(
									(
										mostRecentRecord.record
											.transactionDate as FirestoreTimestampObject
									).seconds * 1000
								).toLocaleDateString()}
							</Typography>
						</Stack>
					</Stack>
				) : (
					<Typography variant='regularLight'>No data</Typography>
				)}
			</Tray>
			<Tray
				colSpan={{ xs: 12, lg: 4 }}
				title='Income'
				actions={<Button onClick={() => navigate("/transactions")}>More</Button>}
			>
				{currentMonthIncome ? (
					<Stack spacing={2}>
						<Stack spacing={1} alignItems='center'>
							<Typography textAlign='center' variant='numberHeading'>
								RM{currentMonthIncome.totalAmount}
							</Typography>
							<Typography variant='regularLight'>
								This month's total income
							</Typography>
						</Stack>
						<Stack
							direction='row'
							spacing={3}
							justifyContent='center'
							alignItems='center'
						>
							<Typography
								sx={{
									py: 1,
									px: 2,
									display: "flex",
									alignItems: "center",
									borderRadius: "7px",
									backgroundColor: "rgb(180, 255, 176)",
									color: "green",
								}}
							>
								{/* RM{currentMonthIncome.mostRecentIncome.amount} */}
								<TrendingUpIcon />
							</Typography>
							<Typography variant='regularLight'>
								recorded on{" "}
								{new Date(
									(
										currentMonthIncome.mostRecentIncome
											.transactionDate as FirestoreTimestampObject
									).seconds * 1000
								).toLocaleDateString()}
							</Typography>
						</Stack>
					</Stack>
				) : (
					<Typography variant='regularLight'>No data for this month</Typography>
				)}
			</Tray>
			<Tray
				colSpan={{ xs: 12, lg: 4 }}
				title='Budget'
				actions={<Button onClick={() => navigate("/budgets")}>More</Button>}
			>
				{mostRecentBudget ? (
					<Stack spacing={2}>
						<Stack spacing={1} alignItems='center'>
							<Typography textAlign='center' variant='regularSubHeading'>
								{mostRecentBudget.budgetPlan.name}
							</Typography>
							<Typography variant='regularLight'>
								Spending Limit: RM{mostRecentBudget.budgetPlan.spendingLimit}
							</Typography>
						</Stack>
						<Stack
							direction='row'
							spacing={3}
							justifyContent='center'
							alignItems='center'
						>
							<Typography
								sx={{
									py: 1,
									display: "flex",
									borderRadius: "7px",
									alignItems: "center",
									px: 2,
									backgroundColor: "rgb(242, 136, 136)",
									color: "rgb(207, 0, 0)",
								}}
							>
								RM{mostRecentBudget.transaction.amount}
								<TrendingDownIcon />
							</Typography>
							<Typography variant='regularLight'>
								recorded on{" "}
								{new Date(
									(
										mostRecentBudget.transaction
											.transactionDate as FirestoreTimestampObject
									).seconds * 1000
								).toLocaleDateString()}
							</Typography>
						</Stack>
					</Stack>
				) : (
					<Typography variant='regularLight'>No data</Typography>
				)}
			</Tray>

			<Tray
				colSpan={{ xs: 12 }}
				title='Expense Trend'
				actions={<Button variant='contained'>More</Button>}
			>
				{!areRecordsLoading ? (
					<Line options={recentTransactionsOptions} data={recentTransactionsData} />
				) : (
					<Typography>No data</Typography>
				)}
			</Tray>

			<Tray colSpan={{ xs: 12, lg: 5 }} title="This Month's Budget">
				{!areBudgetsLoading && pieData.labels.length !== 0 ? (
					<Pie data={pieData} />
				) : (
					<Stack spacing={3}>
						<Typography>You have not recorded any transactions this month.</Typography>
						<Button variant='contained'>Start Recording</Button>
					</Stack>
				)}
			</Tray>
			<Tray colSpan={{ xs: 12, lg: 5 }} title='Recent activities'>
				<List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
					{recentPosts.length === 0 ? (
						<Typography variant='regularLight'>No posts yet</Typography>
					) : (
						recentPosts.map((post) => (
							<Fragment key={post.id}>
								<ListItem alignItems='flex-start'>
									<ListItemAvatar>
										<Avatar>{post.postedBy.charAt(0).toUpperCase()}</Avatar>
									</ListItemAvatar>
									<ListItemText
										sx={{
											display: "-webkit-box",
											textOverflow: "ellipsis",
											WebkitLineClamp: "3",
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
											wordWrap: "break-word",
										}}
										primary={post.title}
										secondary={
											<Fragment>
												<Typography
													sx={{ display: "block" }}
													component='span'
													variant='body2'
													color='text.primary'
												>
													{new Date(
														(
															post.datePosted as FirestoreTimestampObject
														).seconds * 1000
													).toLocaleDateString()}
												</Typography>
												{post.body}
											</Fragment>
										}
									/>
								</ListItem>
								<Divider variant='inset' component='li' />
							</Fragment>
						))
					)}
				</List>
			</Tray>
		</Grid2>
	);
};

export default Overview;
