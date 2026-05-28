import SipClient from './SipClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SIP Calculator – Arpit Agarwala',
  description: 'Plan your mutual fund investments and visualise wealth growth.',
};

export default function SipPage() {
  return (
    <main className="min-h-screen relative p-4 sm:p-8 pt-20">
      <SipClient />
    </main>
  );
}
