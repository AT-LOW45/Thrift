import { Stack, TextField, Typography } from "@mui/material";
import { Fragment } from "react";
import EditableField from "../../../components/form/editable/EditableField";
import { useEditable } from "../../../context/EditableContext";
import { Category, PlannedPayment } from "../budget.schema";
import BudgetItem from "./BudgetItem";

const mockCategoryItemData: (Category | PlannedPayment)[] = [
	{
		name: "groceries",
		spendingLimit: 60,
		amountLeftCurrency: 30,
		amountLeftPercentage: 52,
	},
	{
		name: "Netflix sub",
		amount: 12,
		startDate: new Date(),
	},
];

const BudgetCategories = () => {
	const { handleInputChange, setFormContext } = useEditable<Category>()

	setFormContext((cat) => {
		console.log(cat.name)
	})

	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "amountLeftCurrency" in item;
	};

	const isPlannedPayment = (item: Category | PlannedPayment): item is PlannedPayment => {
		return "startDate" in item;
	};
	return (
		<Fragment>
			<Stack direction='column' spacing={3}>
				<Typography variant='regularSubHeading'>Budgets</Typography>
				{mockCategoryItemData.filter(isCategory).map((cat, index) => (
					<EditableField key={index} compact={false}>
						<EditableField.View>
							<BudgetItem item={cat} />
						</EditableField.View>
						<EditableField.Edit>
							<TextField
								onChange={handleInputChange}
								name='test'
								variant='standard'
							/>
						</EditableField.Edit>
					</EditableField>
				))}
			</Stack>
			<Stack direction='column' sx={{ mt: 10 }} spacing={3}>
				<Typography variant='regularSubHeading'>Planned Payments</Typography>
				{mockCategoryItemData.filter(isPlannedPayment).map((planned, index) => (
					<BudgetItem item={planned} key={index} />
				))}
			</Stack>
		</Fragment>
	);
};

export default BudgetCategories;
