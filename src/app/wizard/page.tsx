import { Disclaimer } from '@/components/disclaimer';
import { Wizard } from '@/components/wizard';

export default function WizardPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Tax Prep Wizard</h1>
      <Disclaimer />
      <Wizard />
    </main>
  );
}
