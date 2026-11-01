import {pageMetadata} from '@/lib/page-metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOLS } from '@/lib/finance';
import SipClient from '@/app/projects/sip/SipClient';
import GoalPlanning from '@/components/finance/GoalPlanning';
import LoanPlanning from '@/components/finance/LoanPlanning';
import DepositPlanning from '@/components/finance/DepositPlanning';
import PositionRisk from '@/components/finance/PositionRisk';
import TradeJournal from '@/components/finance/TradeJournal';
import { redirect } from 'next/navigation';
export function generateStaticParams() { return TOOLS.map(t => ({ slug: t.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const tool = TOOLS.find(t => t.slug === slug); return tool ? pageMetadata(`/projects/finance/${slug}`,{ title: tool.title, description: tool.description }) : { title: 'Tool not found' }; }
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const tool = TOOLS.find(t => t.slug === slug); if (!tool) notFound();
  if (slug === 'compound-growth') redirect('/projects/finance/sip?mode=one-time');
  if (slug === 'sip') return <SipClient />;
  if (slug === 'goal-planner') return <GoalPlanning />;
  if (slug === 'emi') return <LoanPlanning />;
  if (slug === 'fixed-deposit') return <DepositPlanning />;
  if (slug === 'position-size') return <PositionRisk />;
  if (slug === 'trade-journal') return <TradeJournal />;
  notFound();
}

