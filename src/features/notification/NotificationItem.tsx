import { SvgIconComponent } from "@mui/icons-material";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import PeopleIcon from "@mui/icons-material/People";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import { Fragment } from "react";
import { z as zod } from "zod";
import { Notification } from "./notification.schema";
import { FirestoreTimestampObject } from "../../service/thrift";

export const NotificationOptionsSchema = zod.union([
	zod.literal("budget alert"),
	zod.literal("crowdfund alert"),
	zod.literal("group alert"),
]);
export type NotificationOptions = zod.infer<typeof NotificationOptionsSchema>;

type NotificationVariant = {
	colour: string;
	backgroundColour: string;
	icon: SvgIconComponent;
};

type NotificationType = Record<NotificationOptions, NotificationVariant>;

export const notificationTypes: NotificationType = {
	"budget alert": {
		colour: "#e31b25",
		backgroundColour: "#eb969a",
		icon: WarningIcon,
	},
	"crowdfund alert": {
		colour: "#e6870b",
		backgroundColour: "#e6bf8c",
		icon: Diversity3Icon,
	},
	"group alert": {
		colour: "#53cc1b",
		backgroundColour: "#aae38f",
		icon: PeopleIcon,
	},
};

type NotificationItemProps = {
	notification: Notification;
	showDetails?: boolean;
};

const NotificationItem = ({ notification, showDetails }: NotificationItemProps) => {
	const IconOption = notificationTypes[notification.type].icon;

	return (
		<Stack direction='row' alignItems='center' spacing={2} flexGrow={1} py={showDetails ? 2 : 0}>
			<ListItemIcon>
				<Box
					sx={{
						borderRadius: "50%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: "fit-content",
						height: "fit-content",
						padding: "5px 5px",
						backgroundColor: notificationTypes[notification.type].backgroundColour,
					}}
				>
					<IconOption
						sx={{ color: notificationTypes[notification.type].colour }}
						fontSize={showDetails ? "large" : "medium"}
					/>
				</Box>
			</ListItemIcon>
			<Stack>
				<Typography sx={showDetails ? {fontWeight: 800, fontSize: "1.1rem"} : {}}>{notification.title}</Typography>
				{showDetails && (
					<Fragment>
						<ListItemText>{notification.message}</ListItemText>
						<Typography variant='regularLight'>
							{new Date(
								(notification.dateCreated as FirestoreTimestampObject).seconds * 1000
							).toLocaleDateString()}
						</Typography>
					</Fragment>
				)}
			</Stack>
		</Stack>
	);
};

export default NotificationItem;
