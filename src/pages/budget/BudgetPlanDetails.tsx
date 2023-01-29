import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import { Box, Button, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip
} from "chart.js";
import { Fragment, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { TabPanel, Tray } from "../../components";
import EditableField from "../../components/form/EditableField";
import BudgetItem from "../../features/budget/components/BudgetItem";
import { Category, PlannedPayment } from "../../features/budget/models";
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

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const mockAllocationData = [
		{ field: "Allocated", amount: 300, colour: "black" },
		{ field: "Spent", amount: 60, colour: "red" },
		{ field: "Planned Payments", amount: 100, colour: "#F8964C" },
		{ field: "Remaining", amount: 100, colour: "green" },
	];

	const mockCategoryItemData: (Category | PlannedPayment)[] = [
		{
			id: "cat1",
			name: "Food",
			iconType: "groceries",
			spendingLimit: 60,
			colourScheme: { primaryHue: "#7329D1", secondaryHue: "#B9ADFF" },
			amountLeftCurrency: 30,
			amountLeftPercentage: 52,
		},
		{
			id: "planned1",
			name: "Netflix sub",
			amount: 12,
			startDate: new Date(),
		},
	];

	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "colourScheme" in item;
	};

	const isPlannedPayment = (item: Category | PlannedPayment): item is PlannedPayment => {
		return "startDate" in item;
	};

	const getMathOperator = (index: number, array: typeof mockAllocationData): string => {
		if (index === array.length - 1) return "";
		return index === array.length - 2 ? "=" : "-";
	};

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Typography variant='regularHeading'>Budget Plan 1</Typography>
			<Tabs value={value} onChange={handleChange} centered sx={{ mt: 4 }}>
				<Tab label='Budget Plan' />
				<Tab label='Categories' />
			</Tabs>

			<TabPanel value={value} index={0}>
				<Stack direction='column' spacing={3}>
					<EditableField>
						<EditableField.View>
							<Stack
								direction={{ xs: "column", lg: "row" }}
								spacing={{ xs: 1, md: 3 }}
								alignItems='center'
							>
								{mockAllocationData.map((data, index, array) => (
									<Fragment key={data.field}>
										<Stack
											direction='column'
											alignItems='center'
											sx={{ color: data.colour }}
										>
											<Typography variant='regularSubHeading'>
												{data.field}
											</Typography>
											<Typography variant='numberHeading'>
												{data.amount}
											</Typography>
										</Stack>
										<Typography variant='regularSubHeading'>
											{getMathOperator(index, array)}
										</Typography>
									</Fragment>
								))}
							</Stack>
						</EditableField.View>
						<EditableField.Edit>
							<TextField id='standard-basic' label='Standard' variant='standard' />
						</EditableField.Edit>
					</EditableField>

					<EditableField>
						<EditableField.View>
							<Typography variant='regularLight' component='p'>
								Usage is at 25% You will be alerted once it reaches 80%
							</Typography>
						</EditableField.View>
						<EditableField.Edit>
							<TextField id='standard-basic' label='Standard' variant='standard' />
						</EditableField.Edit>
					</EditableField>

					<Stack direction='column' sx={{ mt: 4 }} spacing={1}>
						<EditableField>
							<EditableField.View>
								<Typography variant='regularSubHeading'>About this plan</Typography>
								<Typography component='p' textAlign='justify'>
									Lorem ipsum dolor sit amet consectetur adipisicing elit.
									Quibusdam iste deserunt maxime perspiciatis, possimus sed aut
									dignissimos necessitatibus aliquid tempore. Lorem, ipsum dolor
									sit amet consectetur adipisicing elit. Et nemo distinctio
									assumenda doloribus eos aliquam exercitationem harum beatae,
									atque praesentium itaque dicta magni architecto natus
									repudiandae provident recusandae doloremque autem?
								</Typography>
							</EditableField.View>
							<EditableField.Edit>
								<TextField
									id='standard-basic'
									label='Standard'
									variant='standard'
								/>
							</EditableField.Edit>
						</EditableField>
					</Stack>

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
				<Stack direction='column' spacing={3}>
					<Typography variant='regularSubHeading'>Budgets</Typography>
					{mockCategoryItemData.filter(isCategory).map((cat) => (
						<EditableField key={cat.id}>
							<EditableField.View>
								<BudgetItem item={cat} />
							</EditableField.View>
							<EditableField.Edit>
								<TextField
									id='standard-basic'
									label='Standard'
									variant='standard'
								/>
							</EditableField.Edit>
						</EditableField>
					))}
				</Stack>

				<Stack direction='column' sx={{ mt: 10 }} spacing={3}>
					<Typography variant='regularSubHeading'>Planned Payments</Typography>
					{mockCategoryItemData.filter(isPlannedPayment).map((planned) => (
						<BudgetItem item={planned} key={planned.id} />
					))}
				</Stack>
			</TabPanel>
		</Box>
	);
};

export default BudgetPlanDetails;
