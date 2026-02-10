import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptJson, encryptJson } from '@/lib/crypto';
import { taxYearDataSchema } from '@/lib/validators';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = taxYearDataSchema.parse(await req.json());
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    create: { email: session.user.email, name: session.user.name ?? undefined },
    update: { name: session.user.name ?? undefined }
  });

  const saved = await prisma.taxYearReturn.upsert({
    where: { userId_taxYear: { userId: user.id, taxYear: payload.taxYear } },
    create: {
      userId: user.id,
      taxYear: payload.taxYear,
      province: payload.profile.province,
      consentAcceptedAt: new Date(),
      encryptedPayload: encryptJson(payload),
      profile: {
        create: {
          birthYear: payload.profile.birthYear,
          maritalStatus: payload.profile.maritalStatus,
          maritalStatusDate: payload.profile.maritalStatusDate,
          hasDependants: payload.profile.hasDependants,
          dependantsCount: payload.profile.dependantsCount,
          isStudent: payload.profile.isStudent
        }
      }
    },
    update: {
      province: payload.profile.province,
      encryptedPayload: encryptJson(payload)
    }
  });

  return NextResponse.json({ id: saved.id, taxYear: saved.taxYear });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ data: [] });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ data: [] });

  const rows = await prisma.taxYearReturn.findMany({
    where: { userId: user.id },
    orderBy: { taxYear: 'desc' }
  });

  return NextResponse.json({
    data: rows.map((row) => ({
      id: row.id,
      taxYear: row.taxYear,
      province: row.province,
      updatedAt: row.updatedAt,
      payload: decryptJson(row.encryptedPayload)
    }))
  });
}
