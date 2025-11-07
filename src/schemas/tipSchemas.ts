import { z } from "zod";

export const CreatorSchema = z.object({
  address: z.string().min(1, "Creator address is required"),
  basename: z.string().min(1, "Basename is required"),
  displayName: z.string().min(1, "Display name is required"),
  avatarUrl: z
    .string()
    .url("Avatar URL must be valid")
    .optional()
    .or(z.literal("")),
});

export const TokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  isNative: z.boolean(),
  logoURI: z.string().optional(),
});

export const TipFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  message: z
    .string()
    .max(200, "Message must not exceed 200 characters")
    .optional(),
  selectedToken: TokenSchema.nullable().refine((val) => val !== null, {
    message: "Please select a token",
  }),
  customAmount: z.boolean(),
});

export type Creator = z.infer<typeof CreatorSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type TipFormData = z.infer<typeof TipFormSchema>;