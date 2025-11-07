import { z } from 'zod'

export const CreatorSchema = z.object({
    address: z.string().min(1, 'Endereço do criador é obrigatório'),
    basename: z.string().min(1, 'Basename é obrigatório'),
    displayName: z.string().min(1, 'Nome de exibição é obrigatório'),
    avatarUrl: z.string().url('URL do avatar deve ser válida').optional().or(z.literal('')),
})

export const TokenSchema = z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    isNative: z.boolean(),
    logoURI: z.string().optional(),
})

export const TipFormSchema = z.object({
    amount: z.string()
        .min(1, 'Valor é obrigatório')
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: 'Valor deve ser maior que 0'
        }),
    message: z.string().max(200, 'Mensagem deve ter no máximo 200 caracteres').optional(),
    selectedToken: TokenSchema.nullable().refine((val) => val !== null, {
        message: 'Selecione um token'
    }),
    customAmount: z.boolean(),
})

export type Creator = z.infer<typeof CreatorSchema>
export type Token = z.infer<typeof TokenSchema>
export type TipFormData = z.infer<typeof TipFormSchema>