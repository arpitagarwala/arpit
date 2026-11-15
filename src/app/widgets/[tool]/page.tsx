import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getSite} from '@/lib/site-server';
import {sitePathEnabled} from '@/lib/site-config';
import WidgetWorkspace from '@/components/workspace/WidgetWorkspace';
import {WIDGETS} from '@/lib/widget-tools';

export async function generateMetadata({
  params,
}: {
  params: Promise<{tool: string}>;
}): Promise<Metadata> {
  const {tool} = await params;
  const widget = WIDGETS.find((widget) => widget.id === tool);
  return {
    title: widget?.title ?? 'Widget',
    robots: {index: false, follow: false},
    manifest: '/widgets/' + tool + '/manifest.webmanifest',
  };
}
export default async function WidgetPage({
  params,
}: {
  params: Promise<{tool: string}>;
}) {
  const {tool} = await params;
  const widget = WIDGETS.find((widget) => widget.id === tool);
  if (!widget) notFound();
  const site = await getSite();
  if (!sitePathEnabled(site, widget.href)) notFound();
  return (
    <WidgetWorkspace
      tools={[]}
      widgets={[widget.id]}
      email={site.home.email}
      compact
    />
  );
}
