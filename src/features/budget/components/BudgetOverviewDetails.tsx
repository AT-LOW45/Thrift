import { Stack, TextField, Typography } from "@mui/material";
import { Fragment } from "react";
import EditableField from "../../../components/form/editable/EditableField";
import { useEditable } from "../../../context/EditableContext";
import { BudgetPlanOverview } from "../budget.schema";

const mockAllocationData = [
	{ field: "Allocated", amount: 300, colour: "black" },
	{ field: "Spent", amount: 60, colour: "red" },
	{ field: "Planned Payments", amount: 100, colour: "#F8964C" },
	{ field: "Remaining", amount: 100, colour: "green" },
];

const BudgetOverviewDetails = () => {
	const { setFormContext, handleInputChange } = useEditable<BudgetPlanOverview>();

	setFormContext(async (x) => {
		console.log(x.note);
	});

	const getMathOperator = (index: number, array: typeof mockAllocationData): string => {
		if (index === array.length - 1) return "";
		return index === array.length - 2 ? "=" : "-";
	};

	return (
		<Fragment>
			<EditableField compact>
				<EditableField.View>
					<Stack
						direction={{ sm: "column", lg: "row" }}
						spacing={{ xs: 1, md: 3 }}
						alignItems='center'
					>
						{mockAllocationData.map((data, index, array) => (
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
						onChange={handleInputChange}
					/>
				</EditableField.Edit>
			</EditableField>
			<EditableField compact>
				<EditableField.View>
					<Typography variant='regularLight' component='p'>
						Usage is at 25% You will be alerted once it reaches 80%
					</Typography>
				</EditableField.View>
				<EditableField.Edit>
					<TextField
						name='spendingThreshold'
						variant='standard'
						onChange={handleInputChange}
					/>
				</EditableField.Edit>
			</EditableField>
			<Stack direction='column' sx={{ mt: 4 }} spacing={1}>
				<EditableField compact>
					<EditableField.View>
						<Typography variant='regularSubHeading'>About this plan</Typography>
						<Typography component='p' textAlign='justify'>
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam iste
							deserunt maxime perspiciatis, possimus sed aut dignissimos
							necessitatibus aliquid tempore. Lorem, ipsum dolor sit amet consectetur
							adipisicing elit. Et nemo distinctio assumenda doloribus eos aliquam
							exercitationem harum beatae, atque praesentium itaque dicta magni
							architecto natus repudiandae provident recusandae doloremque autem?
						</Typography>
					</EditableField.View>
					<EditableField.Edit>
						<TextField name='note' variant='standard' onChange={handleInputChange} />
					</EditableField.Edit>
				</EditableField>
			</Stack>
		</Fragment>
	);
};

export default BudgetOverviewDetails;
