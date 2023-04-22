import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import { Button, Stack, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProgressBar, Tray } from "../../../components";
import { BudgetPlan } from "../budget.schema";
import BudgetChip, { ChipOptions } from "./BudgetChip";
import ConfirmCloseBudgetDialog from "./ConfirmCloseBudgetDialog";
import transactionService from "../../transaction/transaction.service";

type BudgetPlanTrayProps = { budgetPlan: BudgetPlan };

const BudgetPlanTray = ({ budgetPlan }: BudgetPlanTrayProps) => {
	const [open, setOpen] = useState(false);
	const [topBudget, setTopBudget] = useState<{ budget: ChipOptions; noOfTransactions: number }>();

	useEffect(() => {
		const getTopBudget = async () => {
			const categories = (await transactionService.getMyTransactions(budgetPlan.id!)).map(
				(transac) => transac.category
			);

			if (categories.length !== 0) {
				const occurrences = categories.reduce((acc, curr) => {
					if (acc.has(curr)) {
						acc.set(curr, acc.get(curr)! + 1);
					} else {
						acc.set(curr, 1);
					}
					return acc;
				}, new Map<ChipOptions, number>());

				let maxCount = 0;
				let mostFrequent;

				for (const [key, value] of occurrences) {
					if (value > maxCount) {
						maxCount = value;
						mostFrequent = key;
					}
				}

				setTopBudget({ budget: mostFrequent as ChipOptions, noOfTransactions: maxCount });
			}
		};
		getTopBudget();
	}, []);

	const toggleConfirmationDialog = () => setOpen((open) => !open);

	const getFillType = (usage: number): { from: string; to: string } => {
		if (usage < 50) {
			return { from: "green", to: "lime" };
		} else if (usage >= 50 && usage <= 85) {
			return { from: "rgb(230, 233, 51)", to: "rgb(236, 177, 48)" };
		} else {
			return { from: "lightcoral", to: "red" };
		}
	};

	return (
		<Fragment>
			<Tray
				colSpan={{ xs: 12, md: 6 }}
				title={budgetPlan.name}
				actions={
					<Fragment>
						<Link to={`/budgets/${budgetPlan.id}`} style={{ textDecoration: "none" }}>
							<Button color='secondary' endIcon={<InfoTwoToneIcon />}>
								View Plan
							</Button>
						</Link>
						<Button
							color='error'
							endIcon={<DeleteOutlineTwoToneIcon />}
							onClick={toggleConfirmationDialog}
						>
							Delete Plan
						</Button>
					</Fragment>
				}
			>
				<Stack direction='column' sx={{ mt: 2 }}>
					<Stack direction='row' justifyContent='space-between' sx={{ mb: 1 }}>
						<Typography>RM {budgetPlan.amountLeftCurrency} left</Typography>
						<Typography>{budgetPlan.amountLeftPercentage}% used</Typography>
					</Stack>
					<ProgressBar
						fillType={getFillType(budgetPlan.amountLeftPercentage!)}
						fillPercentage={budgetPlan.amountLeftPercentage}
					/>
					{topBudget ? (
						<Stack direction='row' sx={{ mt: 2 }} alignItems='center'>
							<Typography sx={{ mr: 2 }}>Top budget: </Typography>
							<BudgetChip option={topBudget.budget} />
							<Typography variant='regularLight' sx={{ ml: 2 }}>
								{topBudget.noOfTransactions} transactions recorded
							</Typography>
						</Stack>
					) : (
						<Typography variant='regularLight' py={2}>No transactions yet for this month</Typography>
					)}

					<Typography textAlign='end' sx={{ mt: 1 }}>
						renews {budgetPlan.renewalTerm}
					</Typography>
				</Stack>
			</Tray>
			<ConfirmCloseBudgetDialog
				open={open}
				toggleModal={toggleConfirmationDialog}
				budgetPlanId={budgetPlan.id!}
			/>
		</Fragment>
	);
};

export default BudgetPlanTray;
