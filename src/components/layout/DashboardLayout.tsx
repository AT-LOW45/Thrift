import { Box, CssBaseline, styled, SxProps, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { DrawerContextProvider } from "./DrawerContext";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

const DashboardLayout = () => {
	const ContentArea = styled(Box)(({ theme }) => ({
		flexGrow: 1,
		p: 3,
		[theme.breakpoints.up("sm")]: {
			width: `calc(100% - 240px)`,
		} satisfies SxProps,
		minHeight: "100vh",
		backgroundColor: "#EEF4F5",
	}));

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<DrawerContextProvider>
				<SideNav />
				<TopNav />
			</DrawerContextProvider>
			<ContentArea component='main' className='content-area'>
				<Toolbar sx={{ width: "100%" }} />
				<Outlet context={{ hello: "world" }} />
			</ContentArea>
		</Box>
	);
};

export default DashboardLayout;
