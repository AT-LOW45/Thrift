import { z as zod } from "zod";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";
import { ChipOptionsSchema } from "../budget/components/BudgetChip";

const labelValues = ["Family", "Personal", "Business", "Daily Necessities"];
export const labels = new Set(labelValues)
// const ChipOptionsSchemaExtended = zod.union([ChipOptionsSchema])
const IncomeTypeSchema = zod.union([zod.literal("job"), zod.literal("transfer")])
export const incomeTypes = ["job", "transfer"]

export const TransactionSchema = zod.object({
	id: zod.string().optional(),
	description: zod.string().optional(),
	category: ChipOptionsSchema,
	amount: zod.number().nonnegative().gt(0),
	budgetPlanId: zod.string().default("N/A"),
	budgetPlanName: zod.string().min(1).default("N/A"),
	accountId: zod.string(),
	accountName: zod.string().min(1),
	transactionDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
	labels: zod.set(zod.string())
});

export const IncomeSchema = TransactionSchema.omit({
	category: true,
	budgetPlanId: true,
	budgetPlanName: true,
}).extend({
	type: IncomeTypeSchema,
});


export const TransactionSchemaDefaults = zod.object({
	id: zod.string().optional(),
	description: zod.string().optional().default("new transaction"),
	category: ChipOptionsSchema.default("entertainment"),
	amount: zod.number().default(0),
	budgetPlanId: zod.string().default(""),
	budgetPlanName: zod.string().default(""),
	accountName: zod.string().default(""),
	accountId: zod.string().default(""),
	transactionDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
	labels: zod.set(zod.string()).default(new Set()),
});



export const IncomeSchemaDefaults = TransactionSchemaDefaults.omit({
	category: true,
	budgetPlanId: true,
	budgetPlanName: true,
}).extend({
	type: IncomeTypeSchema.default("job"),
});

export type Transaction = zod.infer<typeof TransactionSchema>;
export type Income = zod.infer<typeof IncomeSchema>;
