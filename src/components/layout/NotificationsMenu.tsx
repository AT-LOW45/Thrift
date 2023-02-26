import { Logout } from "@mui/icons-material";
import {
	Box,
	IconButton,
	Menu,
	MenuItem,
	Avatar,
	Divider,
	ListItemIcon,
	Tooltip,
	Typography,
	Stack,
} from "@mui/material";
import React, { Fragment, useState } from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsPausedIcon from "@mui/icons-material/NotificationsPaused";

const NotificationsMenu = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const notificationsList: string[] = [];

	return (
		<Fragment>
			<Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
				<Tooltip title='Notifications'>
					<IconButton
						disableRipple
						color='primary'
						sx={{
							borderRadius: "10px",
							backgroundColor: "white",
							marginLeft: "5px",
							border: "1px solid lightgray",
							"&:hover": { backgroundColor: "#f0f0f0" },
						}}
						onClick={handleClick}
					>
						<NotificationsNoneOutlinedIcon />
					</IconButton>
				</Tooltip>
			</Box>
			<Menu
				anchorEl={anchorEl}
				id='account-menu'
				open={open}
				onClose={handleClose}
				PaperProps={{
					elevation: 0,
					sx: {
						overflow: "visible",
						filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
						mt: 1.5,
						py: 2,
						px: 3,
						"&:before": {
							content: '""',
							display: "block",
							position: "absolute",
							top: 0,
							right: 14,
							width: 10,
							height: 10,
							bgcolor: "background.paper",
							transform: "translateY(-50%) rotate(45deg)",
							zIndex: 0,
						},
					},
				}}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				{notificationsList.length === 0 ? (
					<Typography
						variant='regularLight'
						component='p'
						sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
					>
						<NotificationsPausedIcon sx={{ fontSize: "2.5rem", mb: 2 }} />
						No notifications
					</Typography>
				) : (
					notificationsList.map((note, index) => <MenuItem key={index}>Hi</MenuItem>)
				)}
			</Menu>
		</Fragment>
	);
};

export default NotificationsMenu;
