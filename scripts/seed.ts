import { prisma } from '../src/lib/prisma';
import { encryptJson } from '../src/lib/crypto';
import { defaultTaxData } from '../src/lib/default-data';

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'sample.user@example.com' },
    create: { email: 'sample.user@example.com', name: 'Sample User' },
    update: {}
  });

  await prisma.taxYearReturn.upsert({
    where: { userId_taxYear: { userId: user.id, taxYear: defaultTaxData.taxYear } },
    create: {
      userId: user.id,
      taxYear: defaultTaxData.taxYear,
      province: defaultTaxData.profile.province,
      consentAcceptedAt: new Date(),
      encryptedPayload: encryptJson(defaultTaxData)
    },
    update: {
      encryptedPayload: encryptJson(defaultTaxData)
    }
  });
}

main().finally(() => prisma.$disconnect());
