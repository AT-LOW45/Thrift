import {z as zod} from "zod"
import { MarketAuxIndustriesSchema } from "../../service/marketaux"

export const ProfileSchema = zod.object({
    id: zod.string().optional(),
    username: zod.string().min(5).max(20),
    interest: MarketAuxIndustriesSchema,
    userUid: zod.string().min(1)
})

export type Profile = zod.infer<typeof ProfileSchema>