import { NextResponse } from 'next/server';
import { taxYearDataSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const data = taxYearDataSchema.parse(await req.json());
  return NextResponse.json(data, {
    headers: {
      'Content-Disposition': `attachment; filename="tax-prep-${data.taxYear}.json"`
    }
  });
}
