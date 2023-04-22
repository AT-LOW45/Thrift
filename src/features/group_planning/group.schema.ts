import { z as zod } from "zod";
import { GroupAccountSchema, GroupAccountSchemaDefaults } from "../payment_info/paymentInfo.schema";

export const GroupSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string().min(10, { message: "Your group name must be at least 10 characters long" }),
	spendingLimit: zod
		.number({ invalid_type_error: "Please provide a spending limit" })
		.nonnegative({ message: "Your group's spending limit cannot be a negative amount" })
		.gte(200, { message: "The group spending limit must be at least RM200" }),
	transactionLimit: zod
		.number({ invalid_type_error: "Please provide a transaction limit" })
		.nonnegative({ message: "The transaction limit cannot be a negative amount" })
		.gt(10, { message: "The transaction limit for each member must be at least RM10" }),
	members: zod.set(zod.string()),
	owner: zod.string(),
	groupAccount: GroupAccountSchema,
});

export const GroupSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	spendingLimit: zod.number().default(0),
	transactionLimit: zod.number().default(0),
	owner: zod.string().default(""),
	members: zod.set(zod.string()).default(new Set()),
	groupAccount: GroupAccountSchema.default(GroupAccountSchemaDefaults.parse({})),
});

export type Group = zod.infer<typeof GroupSchema>;
