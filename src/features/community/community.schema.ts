import { z as zod } from "zod";
import { MarketAuxIndustriesSchema } from "../../service/marketaux";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";

export const PostSchema = zod.object({
	id: zod.string().optional(),
	title: zod
		.string()
		.min(10, { message: "Your post title cannot be less than 10 characters" })
		.max(30, { message: "Your post title cannot exceed 30 characters" }),
	body: zod
		.string()
		.min(1, { message: "Your post content cannot be empty" })
		.max(500, { message: "Your post content cannot be more than 500 characters long" }),
	postedBy: zod.string(),
	datePosted: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
	mediaAttachment: zod.string().optional(),
	additionalResources: zod.array(zod.string()).optional(),
});

export const NewsSchema = PostSchema.extend({
	link: zod.string(),
	interest: MarketAuxIndustriesSchema,
});

export const CrowdfundSchema = zod.object({
	id: zod.string().optional(),
	name: zod
		.string()
		.max(30, { message: "Your crowdfund name should not exceed 30 characters long" })
		.min(10, {
			message: "Your crowdfund title should be at least 10 characters long to draw attention",
		}),
	initiator: zod.string(),
	contributors: zod.array(zod.object({ user: zod.string(), amount: zod.number() })),
	targetAmount: zod
		.number()
		.nonnegative({ message: "Your crowdfund goal cannot be a negative amount" })
		.gte(1000, { message: "Your goal must be at least RM 1000 to start a crowdfund" }),
	description: zod
		.string()
		.max(700, { message: "Your crowdfund description must not be longer than 700 characters" })
		.min(100, {
			message:
				"Your crowdfund description should be at least 100 characters long to give people ample detail",
		}),
	isActive: zod.boolean(),
	endDate: zod.union([zod.date(), FirestoreTimestampObjectSchema]),
});

export const CrowdfundSchemaDefaults = zod.object({
	id: zod.string().optional(),
	name: zod.string().default(""),
	initiator: zod.string().default(""),
	contributors: zod.array(zod.object({ user: zod.string(), amount: zod.number() })).default([]),
	targetAmount: zod.number().default(0),
	description: zod.string().default(""),
	isActive: zod.boolean().default(true),
	endDate: zod
		.union([zod.date(), FirestoreTimestampObjectSchema])
		.default(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)),
});

export const PostSchemaDefaults = zod.object({
	id: zod.string().optional(),
	title: zod.string().default(""),
	body: zod.string().default(""),
	postedBy: zod.string().default(""),
	datePosted: zod.union([zod.date(), FirestoreTimestampObjectSchema]).default(new Date()),
	mediaAttachment: zod.string().optional(),
});

export type Post = zod.infer<typeof PostSchema>;
export type News = zod.infer<typeof NewsSchema>;
export type CrowdFund = zod.infer<typeof CrowdfundSchema>;
