import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import PeopleIcon from "@mui/icons-material/People";
import { ListItemIcon, ListItemText } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DrawerContext from "./DrawerContext";
import theme from "../../assets/theme";

const ResponsiveDrawer = () => {
	const location = useLocation();
	const { handleDrawerToggle, mobileOpen } = useContext(DrawerContext);

	const navOptions = [
		{ text: "Overview", link: "/overview", icon: DashboardIcon },
		{ text: "Budgets", link: "/budgets", icon: AnalyticsIcon },
		{ text: "Transactions", link: "/transactions", icon: CompareArrowsIcon },
		{ text: "Accounts and Payment Details", link: "accounts", icon: AccountBalanceIcon },
		{ text: "Community", link: "/community", icon: Diversity3Icon },
		{ text: "Group Planning", link: "/group-planning", icon: PeopleIcon },
	] as const;

	const drawer = (
		<div>
			<Divider />
			<List>
				{navOptions.map((option) => (
					<ListItem key={option.text} disablePadding>
						<NavLink
							to={option.link}
							style={({ isActive }) => {
								return isActive
									? {
											color: theme.palette.tertiary.main,
											textDecoration: "none",
											width: "100%",
									  }
									: { color: "black", textDecoration: "none", width: "100%" };
							}}
						>
							<ListItemButton>
								<ListItemIcon>
									<option.icon
										sx={
											location.pathname === option.link
												? { color: "tertiary.main" }
												: {}
										}
									/>
								</ListItemIcon>
								<ListItemText primary={option.text} />
							</ListItemButton>
						</NavLink>
					</ListItem>
				))}
			</List>
		</div>
	);

	return (
		<Box
			component='nav'
			sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
			aria-label='mailbox folders'
		>
			<Drawer
				variant='temporary'
				open={mobileOpen}
				onClose={handleDrawerToggle}
				ModalProps={{
					keepMounted: true, // Better open performance on mobile.
				}}
				sx={{
					display: { xs: "block", sm: "none" },
					"& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
				}}
			>
				{drawer}
			</Drawer>
			<Drawer
				variant='permanent'
				sx={{
					display: { xs: "none", sm: "block" },
					"& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
				}}
				open
			>
				{drawer}
			</Drawer>
		</Box>
	);
};

export default ResponsiveDrawer;
