import { z as zod } from "zod";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";
import { ChipOptionsSchema } from "./components/BudgetChip";

export const CategorySchema = zod.object({
	name: ChipOptionsSchema,
	spendingLimit: zod.number().nonnegative().gt(0),
	amountLeftPercentage: zod.number().nonnegative().lte(100).optional(),
	amountLeftCurrency: zod.number().nonnegative().optional(),
});

export const PlannedPaymentSchema = zod.object({
	name: zod.string().min(5),
	amount: zod.number().nonnegative().gte(10),
	startDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
});

export const BudgetPlanSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string().min(5).max(30),
	spendingLimit: zod.number().gte(100),
	spendingThreshold: zod.number().nonnegative().lte(100),
	note: zod.string().min(10).max(200),
	renewalTerm: zod.union([zod.literal("biweekly"), zod.literal("monthly")]),
	categories: zod.array(CategorySchema),
	plannedPayments: zod.array(PlannedPaymentSchema).nullable(),
	amountLeftPercentage: zod.number().nonnegative().lte(100).optional(),
	amountLeftCurrency: zod.number().nonnegative().optional(),
	userUid: zod.string()
});

export const CategorySchemaDefaults = zod.object({
	name: ChipOptionsSchema.default("entertainment"),
	spendingLimit: zod.number().default(0),
	amountLeftPercentage: zod.number().optional(),
	amountLeftCurrency: zod.number().optional(),
});

export const PlannedPaymentSchemaDefaults = zod.object({
	name: zod.string().default(""),
	amount: zod.number().default(0),
	startDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
});

export const BudgetPlanSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	spendingLimit: zod.number().default(0),
	spendingThreshold: zod.number().default(80),
	note: zod.string().default(""),
	renewalTerm: zod.union([zod.literal("biweekly"), zod.literal("monthly")]).default("monthly"),
	categories: zod.array(CategorySchemaDefaults).default([{}]),
	plannedPayments: zod.array(PlannedPaymentSchemaDefaults).default([{}]),
	amountLeftPercentage: zod.number().optional(),
	amountLeftCurrency: zod.number().optional(),
	userUid: zod.string().default("")
});

export const BudgetPlanOverviewSchema = BudgetPlanSchema.pick({
	note: true,
	spendingLimit: true,
	spendingThreshold: true,
});

export type BudgetPlan = zod.infer<typeof BudgetPlanSchema>;
export type BudgetPlanOverview = zod.infer<typeof BudgetPlanOverviewSchema>;
export type Category = zod.infer<typeof CategorySchema>;
export type PlannedPayment = zod.infer<typeof PlannedPaymentSchema>;
