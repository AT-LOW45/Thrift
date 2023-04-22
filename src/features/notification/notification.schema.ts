import { z as zod } from "zod";
import { NotificationOptionsSchema } from "./NotificationItem";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";

export const NotificationSchema = zod.object({
	id: zod.string().optional(),
	title: zod.string(),
	message: zod.string(),
	sendTo: zod.array(zod.string()),
	type: NotificationOptionsSchema,
	read: zod.boolean().default(false),
	dateCreated: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
	// all notifications will be automatically deleted from firestore three days after creation
	expireAt: zod.date().default(
		(() => {
			const today = new Date();
			const threeDaysFromNow = today.setDate(today.getDate() + 3);
			return new Date(threeDaysFromNow);
		})()
	),
});

export type Notification = zod.infer<typeof NotificationSchema>;
