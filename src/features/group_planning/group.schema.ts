import { z as zod } from "zod";

export const GroupSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string(),
	spendingLimit: zod.number(),
	transactionLimit: zod.number(),
	maintainers: zod.set(zod.string()),
	owner: zod.string(),
});

export const GroupSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	spendingLimit: zod.number().default(0),
	transactionLimit: zod.number().default(0),
	owner: zod.string().default(""),
	maintainers: zod.set(zod.string()).default(new Set()),
});

export type Group = zod.infer<typeof GroupSchema>;
