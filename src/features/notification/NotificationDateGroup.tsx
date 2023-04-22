import { List, ListItem, Stack, Typography } from "@mui/material";
import { Notification } from "./notification.schema";
import NotificationItem from "./NotificationItem";

type NotificationDateGroupProps = {
	date: string;
	notificationGroup: Notification[];
};

const NotificationDateGroup = ({ date, notificationGroup }: NotificationDateGroupProps) => {
	return (
		<Stack px={8}>
			<Typography fontSize='1.2rem' color='gray'>
				Notifications on {date}
			</Typography>
			<List>
				{notificationGroup.map((notification) => (
					<ListItem key={notification.id}>
            <NotificationItem notification={notification} showDetails />
          </ListItem>
				))}
			</List>
		</Stack>
	);
};

export default NotificationDateGroup;
