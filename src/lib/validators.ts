import { z } from 'zod';

const currentYear = new Date().getFullYear();

const moneyEntry = z.object({
  amount: z.number().nonnegative(),
  source: z.string().min(1).optional()
});

export const taxYearDataSchema = z.object({
  taxYear: z.number().int().min(2000).max(currentYear),
  profile: z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    birthYear: z.number().int().min(1900).max(currentYear).optional(),
    province: z.string().default('ON'),
    maritalStatus: z.enum(['single', 'married', 'common-law', 'separated', 'divorced', 'widowed']),
    maritalStatusDate: z.string().optional(),
    hasDependants: z.boolean(),
    dependantsCount: z.number().int().min(0).max(20).optional(),
    isStudent: z.boolean(),
    hasEmploymentIncome: z.boolean(),
    hasInvestmentIncome: z.boolean(),
    hasRrsp: z.boolean(),
    hasMedicalExpenses: z.boolean(),
    hasRentOrPropertyTax: z.boolean(),
    hasSelfEmployment: z.boolean(),
    hasDonations: z.boolean()
  }),
  incomeSlips: z.array(
    z.object({
      slipType: z.enum(['T4', 'T5', 'T3']),
      issuerName: z.string().min(1),
      box14: z.number().nonnegative().optional(),
      amount: z.number().nonnegative(),
      notes: z.string().optional()
    })
  ),
  rrsp: z.array(moneyEntry),
  tuition: z.array(moneyEntry),
  medicalExpenses: z.array(moneyEntry),
  rentHousing: z.array(moneyEntry),
  donations: z.array(moneyEntry),
  selfEmployment: z
    .object({
      businessName: z.string().min(1),
      income: z.number().nonnegative(),
      expenses: z.array(z.object({ category: z.string().min(1), amount: z.number().nonnegative() }))
    })
    .optional(),
  documents: z.array(z.object({ label: z.string().min(1), documentType: z.string().min(1) })),
  notes: z.string().optional()
});

export type TaxYearDataInput = z.infer<typeof taxYearDataSchema>;
