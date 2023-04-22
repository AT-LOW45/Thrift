import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import NotificationsPausedIcon from "@mui/icons-material/NotificationsPaused";
import {
	Badge,
	Box,
	Button,
	Dialog,
	DialogContent,
	IconButton,
	Menu,
	Stack,
	MenuItem,
	Portal,
	Tooltip,
	Typography,
	DialogContentText,
} from "@mui/material";
import React, { Fragment, useContext, useEffect, useState } from "react";
import NotificationItem, { notificationTypes } from "../../features/notification/NotificationItem";
import useRealtimeUpdate from "../../hooks/useRealtimeUpdate";
import { AuthContext } from "../../context/AuthContext";
import { Notification } from "../../features/notification/notification.schema";
import { orderBy, where } from "firebase/firestore";
import notificationService from "../../features/notification/notification.service";
import { SvgIconComponent } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const NotificationsMenu = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const { user } = useContext(AuthContext);
	const { firestoreCollection } = useRealtimeUpdate<Notification>(
		{ data: { collection: "Notification" } },
		where("sendTo", "array-contains", user?.uid!),
		orderBy("dateCreated", "desc")
	);
	const navigate = useNavigate();
	const [notificationDetailsDialogOpen, setNotificationsDetailDialogOpen] = useState(false);
	const [selectedNotification, setSelectedNotification] = useState<Notification>();
	const [NotificationIcon, setNotificationIcon] = useState<SvgIconComponent>();

	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const toggleNotificationDetailsDialog = () => setNotificationsDetailDialogOpen((open) => !open);

	const getUnreadNotificationsCount = () =>
		firestoreCollection.filter((notification) => notification.read === false).length;

	const findSelectedNotification = async (notificationId: string) => {
		const foundNotification = firestoreCollection.find((note) => note.id === notificationId);
		if (foundNotification) {
			setSelectedNotification(foundNotification);
			toggleNotificationDetailsDialog();
			if (foundNotification.read === false) {
				await notificationService.markSelectedAsRead(foundNotification.id!);
			}
		}
	};

	useEffect(() => {
		selectedNotification &&
			setNotificationIcon(notificationTypes[selectedNotification.type].icon);
	}, [selectedNotification]);

	return (
		<Fragment>
			<Box sx={{ display: "flex", alignItems: "center", textAlign: "center", mr: 1 }}>
				<Tooltip title='Notifications'>
					<Badge
						badgeContent={
							getUnreadNotificationsCount() === 0 ? "" : getUnreadNotificationsCount()
						}
						color={getUnreadNotificationsCount() === 0 ? "default" : "error"}
					>
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
					</Badge>
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
				{firestoreCollection.length === 0 ? (
					<Typography
						variant='regularLight'
						component='p'
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							px: 5,
							py: 3,
						}}
					>
						<NotificationsPausedIcon sx={{ fontSize: "2.5rem", mb: 2 }} />
						No notifications
					</Typography>
				) : (
					firestoreCollection.slice(0, 3).map((notification) => (
						<MenuItem
							sx={{ px: 3, py: 2, minWidth: 200 }}
							key={notification.id}
							onClick={() => findSelectedNotification(notification.id!)}
						>
							<NotificationItem notification={notification} />
						</MenuItem>
					))
				)}
				<Button
					sx={{ fontSize: "0.7rem", mt: 2, width: "100%" }}
					onClick={() => navigate("/notifications")}
				>
					View More
				</Button>
			</Menu>
			<Portal>
				<Dialog
					open={notificationDetailsDialogOpen}
					onClose={toggleNotificationDetailsDialog}
					fullWidth
					maxWidth='sm'
				>
					{selectedNotification && (
						<DialogContent>
							<Stack spacing={3}>
								{NotificationIcon && (
									<Stack flexGrow={1} alignItems='center'>
										<Box
											sx={{
												borderRadius: "50%",
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
												width: "fit-content",
												height: "fit-content",
												padding: "10px 10px",
												backgroundColor:
													notificationTypes[selectedNotification.type]
														.backgroundColour,
											}}
										>
											<NotificationIcon
												fontSize='large'
												sx={{
													color: notificationTypes[
														selectedNotification.type
													].colour,
												}}
											/>
										</Box>
									</Stack>
								)}

								<Stack direction='row' spacing={2}>
									<Stack spacing={1} flexGrow={1}>
										<DialogContentText fontSize='1.1rem' textAlign='center'>
											{selectedNotification?.title}
										</DialogContentText>
										<Typography textAlign='center'>
											{selectedNotification?.message}
										</Typography>
									</Stack>
								</Stack>
							</Stack>
						</DialogContent>
					)}
				</Dialog>
			</Portal>
		</Fragment>
	);
};

export default NotificationsMenu;
