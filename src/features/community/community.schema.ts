import { z as zod } from "zod";
import { MarketAuxIndustriesSchema } from "../../service/marketaux";
import { FirestoreTimestampObjectSchema } from "../../service/thrift";

export const PostSchema = zod.object({
	id: zod.string().optional(),
	title: zod.string().max(10),
	body: zod.string(),
	postedBy: zod.string(),
	mediaAttachment: zod.string().optional(),
	additionalResources: zod.array(zod.string()).optional(),
});

export const NewsSchema = PostSchema.extend({
	link: zod.string(),
	interest: MarketAuxIndustriesSchema,
});

export const CrowdfundSchema = zod.object({
	id: zod.string().optional(),
	name: zod.string().max(30).min(10),
	initiator: zod.string(),
	contributors: zod.array(zod.object({ user: zod.string(), amount: zod.number() })),
	targetAmount: zod.number().nonnegative().gte(1000),
	description: zod.string().max(700).min(100),
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
	mediaAttachment: zod.string().optional(),
});

export type Post = zod.infer<typeof PostSchema>;
export type News = zod.infer<typeof NewsSchema>;
export type CrowdFund = zod.infer<typeof CrowdfundSchema>;
