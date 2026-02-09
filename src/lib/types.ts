export type ProvinceCode = 'ON' | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS' | 'NT' | 'NU' | 'PE' | 'QC' | 'SK' | 'YT';

export type FilingProfile = {
  fullName?: string;
  email?: string;
  birthYear?: number;
  province: ProvinceCode;
  maritalStatus: 'single' | 'married' | 'common-law' | 'separated' | 'divorced' | 'widowed';
  maritalStatusDate?: string;
  hasDependants: boolean;
  dependantsCount?: number;
  isStudent: boolean;
  hasEmploymentIncome: boolean;
  hasInvestmentIncome: boolean;
  hasRrsp: boolean;
  hasMedicalExpenses: boolean;
  hasRentOrPropertyTax: boolean;
  hasSelfEmployment: boolean;
  hasDonations: boolean;
};

export type IncomeSlip = {
  slipType: 'T4' | 'T5' | 'T3';
  issuerName: string;
  box14?: number;
  amount: number;
  notes?: string;
};

export type SelfEmployment = {
  businessName: string;
  income: number;
  expenses: Array<{ category: string; amount: number }>;
};

export type MoneyEntry = { amount: number; source?: string };

export type TaxYearData = {
  taxYear: number;
  profile: FilingProfile;
  incomeSlips: IncomeSlip[];
  rrsp: MoneyEntry[];
  tuition: MoneyEntry[];
  medicalExpenses: MoneyEntry[];
  rentHousing: MoneyEntry[];
  donations: MoneyEntry[];
  selfEmployment?: SelfEmployment;
  documents: Array<{ label: string; documentType: string }>;
  notes?: string;
};
