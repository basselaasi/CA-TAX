import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { TaxYearData } from '@/lib/types';
import { generateChecklist } from '@/lib/rules/engine';

export async function buildTaxPrepPdf(data: TaxYearData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const cover = doc.addPage([612, 792]);
  cover.setFont(font);
  cover.drawText('Tax Prep Package (Draft - No CRA Filing)', { x: 50, y: 740, font: bold, size: 18, color: rgb(0.1, 0.1, 0.4) });
  cover.drawText(`Tax Year: ${data.taxYear}`, { x: 50, y: 705, font: bold, size: 12 });
  cover.drawText(`Province: ${data.profile.province}`, { x: 50, y: 688, font, size: 11 });
  cover.drawText(`Name (optional): ${data.profile.fullName ?? 'N/A'}`, { x: 50, y: 670, font, size: 11 });
  cover.drawText(`Email (optional): ${data.profile.email ?? 'N/A'}`, { x: 50, y: 654, font, size: 11 });
  cover.drawText('Not tax advice. Not a substitute for a professional.', { x: 50, y: 620, font: bold, size: 11 });

  const checklistPage = doc.addPage([612, 792]);
  checklistPage.setFont(font);
  checklistPage.drawText('Personalized Checklist', { x: 50, y: 740, font: bold, size: 18, color: rgb(0.1, 0.1, 0.4) });
  let y = 710;
  for (const item of generateChecklist(data)) {
    checklistPage.drawText(`• ${item}`, { x: 56, y, size: 10 });
    y -= 18;
    if (y < 80) break;
  }

  const summary = doc.addPage([612, 792]);
  summary.setFont(font);
  summary.drawText('Slip and Expense Summaries (No SIN)', { x: 50, y: 740, font: bold, size: 18, color: rgb(0.1, 0.1, 0.4) });
  const lines = [
    `T4/T5/T3 entries: ${data.incomeSlips.length}`,
    `RRSP total: $${data.rrsp.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}`,
    `Tuition total: $${data.tuition.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}`,
    `Medical total: $${data.medicalExpenses.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}`,
    `Rent/property total: $${data.rentHousing.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}`,
    `Donations total: $${data.donations.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}`
  ];

  y = 710;
  for (const line of lines) {
    summary.drawText(line, { x: 56, y, size: 11 });
    y -= 22;
  }

  const questions = doc.addPage([612, 792]);
  questions.setFont(font);
  questions.drawText('Questions to Confirm', { x: 50, y: 740, font: bold, size: 18, color: rgb(0.1, 0.1, 0.4) });
  const prompts = [
    'Residency dates and province on Dec 31?',
    'Marital/common-law status effective date?',
    'Dependant eligibility and supporting records?',
    'Were all slips received (T4/T5/T3/T2202)?',
    'Any missing deductible receipts (RRSP, donations, medical, rent/property tax)?'
  ];
  y = 710;
  for (const prompt of prompts) {
    questions.drawText(`• ${prompt}`, { x: 56, y, size: 11 });
    y -= 22;
  }

  return doc.save();
}
