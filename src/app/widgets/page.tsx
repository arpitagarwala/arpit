import type {Metadata} from 'next';
import {getSite} from '@/lib/site-server';
import {sitePathEnabled} from '@/lib/site-config';
import WidgetWorkspace from '@/components/workspace/WidgetWorkspace';
import {WIDGETS} from '@/lib/widget-tools';

export const metadata: Metadata = {
  title: 'Your widgets',
  robots: {index: false, follow: false},
};
export default async function WidgetsPage() {
  const site = await getSite();
  const tools = [...site.productivity, ...site.games, ...site.projects]
    .filter((tool) => tool.enabled && sitePathEnabled(site, tool.href))
    .map(({href, title, icon}) => ({href, title, icon}));
  const widgets = WIDGETS.filter((widget) =>
    tools.some((tool) => tool.href === widget.href),
  );
  return (
    <WidgetWorkspace
      tools={tools}
      widgets={widgets.map((widget) => widget.id)}
      email={site.home.email}
    />
  );
}
