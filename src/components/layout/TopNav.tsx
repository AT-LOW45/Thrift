import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { NavProps } from "./DashboardLayout";

const TopNav = ({ drawerWidth, handleDrawerToggle, mobileOpen }: NavProps) => {

	// reference
	// const CustomAppBar = styled(AppBar)(({theme}) => ({
	// 	backgroundColor: "white",
	// 	"&::before": {
	// 		filter: "blur(8px)"
	// 	} satisfies SxProps
	// }))

	return (
		<AppBar
			sx={{
				width: { sm: `calc(100% - ${drawerWidth}px)` },
				ml: { sm: `${drawerWidth}px` },
				backdropFilter: "blur(5px)",
			}}
			color='transparent'
		>
			<Toolbar>
				<IconButton
					color='inherit'
					aria-label='open drawer'
					edge='start'
					onClick={handleDrawerToggle}
					sx={{ mr: 2, display: { sm: "none" } }}
				>
					<MenuIcon />
				</IconButton>
				<Typography
					variant='h6'
					noWrap
					component='div'
					color='black'
					sx={{ zIndex: "1200" }}
				>
					Responsive drawer
				</Typography>
			</Toolbar>
		</AppBar>
	);
};

export default TopNav;
