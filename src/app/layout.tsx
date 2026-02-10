import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Canadian Tax Prep Organizer',
  description: 'Ontario-focused tax prep package generator (no filing).'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
