import { Stack, Typography, Button } from "@mui/material";
import { ProgressBar, Tray } from "../../../components";
import BudgetChip from "./BudgetChip";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { BudgetPlan } from "../budget.schema";

type BudgetPlanTrayProps = { budgetPlan: BudgetPlan };

const BudgetPlanTray = ({ budgetPlan }: BudgetPlanTrayProps) => {
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
		<Tray
			colSpan={{ xs: 12, md: 6 }}
			title={budgetPlan.name}
			actions={
				<Fragment>
					<Link to='/budgets/1' style={{ textDecoration: "none" }}>
						<Button color='secondary' endIcon={<InfoTwoToneIcon />}>
							View Plan
						</Button>
					</Link>

					<Button color='error' endIcon={<DeleteOutlineTwoToneIcon />}>
						Delete Plan
					</Button>
				</Fragment>
			}
		>
			<Stack direction='column' sx={{ mt: 2 }}>
				<Stack direction='row' justifyContent='space-between' sx={{ mb: 1 }}>
					<Typography>RM {budgetPlan.amountLeftCurrency}</Typography>
					<Typography>{budgetPlan.amountLeftPercentage}% used</Typography>
				</Stack>
				<ProgressBar
					fillType={getFillType(budgetPlan.amountLeftPercentage!)}
					fillPercentage={budgetPlan.amountLeftPercentage}
				/>
				<Stack direction='row' sx={{ mt: 2 }} alignItems='center'>
					<Typography sx={{ mr: 2 }}>Top budget: </Typography>
					<BudgetChip option='groceries' />
					<Typography variant='regularLight' sx={{ ml: 2 }}>
						2 transactions recorded
					</Typography>
				</Stack>
				<Typography textAlign='end' sx={{ mt: 1 }}>
					renews on {budgetPlan.renewalTerm}
				</Typography>
			</Stack>
		</Tray>
	);
};

export default BudgetPlanTray;
