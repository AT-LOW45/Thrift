import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import { Box, Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useParams } from "react-router-dom";
import { TabPanel, Tray } from "../../components";
import { Editable } from "../../context/EditableContext";
import { BudgetPlan } from "../../features/budget/budget.schema";
import BudgetCategories from "../../features/budget/components/BudgetCategories";
import BudgetOverviewDetails from "../../features/budget/components/BudgetOverviewDetails";
import BudgetPlanTitle from "../../features/budget/components/BudgetPlanTitle";
import useRealtimeUpdate from "../../hooks/useRealtimeUpdate";
import { barData, barOptions, data, options } from "./mock_chart_data";

const BudgetPlanDetails = () => {
	ChartJS.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Title,
		Tooltip,
		Legend,
		BarElement
	);

	const [value, setValue] = useState(0);
	const { id } = useParams();
	const { firestoreDoc, isLoading } = useRealtimeUpdate<BudgetPlan>({
		data: { collection: "BudgetPlan", id },
	});

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			{!isLoading && (
				<Editable key={firestoreDoc.name} initialValues={firestoreDoc}>
					<BudgetPlanTitle />
				</Editable>
			)}

			<Tabs value={value} onChange={handleChange} centered sx={{ mt: 4 }}>
				<Tab label='Budget Plan' />
				<Tab label='Categories' />
			</Tabs>
			<TabPanel value={value} index={0}>
				<Stack direction='column' spacing={3}>
					{!isLoading && (
						<Editable
							key={`${firestoreDoc.spendingLimit}_${firestoreDoc.spendingThreshold}_${firestoreDoc.note}`}
							initialValues={firestoreDoc}
						>
							<BudgetOverviewDetails />
						</Editable>
					)}

					<Tray title='Expense Trend'>
						<Line options={options} data={data} />
					</Tray>
					<Tray title='Total Expenses by Budget'>
						<Bar options={barOptions} data={barData} />
					</Tray>
					<Button
						variant='contained'
						color='error'
						endIcon={<DeleteOutlineTwoToneIcon />}
						style={{
							width: "fit-content",
							margin: "3rem auto 1.5rem auto",
						}}
					>
						Close Budget Plan
					</Button>
				</Stack>
			</TabPanel>
			<TabPanel value={value} index={1}>
				{!isLoading && (
					<Editable
						initialValues={firestoreDoc}
						key={`${firestoreDoc.categories}_${firestoreDoc.plannedPayments}`}
					>
						<BudgetCategories />
					</Editable>
				)}
			</TabPanel>
		</Box>
	);
};

export default BudgetPlanDetails;
