import { z as zod } from "zod";

const AccountTypeSchema = zod.union([zod.literal("cash"), zod.literal("savings account")]);

const PaymentInfoSchema = zod.object({
    id: zod.string().optional(),
    name: zod.string(),
    balance: zod.number()
})

const PersonalAccountSchema = PaymentInfoSchema.extend({
    type: AccountTypeSchema
})


export type PaymentInfo = zod.infer<typeof PaymentInfoSchema>
export type PersonalAccount = zod.infer<typeof PersonalAccountSchema>
