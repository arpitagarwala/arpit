import { notFound, redirect } from 'next/navigation';
import { TOOLS } from '@/lib/finance';
export default async function LegacyCalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!TOOLS.some(tool => tool.slug === slug)) notFound();
  if (slug === 'compound-growth') redirect('/projects/finance/sip?mode=one-time');
  redirect(`/projects/finance/${slug}`);
}

