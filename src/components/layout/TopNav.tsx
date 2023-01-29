import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { AppBar, Box, IconButton, styled, SxProps, Toolbar, Typography } from "@mui/material";
import { useContext } from "react";
import DrawerContext from "./DrawerContext";

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

	const TopNavButton = styled(IconButton)(() => ({
		borderRadius: "10px",
		backgroundColor: "white",
		border: "1px solid lightgray",
		marginLeft: "5px",
		"&:hover": {
			backgroundColor: "#f0f0f0",
		},
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
				<Box sx={{ ml: "auto" }}>
					<TopNavButton
						disableRipple
						color='primary'
					>
						<NotificationsNoneOutlinedIcon />
					</TopNavButton>
					<TopNavButton disableRipple color='secondary'>
						<AccountCircleOutlinedIcon />
					</TopNavButton>
				</Box>
			</Toolbar>
		</CustomAppBar>
	);
};

export default TopNav;
