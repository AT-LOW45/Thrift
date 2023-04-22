import MenuIcon from "@mui/icons-material/Menu";
import { AppBar, Box, IconButton, styled, SxProps, Toolbar } from "@mui/material";
import { Fragment, useContext } from "react";
import DrawerContext from "./DrawerContext";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";
import { AuthContext } from "../../context/AuthContext";

const TopNav = () => {
	const { user } = useContext(AuthContext);
	const { handleDrawerToggle } = useContext(DrawerContext);

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
				<Box sx={{ ml: "auto", display: "flex", py: 2 }}>
					{user !== null && (
						<Fragment>
							<NotificationsMenu />
							<ProfileMenu />
						</Fragment>
					)}
				</Box>
			</Toolbar>
		</CustomAppBar>
	);
};

export default TopNav;
