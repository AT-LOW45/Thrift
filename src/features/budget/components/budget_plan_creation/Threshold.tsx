import { Box, DialogContentText, Slider, Typography } from "@mui/material";
import { Fragment, useEffect } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { BudgetPlan } from "../../budget.schema";

const Threshold = () => {
	const { formData, updateContext } = useMultiStep<BudgetPlan>();

	useEffect(() => {
		updateContext({ key: "spendingThreshold", value: formData.spendingThreshold }, (plan) => {
			return [plan.spendingThreshold > 0 && plan.spendingThreshold <= 100];
		});
	}, []);

	const handleSliderChange = (event: Event, val: number | number[]) => {
		updateContext({ key: "spendingThreshold", value: val as number }, (plan) => {
			return [plan.spendingThreshold > 0 && plan.spendingThreshold <= 100];
		});
	};

	return (
		<Fragment>
			<Typography variant='regularSubHeading'>RM {formData.spendingLimit}</Typography>
			<Box sx={{ width: 300 }}>
				<Slider
					sx={{ transition: "all 200ms" }}
					aria-label='Temperature'
					value={formData.spendingThreshold}
					onChange={handleSliderChange}
					valueLabelDisplay='auto'
					step={10}
					marks
					color={formData.spendingThreshold > 80 ? "warning" : "primary"}
					min={10}
					max={100}
				/>
			</Box>
			<DialogContentText sx={{ px: 10 }} textAlign='center'>
				You will receive an alert if you spend beyond this threshold. We recommend a maximum
				threshold of 80%
			</DialogContentText>
		</Fragment>
	);
};

export default Threshold;
