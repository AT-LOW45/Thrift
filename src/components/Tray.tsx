import { Box, CardActions, CardContent, Typography } from "@mui/material";
import Card from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

type SpanValues = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type TrayProps = {
	title: string;
	colSpan?: { xs: SpanValues; md?: SpanValues; lg?: SpanValues };
	children: JSX.Element;
	actions?: JSX.Element;
	transparent?: boolean;
};

const Tray = ({ title, colSpan, children, actions, transparent }: TrayProps) => {
	const TrayCard = styled(Card)(() => ({
		borderRadius: "15px",
		boxShadow: transparent ? "none" : "0 4px 10px 3px lightgray",
		padding: "0.8rem 1.2rem",
		backgroundColor: transparent ? "inherit" : "white",
	}));

	return (
		<Grid2
			xs={colSpan === undefined ? "auto" : colSpan.xs}
			md={colSpan === undefined ? "auto" : colSpan.md}
			lg={colSpan === undefined ? "auto" : colSpan.lg}
		>
			<TrayCard className='Tray'>
				<CardContent>
					<Typography component="p" pb={2} variant='regularSubHeading'>{title}</Typography>
					{children}
				</CardContent>
				{actions !== undefined && (
					<CardActions>
						<Box sx={{ ml: "auto" }}></Box>
						{actions}
					</CardActions>
				)}
			</TrayCard>
		</Grid2>
	);
};

export default Tray;
