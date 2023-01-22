import { Box, CssBaseline, Toolbar } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export type NavProps = {
	mobileOpen: boolean;
	handleDrawerToggle(): void;
	drawerWidth: number;
};

const DashboardLayout = () => {
	const drawerWidth = 240;
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleDrawerToggle = useCallback(() => {
		setMobileOpen(!mobileOpen);
	}, [mobileOpen]);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<SideNav
				drawerWidth={drawerWidth}
				handleDrawerToggle={handleDrawerToggle}
				mobileOpen={mobileOpen}
			/>
			<TopNav
				drawerWidth={drawerWidth}
				handleDrawerToggle={handleDrawerToggle}
				mobileOpen={mobileOpen}
			/>

			<Grid2
				container
				component='main'
				sx={{
					flexGrow: 1,
					p: 3,
					width: { sm: `calc(100% - ${drawerWidth}px)` },
				}}
			>
				<Toolbar sx={{width: "100%"}} />
				<Outlet context={{hello: "world"}} />
			</Grid2>
		</Box>
	);
};

export default DashboardLayout;
