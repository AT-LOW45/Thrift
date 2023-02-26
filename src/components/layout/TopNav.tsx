import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, IconButton, styled, SxProps, Toolbar } from "@mui/material";
import { useContext } from "react";
import DrawerContext from "./DrawerContext";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";

const TopNav = () => {
	const CustomAppBar = styled(AppBar)(({ theme }) => ({
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		backdropFilter: "blur(2px)",
		[theme.breakpoints.up("sm")]: {
			width: `calc(100% - 240px)`,
			marginLeft: `240px`,
		} satisfies SxProps,
		boxShadow: "none",
		borderBottom: "1px solid lightgray",
	}));

	const { handleDrawerToggle } = useContext(DrawerContext);

	return (
		<CustomAppBar>
			<Toolbar>
				<IconButton
					color='default'
					aria-label='open drawer'
					edge='start'
					onClick={handleDrawerToggle}
					sx={{ mr: 2, display: { sm: "none" } }}
				>
					<MenuIcon />
				</IconButton>
				<Box sx={{ ml: "auto", display: "flex" }}>
					<NotificationsMenu />
					<ProfileMenu />
				</Box>
			</Toolbar>
		</CustomAppBar>
	);
};

export default TopNav;
