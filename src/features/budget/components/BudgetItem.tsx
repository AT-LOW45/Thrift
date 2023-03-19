import { Stack, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BudgetChip, budgetService } from "..";
import { ProgressBar } from "../../../components";
import { FirestoreTimestampObject } from "../../../service/thrift";
import { Category, PlannedPayment } from "../budget.schema";
import { chipVariantHueList } from "./BudgetChip";

type BudgetItemProps = {
	item: Category | PlannedPayment;
};

const BudgetItem = ({ item }: BudgetItemProps) => {
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>();
	const [remainingAmount, setRemainingAmount] = useState<
		Awaited<ReturnType<typeof budgetService.getRemainingCategoryAmount>>
	>({ amountLeftCurrencyCat: 0, amountLeftPercentageCat: 0 });

	useEffect(() => {
		const getBudgetRemainingAmount = async () => {
			if (isCategory(item)) {
				setIsLoading(true);
				const { amountLeftCurrencyCat, amountLeftPercentageCat } =
					await budgetService.getRemainingCategoryAmount(id!, item.name);

				setRemainingAmount({
					amountLeftCurrencyCat: item.spendingLimit - amountLeftCurrencyCat,
					amountLeftPercentageCat,
				});
				setIsLoading(false);
			}
		};
		getBudgetRemainingAmount();
	}, []);

	const isCategory = (item: Category | PlannedPayment): item is Category => {
		return "spendingLimit" in item;
	};

	const convertDate = (timestamp: FirestoreTimestampObject) => {
		return new Date(timestamp.seconds * 1000).toLocaleDateString();
	};

	return (
		<Stack direction='row'>
			{isCategory(item) ? <BudgetChip option={item.name} /> : <BudgetChip option='repeat' />}

			<Stack direction='column' sx={{ flexGrow: 1, ml: 3 }}>
				<Stack direction='row' spacing={5} alignItems='center'>
					{isCategory(item) ? (
						<Fragment>
							{!isLoading && (
								<ProgressBar
									fillPercentage={remainingAmount.amountLeftPercentageCat}
									fillType={{
										from: chipVariantHueList[item.name].primaryHue,
										to: chipVariantHueList[item.name].secondaryHue,
									}}
								/>
							)}
							<Typography variant='numberHeading'>
								{remainingAmount.amountLeftPercentageCat}%
							</Typography>
						</Fragment>
					) : (
						<Fragment>
							<Typography variant='numberHeading'>RM {item.amount}</Typography>
							<Typography variant='regularLight'>
								every month starting &nbsp;
								{convertDate(item.startDate as FirestoreTimestampObject)}
							</Typography>
						</Fragment>
					)}
				</Stack>
				<Stack direction='row' justifyContent='space-between'>
					{isCategory(item) ? (
						<Fragment>
							<Typography>{item.name}</Typography>
							<Typography variant='regularLight'>
								RM {remainingAmount.amountLeftCurrencyCat}/{item.spendingLimit}
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
