import type { TaxYearData } from './types';

export const defaultTaxData: TaxYearData = {
  taxYear: new Date().getFullYear() - 1,
  profile: {
    province: 'ON',
    maritalStatus: 'single',
    hasDependants: false,
    isStudent: false,
    hasEmploymentIncome: true,
    hasInvestmentIncome: false,
    hasRrsp: false,
    hasMedicalExpenses: false,
    hasRentOrPropertyTax: false,
    hasSelfEmployment: false,
    hasDonations: false
  },
  incomeSlips: [],
  rrsp: [{ amount: 0 }],
  tuition: [{ amount: 0 }],
  medicalExpenses: [{ amount: 0 }],
  rentHousing: [{ amount: 0 }],
  donations: [{ amount: 0 }],
  documents: []
};
