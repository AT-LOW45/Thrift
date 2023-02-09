import { Box, DialogContentText, Slider, Typography } from "@mui/material";
import { Fragment } from "react";
import { useMultiStep } from "../../../../context/MultiStepContext";
import { BudgetPlan } from "../../models";

const Threshold = () => {
	const { formData, updateContext } = useMultiStep<BudgetPlan>();

	function valuetext(value: number) {
		return `${value}°C`;
	}

	const handleSliderChange = (event: Event, val: number | number[]) => {
		console.log(val);
		updateContext({ key: "spendingThreshold", value: val as number }, (plan) => {
			return [];
		});
	};

	return (
		<Fragment>
			<Typography variant='regularSubHeading'>RM {formData.spendingLimit}</Typography>
			<Box sx={{ width: 300 }}>
				<Slider
					sx={{ transition: "all 200ms" }}
					aria-label='Temperature'
					getAriaValueText={valuetext}
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
