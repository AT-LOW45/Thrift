import { z as zod } from "zod";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";
import { ChipOptionsSchema } from "../budget/components/BudgetChip";

const labelValues = ["Family", "Personal", "Business", "Daily Necessities", "Payment", "Interest"];
export const labels = new Set(labelValues);
const IncomeTypeSchema = zod.union([zod.literal("job"), zod.literal("transfer")], {
	invalid_type_error: "You need to specify a source for this income",
});
export const incomeTypes = ["job", "transfer"];

export const TransactionSchema = zod.object({
	id: zod.string().optional(),
	description: zod.string().optional(),
	category: ChipOptionsSchema,
	amount: zod
		.number({ invalid_type_error: "Please provide an amount" })
		.nonnegative({ message: "You can't create a record with a negative amount" })
		.gt(0, { message: "You can't create a record of RM 0" }),
	budgetPlanId: zod
		.string()
		.min(1, { message: "This transaction needs to be recorded in a budget plan" })
		.default("N/A"),
	budgetPlanName: zod.string().optional(),
	accountId: zod
		.string()
		.min(1, { message: "You need to select an account to create the record" }),
	accountName: zod.string().optional(),
	transactionDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
	labels: zod.set(zod.string()),
});

export const GroupTransactionSchema = TransactionSchema.omit({
	budgetPlanId: true,
	budgetPlanName: true,
	accountId: true,
	accountName: true,
}).extend({
	status: zod.boolean(),
	madeBy: zod.string(),
	groupName: zod.string().optional(),
	groupId: zod.string(),
});

export const IncomeSchema = TransactionSchema.omit({
	category: true,
	budgetPlanId: true,
	budgetPlanName: true,
}).extend({
	type: IncomeTypeSchema,
});

export const GroupIncomeSchema = IncomeSchema.omit({
	accountId: true,
	accountName: true,
	type: true,
}).extend({
	groupId: zod.string(),
	madeBy: zod.string(),
	groupName: zod.string().optional(),
});

export const TransactionSchemaDefaults = zod.object({
	id: zod.string().optional(),
	description: zod.string().optional().default("new transaction"),
	category: ChipOptionsSchema.default("entertainment"),
	amount: zod.number().default(0),
	budgetPlanId: zod.string().default(""),
	budgetPlanName: zod.string().optional(),
	accountName: zod.string().optional(),
	accountId: zod.string().default(""),
	transactionDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
	labels: zod.set(zod.string()).default(new Set()),
});

export const GroupTransactionSchemaDefaults = zod.object({
	id: zod.string().optional(),
	description: zod.string().optional().default("new transaction"),
	category: ChipOptionsSchema.default("entertainment"),
	amount: zod.number().default(0),
	transactionDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
	status: zod.boolean().default(true),
	madeBy: zod.string().default(""),
	labels: zod.set(zod.string()).default(new Set()),
	groupId: zod.string().default(""),
	groupName: zod.string().default(""),
});

export const IncomeSchemaDefaults = TransactionSchemaDefaults.omit({
	category: true,
	budgetPlanId: true,
	budgetPlanName: true,
}).extend({
	type: IncomeTypeSchema.default("job"),
});

export const GroupIncomeSchemaDefaults = IncomeSchemaDefaults.omit({
	accountId: true,
	accountName: true,
	type: true,
}).extend({
	groupId: zod.string().default(""),
	madeBy: zod.string().default(""),
	groupName: zod.string().default(""),
});

export type Transaction = zod.infer<typeof TransactionSchema>;
export type GroupTransaction = zod.infer<typeof GroupTransactionSchema>;
export type GroupIncome = zod.infer<typeof GroupIncomeSchema>;
export type Income = zod.infer<typeof IncomeSchema>;
