import { z } from "zod";
import type { AssetCategory } from "@/types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
});

export const preferencesSchema = z.object({
  base_currency: z.string().length(3),
  locale: z.string().nullable().optional(),
  default_country: z.string().nullable().optional(),
  theme: z.enum(["light", "dark", "system"]),
});

export const changePasswordSchema = z.object({
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const baseAssetSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.string() as z.ZodType<AssetCategory>,
  description: z.string().nullable().optional(),
  status: z.enum(["active", "sold", "archived"]).default("active"),
  currency: z.string().length(3, "Currency code required"),
  current_value: z.coerce.number().min(0, "Value must be positive"),
  cost_basis: z.coerce.number().min(0).nullable().optional(),
  conversion_rate: z.coerce.number().positive().nullable().optional(),
  base_currency_value: z.coerce.number().min(0).nullable().optional(),
  ownership_percentage: z.coerce.number().min(0).max(100).default(100),
  quantity: z.coerce.number().min(0).nullable().optional(),
  acquisition_date: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const cashMetadataSchema = z.object({
  location: z.string().optional(),
});

export const foreignCashMetadataSchema = z.object({
  location: z.string().optional(),
  original_amount: z.coerce.number().optional(),
  original_currency: z.string().optional(),
});

export const carMetadataSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().optional(),
  mileage: z.coerce.number().optional(),
  plate: z.string().optional(),
  condition: z.string().optional(),
  vin: z.string().optional(),
});

export const realEstateMetadataSchema = z.object({
  property_type: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state_region: z.string().optional(),
  postal_code: z.string().optional(),
  size: z.coerce.number().optional(),
  size_unit: z.string().optional(),
});

export const metalMetadataSchema = z.object({
  metal_type: z.string().optional(),
  form: z.string().optional(),
  weight: z.coerce.number().optional(),
  weight_unit: z.string().optional(),
  purity: z.string().optional(),
  storage_location: z.string().optional(),
});

export const stockMetadataSchema = z.object({
  symbol: z.string().optional(),
  company_name: z.string().optional(),
  exchange: z.string().optional(),
  average_cost: z.coerce.number().optional(),
});

export const cryptoMetadataSchema = z.object({
  symbol: z.string().optional(),
  asset_name: z.string().optional(),
  network: z.string().optional(),
  wallet_exchange: z.string().optional(),
});

export const businessMetadataSchema = z.object({
  business_name: z.string().optional(),
  business_type: z.string().optional(),
  industry: z.string().optional(),
  registration_number: z.string().optional(),
});

export const collectiblesMetadataSchema = z.object({
  item_type: z.string().optional(),
  artist_maker: z.string().optional(),
  era_year: z.string().optional(),
  condition: z.string().optional(),
  authentication: z.string().optional(),
});

export const bondsMetadataSchema = z.object({
  issuer: z.string().optional(),
  bond_type: z.string().optional(),
  coupon_rate: z.coerce.number().optional(),
  maturity_date: z.string().optional(),
  face_value: z.coerce.number().optional(),
});

export const retirementMetadataSchema = z.object({
  account_type: z.string().optional(),
  institution: z.string().optional(),
  account_number_last4: z.string().optional(),
});

export const receivablesMetadataSchema = z.object({
  debtor_name: z.string().optional(),
  due_date: z.string().optional(),
  terms: z.string().optional(),
});

export const otherMetadataSchema = z.object({
  subtype: z.string().optional(),
  custom_fields: z.record(z.string(), z.string()).optional(),
});

export const metadataSchemas: Record<AssetCategory, z.ZodType> = {
  cash: cashMetadataSchema,
  foreign_cash: foreignCashMetadataSchema,
  car: carMetadataSchema,
  house: realEstateMetadataSchema,
  land: realEstateMetadataSchema,
  gold: metalMetadataSchema,
  silver: metalMetadataSchema,
  metals: metalMetadataSchema,
  stocks: stockMetadataSchema,
  cryptocurrency: cryptoMetadataSchema,
  business: businessMetadataSchema,
  collectibles: collectiblesMetadataSchema,
  bonds: bondsMetadataSchema,
  retirement: retirementMetadataSchema,
  receivables: receivablesMetadataSchema,
  other: otherMetadataSchema,
};

export const assetFormSchema = baseAssetSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type AssetFormInput = z.infer<typeof assetFormSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
