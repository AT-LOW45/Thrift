import { Stack, Typography } from "@mui/material";
import { Fragment } from "react";
import { BudgetChip } from "..";
import { ProgressBar } from "../../../components";
import { Category, PlannedPayment } from "../models";

type BudgetItemProps = {
	item: Category | PlannedPayment
}

const BudgetItem = ({item}: BudgetItemProps) => {
	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "colourScheme" in item;
	};

	return (
		<Stack direction='row' sx={{display: ""}}>
			{isCategory(item) ? (
				<BudgetChip option={item.iconType} />
			) : (
				<BudgetChip option='repeat' />
			)}

			<Stack direction='column' sx={{ flexGrow: 1, ml: 3 }}>
				<Stack direction='row' spacing={5} alignItems='center'>
					{isCategory(item) ? (
						<Fragment>
							<ProgressBar
								fillType={{
									from: item.colourScheme.primaryHue,
									to: item.colourScheme.secondaryHue,
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
								{`every month starting ${item.startDate}`}
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
