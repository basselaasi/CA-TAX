import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: true, deleted: 0 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ ok: true, deleted: 0 });

  const deleted = await prisma.taxYearReturn.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true, deleted: deleted.count });
}
