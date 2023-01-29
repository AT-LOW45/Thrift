import { Stack, Typography, Button } from "@mui/material";
import { ProgressBar, Tray } from "../../../components";
import BudgetChip from "./BudgetChip";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import { Fragment } from "react";
import { Link } from "react-router-dom";

const BudgetPlanTray = () => {
	return (
		<Tray
			title='Budget Plan 1'
			actions={
				<Fragment>
					<Link to='/budgets/1' style={{textDecoration: "none"}}>
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
					<Typography>RM 150 remaining</Typography>
					<Typography>25% used</Typography>
				</Stack>
				<ProgressBar fillType='green' />
				<Stack direction='row' sx={{ mt: 2 }} alignItems='center'>
					<Typography sx={{ mr: 2 }}>Top budget: </Typography>
					<BudgetChip option='entertainment' />
					<Typography variant='regularLight' sx={{ ml: 2 }}>
						2 transactions recorded
					</Typography>
				</Stack>
				<Typography textAlign='end' sx={{ mt: 1 }}>
					renews on xx/xx/xx
				</Typography>
			</Stack>
		</Tray>
	);
};

export default BudgetPlanTray;
