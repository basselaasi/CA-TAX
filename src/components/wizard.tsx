'use client';

import { useMemo, useState } from 'react';
import { defaultTaxData } from '@/lib/default-data';
import type { TaxYearData } from '@/lib/types';
import { generateChecklist, generateWizardSections } from '@/lib/rules/engine';
import { taxYearDataSchema } from '@/lib/validators';
import { Progress } from './progress';
import { Tip } from './tooltip';

const STORAGE_KEY = 'tax-prep-data-v2';

function loadData(): TaxYearData {
  if (typeof window === 'undefined') return defaultTaxData;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as TaxYearData) : defaultTaxData;
}

export function Wizard() {
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<TaxYearData>(loadData);
  const [status, setStatus] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const sections = useMemo(() => generateWizardSections(data), [data]);
  const checklist = useMemo(() => generateChecklist(data), [data]);

  const save = (next: TaxYearData) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const validate = () => {
    const result = taxYearDataSchema.safeParse(data);
    if (result.success) {
      setErrors([]);
      return true;
    }
    setErrors(result.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message));
    return false;
  };

  const onExportJson = async () => {
    if (!validate()) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-prep-${data.taxYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onExportPdf = async () => {
    if (!validate()) return;
    const res = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      setStatus('PDF generation failed.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-prep-package-${data.taxYear}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSaveAccount = async () => {
    if (!validate()) return;
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setStatus(res.ok ? 'Saved to your account.' : 'Sign in required to save to account.');
  };

  const onLoadAccount = async () => {
    const res = await fetch('/api/returns');
    const json = (await res.json()) as { data: Array<{ payload: TaxYearData }> };
    if (!json.data.length) {
      setStatus('No saved return found, or you are not signed in.');
      return;
    }
    save(json.data[0].payload);
    setStatus('Loaded latest saved return.');
  };

  const onDelete = async () => {
    localStorage.removeItem(STORAGE_KEY);
    await fetch('/api/delete-data', { method: 'POST' });
    setData(defaultTaxData);
    setStep(1);
    setConsent(false);
    setStatus('Data deleted from this browser and account records (if signed in).');
  };

  const sum = (values: Array<{ amount: number }>) => values.reduce((acc, entry) => acc + Number(entry.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Progress step={step} total={5} />
      {status && <p className="rounded border border-blue-200 bg-blue-50 p-2 text-sm text-blue-900">{status}</p>}
      {!!errors.length && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-900">
          <p className="font-semibold">Please fix these fields:</p>
          <ul className="list-disc pl-4">
            {errors.slice(0, 5).map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {step === 1 && (
        <section className="rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">Consent and safety</h2>
          <p className="mt-2 text-sm">This app only organizes information. It does not file with CRA.</p>
          <label className="mt-3 flex items-center gap-2">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span className="text-sm">I consent to data processing for tax preparation organization.</span>
          </label>
          <Tip>Do not enter SIN or full date of birth. Use birth year only.</Tip>
        </section>
      )}

      {step === 2 && (
        <section className="grid gap-4 rounded border bg-white p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-xl font-semibold">Profile and residency</h2>
          <label className="text-sm">
            Tax year
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.taxYear}
              onChange={(e) => save({ ...data, taxYear: Number(e.target.value) })}
            />
          </label>
          <label className="text-sm">
            Province
            <select
              className="mt-1 w-full rounded border p-2"
              value={data.profile.province}
              onChange={(e) => save({ ...data, profile: { ...data.profile, province: e.target.value as TaxYearData['profile']['province'] } })}
            >
              <option value="ON">Ontario</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
              <option value="QC">Quebec</option>
            </select>
          </label>
          <label className="text-sm">
            Birth year (optional)
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.profile.birthYear ?? ''}
              onChange={(e) => save({ ...data, profile: { ...data.profile, birthYear: e.target.value ? Number(e.target.value) : undefined } })}
            />
          </label>
          <label className="text-sm">
            Marital status
            <select
              className="mt-1 w-full rounded border p-2"
              value={data.profile.maritalStatus}
              onChange={(e) => save({ ...data, profile: { ...data.profile, maritalStatus: e.target.value as TaxYearData['profile']['maritalStatus'] } })}
            >
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="common-law">Common-law</option>
              <option value="separated">Separated</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </label>
        </section>
      )}

      {step === 3 && (
        <section className="rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">What applies to you?</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {[
              ['hasDependants', 'Dependants/children'],
              ['isStudent', 'Student/tuition'],
              ['hasEmploymentIncome', 'Employment (T4)'],
              ['hasInvestmentIncome', 'Investments (T5/T3 summaries)'],
              ['hasRrsp', 'RRSP contributions'],
              ['hasMedicalExpenses', 'Medical expenses'],
              ['hasRentOrPropertyTax', 'Rent/property tax (Ontario credits info collection)'],
              ['hasSelfEmployment', 'Self-employment income and expenses'],
              ['hasDonations', 'Donations']
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(data.profile[key as keyof typeof data.profile])}
                  onChange={(e) => save({ ...data, profile: { ...data.profile, [key]: e.target.checked } })}
                />
                {label}
              </label>
            ))}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="grid gap-4 rounded border bg-white p-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-xl font-semibold">Slips and amount summaries</h2>
          <label className="text-sm">
            Employment income (T4 Box 14)
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.incomeSlips[0]?.box14 ?? 0}
              onChange={(e) =>
                save({
                  ...data,
                  incomeSlips: [{ slipType: 'T4', issuerName: 'Employer', box14: Number(e.target.value), amount: Number(e.target.value) }]
                })
              }
            />
            <Tip>Enter Box 14 from your T4 slip.</Tip>
          </label>

          <label className="text-sm">
            RRSP total
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.rrsp[0]?.amount ?? 0}
              onChange={(e) => save({ ...data, rrsp: [{ amount: Number(e.target.value), source: 'receipt summary' }] })}
            />
          </label>

          <label className="text-sm">
            Tuition total
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.tuition[0]?.amount ?? 0}
              onChange={(e) => save({ ...data, tuition: [{ amount: Number(e.target.value), source: 'T2202 summary' }] })}
            />
          </label>

          <label className="text-sm">
            Medical expenses total
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.medicalExpenses[0]?.amount ?? 0}
              onChange={(e) => save({ ...data, medicalExpenses: [{ amount: Number(e.target.value), source: 'receipts' }] })}
            />
          </label>

          <label className="text-sm">
            Rent/property tax total
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.rentHousing[0]?.amount ?? 0}
              onChange={(e) => save({ ...data, rentHousing: [{ amount: Number(e.target.value), source: 'ON credit info collection' }] })}
            />
          </label>

          <label className="text-sm">
            Donation total
            <input
              className="mt-1 w-full rounded border p-2"
              type="number"
              value={data.donations[0]?.amount ?? 0}
              onChange={(e) => save({ ...data, donations: [{ amount: Number(e.target.value), source: 'official receipts' }] })}
            />
          </label>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-4 rounded border bg-white p-4">
          <h2 className="text-xl font-semibold">Final review and package output</h2>
          <p className="text-sm">Sections included: {sections.join(', ')}</p>
          <h3 className="font-semibold">Checklist</h3>
          <ul className="list-disc pl-5 text-sm">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="font-semibold">Tax-prep summary</h3>
          <ul className="list-disc pl-5 text-sm">
            <li>Income slips tracked: {data.incomeSlips.length}</li>
            <li>RRSP total to review: ${sum(data.rrsp).toFixed(2)}</li>
            <li>Tuition total to review: ${sum(data.tuition).toFixed(2)}</li>
            <li>Medical total to review: ${sum(data.medicalExpenses).toFixed(2)}</li>
            <li>Rent/property tax info: ${sum(data.rentHousing).toFixed(2)}</li>
            <li>Donations total to review: ${sum(data.donations).toFixed(2)}</li>
          </ul>
          <h3 className="font-semibold">Recommended next step</h3>
          <p className="text-sm">Use CRA-certified tax software or work with a qualified tax professional.</p>
          <div className="flex flex-wrap gap-2">
            <button className="rounded bg-slate-700 px-3 py-2 text-white" onClick={onLoadAccount}>
              Load account save
            </button>
            <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={onSaveAccount}>
              Save to account
            </button>
            <button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={onExportJson}>
              Download JSON
            </button>
            <button className="rounded bg-emerald-600 px-3 py-2 text-white" onClick={onExportPdf}>
              Download PDF Package
            </button>
            <button className="rounded bg-red-700 px-3 py-2 text-white" onClick={onDelete}>
              Delete my data
            </button>
          </div>
        </section>
      )}

      <div className="flex justify-between">
        <button
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="rounded border px-3 py-2 disabled:opacity-40"
        >
          Back
        </button>
        <button
          disabled={(step === 1 && !consent) || step === 5}
          onClick={() => setStep((s) => Math.min(5, s + 1))}
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
