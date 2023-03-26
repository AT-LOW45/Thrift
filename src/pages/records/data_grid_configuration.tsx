import { Typography, Button } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

const data_grid_configuration = (openDialog: (recordId: string) => void) => {
	const columnsIncome: GridColDef[] = [
		{ field: "number", headerName: "No.", width: 90 },
		{
			field: "type",
			headerName: "Type",
			width: 150,
			editable: true,
		},
		{
			field: "amount",
			headerName: "Amount",
			width: 180,
			editable: true,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							display: "flex",
							alignItems: "center",
							backgroundColor: "rgb(180, 255, 176)",
							color: "green",
							px: 2,
							py: 1,
							borderRadius: "10px",
						}}
						variant='numberParagraph'
						component='p'
					>
						RM {params.row.amount}
						<TrendingUpIcon />
					</Typography>
				);
			},
		},
		{
			field: "transactionDate",
			headerName: "Transaction Date",
			width: 150,
		},
		{
			field: "details",
			headerName: "Details",
			headerAlign: "center",
			align: "center",
			sortable: false,
			renderCell: (params) => {
				return (
					<Button
						variant='outlined'
						color='secondary'
						onClick={() => openDialog(params.row.id as string)}
					>
						View Details
					</Button>
				);
			},
			width: 150,
			filterable: false,
		},
	];

	const columnsGroupTransactions: GridColDef[] = [
		{
			field: "number",
			headerName: "No.",
			width: 90,
		},
		{
			field: "category",
			headerName: "Category",
			width: 150,
		},
		{
			field: "amount",
			headerName: "Amount",
			width: 180,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							display: "flex",
							alignItems: "center",
							backgroundColor: `${
								params.row.status === false
									? "rgb(240, 208, 79)"
									: "rgb(242, 136, 136)"
							}`,
							color: `${
								params.row.status === false
									? "rgb(176, 142, 7)"
									: "rgb(rgb(207, 0, 0))"
							}`,
							px: 2,
							py: 1,
							borderRadius: "10px",
						}}
						variant='numberParagraph'
						component='p'
					>
						RM {params.row.amount}
						<TrendingFlatIcon />
					</Typography>
				);
			},
		},
		{
			field: "transactionDate",
			headerName: "Transaction Date",
			width: 150,
		},
		{
			field: "details",
			headerName: "Details",
			headerAlign: "center",
			align: "center",
			sortable: false,
			renderCell: (params) => {
				return (
					<Button
						variant='outlined'
						color='secondary'
						onClick={() => openDialog(params.row.id as string)}
					>
						View Details
					</Button>
				);
			},
			width: 150,
			filterable: false,
		},
	];

	const columnsTransactions: GridColDef[] = [
		columnsGroupTransactions[0],
		columnsGroupTransactions[1],
		columnsGroupTransactions[3],
		{
			field: "amount",
			headerName: "Amount",
			width: 180,
			renderCell: (params) => {
				return (
					<Typography
						sx={{
							display: "flex",
							alignItems: "center",
							backgroundColor: "rgb(242, 136, 136)",
							color: "rgb(207, 0, 0)",
							px: 2,
							py: 1,
							borderRadius: "10px",
						}}
						variant='numberParagraph'
						component='p'
					>
						RM {params.row.amount}
						<TrendingDownIcon />
					</Typography>
				);
			},
		},
		{
			field: "budgetPlan",
			headerName: "Budget Plan",
			type: "number",
			width: 150,
			editable: false,
			align: "left",
			headerAlign: "left",
		},
		{
			field: "account",
			headerName: "Deducted from",
			width: 150,
			editable: false,
		},
		columnsGroupTransactions[4],
	];

	const columnsGroupIncome: GridColDef[] = [
		columnsIncome[0],
		columnsIncome[2],
		columnsIncome[3],
		columnsIncome[4],
		{
			field: "madeBy",
			headerName: "contributed by",
			type: "number",
			width: 150,
			editable: false,
		},
	];

	return { columnsTransactions, columnsIncome, columnsGroupTransactions, columnsGroupIncome };
};

export default data_grid_configuration;
