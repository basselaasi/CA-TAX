import { NextResponse } from 'next/server';
import { taxYearDataSchema } from '@/lib/validators';
import { buildTaxPrepPdf } from '@/lib/pdf/generate';

export async function POST(req: Request) {
  const body = await req.json();
  const data = taxYearDataSchema.parse(body);
  const bytes = await buildTaxPrepPdf(data);
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tax-prep-package-${data.taxYear}.pdf"`
    }
  });
}
