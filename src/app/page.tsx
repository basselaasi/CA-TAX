import Link from 'next/link';
import { Disclaimer } from '@/components/disclaimer';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Canadian Tax Prep Organizer</h1>
      <Disclaimer />
      <ul className="my-6 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li>Organize slips and receipts for your personal return.</li>
        <li>Generate a checklist, summary, JSON export, and PDF prep package.</li>
        <li>No SIN collection. No CRA filing or transmission.</li>
      </ul>
      <Link href="/wizard" className="rounded bg-blue-600 px-4 py-2 font-medium text-white">
        Start wizard
      </Link>
    </main>
  );
}
