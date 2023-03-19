import { Box, Slider, Stack, TextField, Typography } from "@mui/material";
import { Fragment } from "react";
import EditableField from "../../../components/form/editable/EditableField";
import useBudgetOverviewEdit from "../hooks/useBudgetOverviewEdit";

const BudgetOverviewDetails = () => {
	const {
		allocationData,
		formData,
		getMathOperator,
		handleSliderChange,
		placeholderFormData,
		handleLimit,
		handleNote,
	} = useBudgetOverviewEdit();

	return (
		<Stack spacing={2}>
			<EditableField compact>
				<EditableField.View>
					<Stack
						direction={{ sm: "column", lg: "row" }}
						spacing={{ xs: 1, md: 3 }}
						alignItems='center'
					>
						{allocationData.map((data, index, array) => (
							<Fragment key={data.field}>
								<Stack
									direction='column'
									alignItems='center'
									sx={{ color: data.colour }}
								>
									<Typography variant='regularSubHeading'>
										{data.field}
									</Typography>
									<Typography variant='numberHeading'>{data.amount}</Typography>
								</Stack>
								<Typography variant='regularSubHeading'>
									{getMathOperator(index, array)}
								</Typography>
							</Fragment>
						))}
					</Stack>
				</EditableField.View>
				<EditableField.Edit>
					<TextField
						name='spendingLimit'
						variant='standard'
						value={placeholderFormData.spendingLimit}
						onChange={handleLimit}
					/>
				</EditableField.Edit>
			</EditableField>
			<EditableField compact>
				<EditableField.View>
					<Typography variant='regularLight' component='p'>
						Usage is at 25% You will be alerted once it reaches &nbsp;
						{formData.spendingThreshold}%
					</Typography>
				</EditableField.View>
				<EditableField.Edit>
					<Box sx={{ width: 300 }}>
						<Slider
							sx={{ transition: "all 200ms" }}
							aria-label='Temperature'
							value={placeholderFormData.spendingThreshold}
							onChange={handleSliderChange}
							valueLabelDisplay='auto'
							step={10}
							marks
							color={
								placeholderFormData.spendingThreshold > 80 ? "warning" : "primary"
							}
							min={10}
							max={100}
						/>
					</Box>
				</EditableField.Edit>
			</EditableField>
			<Stack direction='column' sx={{ mt: 4 }} spacing={1}>
				<EditableField compact>
					<EditableField.View>
						<Typography variant='regularSubHeading'>About this plan</Typography>
						<Typography component='p' textAlign='justify'>
							{formData.note}
						</Typography>
					</EditableField.View>
					<EditableField.Edit>
						<TextField
							id='outlined-multiline-static'
							label='Memo'
							name='note'
							value={placeholderFormData.note}
							onChange={handleNote}
							multiline
							helperText='Add a short memo to describe this budget plan'
							rows={4}
						/>
					</EditableField.Edit>
				</EditableField>
			</Stack>
		</Stack>
	);
};

export default BudgetOverviewDetails;
