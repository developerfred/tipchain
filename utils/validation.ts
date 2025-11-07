import { z } from "zod";

export const validateEthereumAddress = (address: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

export const AddressSchema = z.string().refine(validateEthereumAddress, {
  message: "Invalid Ethereum address",
});

export const TransactionHashSchema = z
  .string()
  .refine((hash) => /^0x[a-fA-F0-9]{64}$/.test(hash), {
    message: "Invalid transaction hash",
  });
