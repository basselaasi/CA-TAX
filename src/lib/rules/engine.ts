import rules from '../../../rules/v1.json';
import type { TaxYearData } from '@/lib/types';

type Rule = {
  id: string;
  condition: keyof TaxYearData['profile'];
  section: string;
  checklist: string[];
};

const parsed = rules as { version: string; rules: Rule[] };

export function generateWizardSections(data: TaxYearData): string[] {
  const base = ['profile', 'consent'];
  const dynamic = parsed.rules
    .filter((rule) => Boolean(data.profile[rule.condition]))
    .map((rule) => rule.section);
  return Array.from(new Set([...base, ...dynamic, 'review']));
}

export function generateChecklist(data: TaxYearData): string[] {
  const common = ['Government-issued ID for identity checks (no SIN requested in this tool).'];
  const fromRules = parsed.rules
    .filter((rule) => Boolean(data.profile[rule.condition]))
    .flatMap((rule) => rule.checklist);

  if (data.profile.province === 'ON' && data.profile.hasRentOrPropertyTax) {
    fromRules.push('Ontario: Collect annual rent or property tax totals for credit eligibility review.');
  }

  return Array.from(new Set([...common, ...fromRules]));
}
