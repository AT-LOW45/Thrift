import { z as zod } from "zod";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";
import { ChipOptionsSchema } from "./components/BudgetChip";

export const CategorySchema = zod.object({
	id: zod.string().optional(),
	name: ChipOptionsSchema,
	spendingLimit: zod
		.number({ invalid_type_error: "Please provide a spending limit" })
		.nonnegative({ message: "The spending limit cannot be a negative amount" })
		.gt(0, { message: "Your spending limit must be at least RM 1" }),
	amountLeftPercentage: zod.number().nonnegative().lte(100).optional(),
	amountLeftCurrency: zod.number().nonnegative().optional(),
});

export const PlannedPaymentSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string().min(5, {
		message: "The name for this planned payment must be at least 5 characters long",
	}),
	amount: zod
		.number({ invalid_type_error: "Please provide an amount" })
		.nonnegative({ message: "Your planned payment amount cannot be negative" })
		.gte(10, { message: "Your planned payment amount must be at least RM 10" }),
	startDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
});

export const BudgetPlanSchema = zod.object({
	id: zod.string().optional(),
	name: zod
		.string()
		.min(5, { message: "Your budget plan name must be at least 5 characters long" })
		.max(30, { message: "Your budget plan name cannot exceed 30 characters" }),
	spendingLimit: zod.number({ invalid_type_error: "Please provide a spending limit" }).gte(100, {
		message: "Provide a spending limit of at least RM100 to better organise your expenses",
	}),
	spendingThreshold: zod.number().nonnegative().lte(100),
	note: zod
		.string()
		.min(10, {
			message:
				"Your note must have at least 10 characters to meaningfully describe your budget plan",
		})
		.max(200, { message: "Keep your note below 200 characters long for a brief explanation" }),
	renewalTerm: zod.union([zod.literal("biweekly"), zod.literal("monthly")]),
	categories: zod.array(CategorySchema),
	plannedPayments: zod.array(PlannedPaymentSchema).nullable(),
	amountLeftPercentage: zod.number().nonnegative().lte(100).optional(),
	amountLeftCurrency: zod.number().nonnegative().optional(),
	isActive: zod.boolean(),
	userUid: zod.string(),
});

export const CategorySchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: ChipOptionsSchema.default("entertainment"),
	spendingLimit: zod.number().default(0),
	amountLeftPercentage: zod.number().optional(),
	amountLeftCurrency: zod.number().optional(),
});

export const PlannedPaymentSchemaDefaults = zod.object({
	id: zod.string().optional(),
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
	isActive: zod.boolean().default(true),
	userUid: zod.string().default(""),
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
