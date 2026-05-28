import CalculatorClient from './CalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculator – Arpit Agarwala',
  description: 'Online calculator with standard, scientific, and unit converter modes.',
};

export default function CalculatorPage() {
  return (
    <main className="min-h-screen relative p-4 bg-slate-950">
      <CalculatorClient />
    </main>
  );
}
