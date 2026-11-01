import {pageMetadata} from '@/lib/page-metadata';
import CalculatorClient from './CalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = pageMetadata("/projects/calculator", {
  title: 'Calculator – Arpit Agarwala',
  description: 'Online calculator with standard, scientific, and unit converter modes.',
});

export default function CalculatorPage() {
  return (
    <main className="min-h-screen relative p-4 bg-[#100f0e]">
      <CalculatorClient />
    </main>
  );
}

