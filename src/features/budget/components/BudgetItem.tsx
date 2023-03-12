import { Stack, Typography } from "@mui/material";
import { Fragment } from "react";
import { BudgetChip } from "..";
import { ProgressBar } from "../../../components";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { Category, PlannedPayment } from "../budget.schema";
import { chipVariantHueList } from "./BudgetChip";

type BudgetItemProps = {
	item: Category | PlannedPayment;
};

const BudgetItem = ({ item }: BudgetItemProps) => {
	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "amountLeftCurrency" in item;
	};

	const isPlannedPayment = (item: Category | PlannedPayment): item is PlannedPayment => {
		return "startDate" in item;
	};

	const dateConverted =
		isPlannedPayment(item) &&
		new Date((item.startDate as FirestoreTimestampObject).seconds * 1000);

	return (
		<Stack direction='row'>
			{isCategory(item) ? <BudgetChip option={item.name} /> : <BudgetChip option='repeat' />}

			<Stack direction='column' sx={{ flexGrow: 1, ml: 3 }}>
				<Stack direction='row' spacing={5} alignItems='center'>
					{isCategory(item) ? (
						<Fragment>
							<ProgressBar
								fillPercentage={60}
								fillType={{
									from: chipVariantHueList[item.name].primaryHue,
									to: chipVariantHueList[item.name].secondaryHue,
								}}
							/>
							<Typography variant='numberHeading'>
								{item.amountLeftPercentage}%
							</Typography>
						</Fragment>
					) : (
						<Fragment>
							<Typography variant='numberHeading'>RM {item.amount}</Typography>
							<Typography variant='regularLight'>
								every month starting {(dateConverted as Date).toLocaleDateString()}
							</Typography>
						</Fragment>
					)}
				</Stack>
				<Stack direction='row' justifyContent='space-between'>
					{isCategory(item) ? (
						<Fragment>
							<Typography>{item.name}</Typography>
							<Typography variant='regularLight'>
								RM {item.amountLeftCurrency}/{item.spendingLimit}
							</Typography>
						</Fragment>
					) : (
						<Typography>{item.name}</Typography>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default BudgetItem;
