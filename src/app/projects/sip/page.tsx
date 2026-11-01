import {pageMetadata} from '@/lib/page-metadata';
import { redirect } from 'next/navigation';
export const metadata = pageMetadata("/projects/sip", { title: 'Investment Lab', description: 'Model SIPs, step-ups, costs, inflation, and goal funding.', alternates: { canonical: '/projects/finance/sip' } });
export default function SipPage() { redirect('/projects/finance/sip'); }

