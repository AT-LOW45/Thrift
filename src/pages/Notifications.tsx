import { Box, Stack, Typography } from "@mui/material";
import { orderBy, where } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Notification } from "../features/notification/notification.schema";
import notificationService from "../features/notification/notification.service";
import useRealtimeUpdate from "../hooks/useRealtimeUpdate";
import { FirestoreTimestampObject } from "../service/thrift";
import NotificationDateGroup from "../features/notification/NotificationDateGroup";
import empty from "../assets/empty.png";

const Notifications = () => {
	const { user } = useContext(AuthContext);
	const { firestoreCollection } = useRealtimeUpdate<Notification>(
		{ data: { collection: "Notification" } },
		where("sendTo", "array-contains", user?.uid!),
		orderBy("dateCreated", "desc")
	);

	useEffect(() => {
		const updateMyNotificationsAsRead = async () => {
			await notificationService.markAllAsRead();
		};
		updateMyNotificationsAsRead();
	}, []);

	const groupNotificationsByDateCreated = (
		notifications: Notification[]
	): { id: number; date: string; groupedNotifications: Notification[] }[] => {
		const uniqueDates = new Set(
			notifications.map((note) =>
				new Date(
					(note.dateCreated as FirestoreTimestampObject).seconds * 1000
				).toLocaleDateString()
			)
		);

		const dateGroups: ReturnType<typeof groupNotificationsByDateCreated> = [];
		let id = 0;

		uniqueDates.forEach((date) => {
			const notificationsForDate = notifications.filter((note) => {
				const comparedDate = new Date(
					(note.dateCreated as FirestoreTimestampObject).seconds * 1000
				).toLocaleDateString();
				return comparedDate === date;
			});
			id += 1;
			dateGroups.push({ id, date, groupedNotifications: notificationsForDate });
		});

		return dateGroups;
	};

	return (
		<Box sx={{ pt: 2, px: 3 }}>
			<Stack spacing={3}>
				<Typography variant='regularHeading'>Notifications</Typography>
				<Stack spacing={5}>
					{groupNotificationsByDateCreated(firestoreCollection).length === 0 ? (
						<Stack spacing={2} alignItems="center">
							<img src={empty} style={{ width: "30%", height: "auto" }} alt='empty' />
							<Typography variant='regularSubHeading'>
								You don't have any notifications at the moment
							</Typography>
						</Stack>
					) : (
						groupNotificationsByDateCreated(firestoreCollection).map((group) => (
							<NotificationDateGroup
								key={group.id}
								date={group.date}
								notificationGroup={group.groupedNotifications}
							/>
						))
					)}
				</Stack>
			</Stack>
		</Box>
	);
};

export default Notifications;
