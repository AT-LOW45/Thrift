import { z as zod } from "zod";

const AccountTypeSchema = zod.union([zod.literal("cash"), zod.literal("savings account")]);
export const accountTypes = ["cash", "savings account"];

export const PaymentInfoSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string().max(30),
	balance: zod.number().gt(0),
});

export const PersonalAccountSchema = PaymentInfoSchema.extend({
	type: AccountTypeSchema,
	userUid: zod.string(),
});

export const GroupAccountSchema = PaymentInfoSchema.extend({
	groupId: zod.string(),
	maintainers: zod.set(zod.string()),
});

export const PersonalAccountSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	balance: zod.number().default(0),
	type: AccountTypeSchema.default("cash"),
	userUid: zod.string().default(""),
});

export const GroupAccountSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	balance: zod.number().default(0),
	groupId: zod.string().default(""),
	maintainers: zod.set(zod.string()).default(new Set()),
});

export type PaymentInfo = zod.infer<typeof PaymentInfoSchema>;
export type PersonalAccount = zod.infer<typeof PersonalAccountSchema>;
export type GroupAccount = zod.infer<typeof GroupAccountSchema>;
