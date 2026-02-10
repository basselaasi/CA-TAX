import { describe, expect, it } from 'vitest';
import { generateChecklist, generateWizardSections } from '@/lib/rules/engine';
import { defaultTaxData } from '@/lib/default-data';

describe('rules engine', () => {
  it('includes employment section by default', () => {
    const sections = generateWizardSections(defaultTaxData);
    expect(sections).toContain('employment');
  });

  it('adds Ontario housing collection checklist when enabled', () => {
    const checklist = generateChecklist({
      ...defaultTaxData,
      profile: { ...defaultTaxData.profile, hasRentOrPropertyTax: true, province: 'ON' }
    });
    expect(checklist.some((i) => i.includes('Ontario'))).toBe(true);
  });

  it('does not add Ontario-specific line for non-Ontario returns', () => {
    const checklist = generateChecklist({
      ...defaultTaxData,
      profile: { ...defaultTaxData.profile, hasRentOrPropertyTax: true, province: 'BC' }
    });
    expect(checklist.some((i) => i.includes('Ontario:'))).toBe(false);
  });
});
