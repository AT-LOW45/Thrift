import { z as zod } from "zod";

export const marketAuxIndustries = [
	"Technology",
	"Industrials",
	"Consumer Cyclical",
	"Healthcare",
	"Communication Services",
	"Financial Services",
	"Consumer Defensive",
	"Basic Materials",
	"Real Estate",
	"Energy",
	"Utilities",
	"Financial",
	"Services",
	"Consumer Goods",
	"Industrial Goods",
];

export const MarketAuxIndustriesSchema = zod.union([
	zod.literal("Technology"),
	zod.literal("Industrials"),
	zod.literal("Consumer Cyclical"),
	zod.literal("Healthcare"),
	zod.literal("Communication Services"),
	zod.literal("Financial Services"),
	zod.literal("Consumer Defensive"),
	zod.literal("Basic Materials"),
	zod.literal("Real Estate"),
	zod.literal("Energy"),
	zod.literal("Utilities"),
	zod.literal("Financial"),
	zod.literal("Services"),
	zod.literal("Consumer Goods"),
	zod.literal("Industrial Goods"),
]);
