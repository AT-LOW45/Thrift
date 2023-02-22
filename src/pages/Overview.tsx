import { Button } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useOutletContext } from "react-router-dom";
import { Tray } from "../components";

const Overview = () => {
	const hey: { hello: string } = useOutletContext();

	return (
		<Grid2 container spacing={4} sx={{ p: 3, m: 0 }}>
			<Tray colSpan={{xs: 3}} title='Title' actions={<Button variant='contained'>hi</Button>}>
				<div></div>
			</Tray>
		</Grid2>
	);
};

export default Overview;
