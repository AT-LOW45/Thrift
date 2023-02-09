import { Stack, TextField, Typography } from "@mui/material";
import { Fragment, useContext } from "react";
import { EditableContext, EditableContextType } from "../../../context/EditableContext";
import EditableField from "../../../components/form/editable/EditableField";
import { Category, PlannedPayment } from "../models";
import BudgetItem from "./BudgetItem";

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

const BudgetCategories = () => {
	const { handleInputChange } = useContext<EditableContextType<Category>>(EditableContext);

	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "colourScheme" in item;
	};

	const isPlannedPayment = (item: Category | PlannedPayment): item is PlannedPayment => {
		return "startDate" in item;
	};
	return (
		<Fragment>
			<Stack direction='column' spacing={3}>
				<Typography variant='regularSubHeading'>Budgets</Typography>
				{mockCategoryItemData.filter(isCategory).map((cat) => (
					<EditableField key={cat.id} compact={false}>
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
				{mockCategoryItemData.filter(isPlannedPayment).map((planned) => (
					<BudgetItem item={planned} key={planned.id} />
				))}
			</Stack>
		</Fragment>
	);
};

export default BudgetCategories;
