import { Timeline, TimelineConnector, TimelineContent, TimelineItem, TimelineSeparator } from "@mui/lab";
import { Typography } from "@mui/material";
import BudgetChip, { ChipOptions } from "./BudgetChip";

const mockTimeLineData: { amount: number; date: string; budget: ChipOptions }[] = [
	{ amount: 50, date: "xx/xx/xx", budget: "entertainment" },
	{ amount: 30, date: "xx/xx/xx", budget: "groceries" },
	{ amount: 90, date: "xx/xx/xx", budget: "entertainment" },
];

const BudgetTimeline = () => {
	return (
		<Timeline position='alternate'>
			{mockTimeLineData.map((data, index, array) => (
				<TimelineItem key={index}>
					<TimelineSeparator>
						<TimelineConnector />
						<BudgetChip option={data.budget} />
						<TimelineConnector
							sx={
								index === array.length - 1
									? {
											border: "1.6px gray dashed",
											backgroundColor: "inherit",
									  }
									: {}
							}
						/>
					</TimelineSeparator>
					<TimelineContent sx={{ py: "30px", px: 2 }}>
						<Typography variant='h6' component='span'>
							RM {data.amount}
						</Typography>
						<Typography>{data.date}</Typography>
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
};

export default BudgetTimeline;
