import {WIDGETS} from '@/lib/widget-tools';
export async function GET(
  _request: Request,
  {params}: {params: Promise<{tool: string}>},
) {
  const {tool} = await params;
  const widget = WIDGETS.find((widget) => widget.id === tool);
  if (!widget) return new Response('Widget unavailable', {status: 404});
  return Response.json(
    {
      id: '/widgets/' + tool,
      name: widget.title + ' · Arpit Agarwala',
      short_name: widget.title,
      start_url: '/widgets/' + tool,
      scope: '/',
      display: 'standalone',
      background_color: '#0b1220',
      theme_color: '#0b1220',
      icons: [
        {src: '/app-icons/icon-192.png', sizes: '192x192', type: 'image/png'},
        {src: '/app-icons/icon-512.png', sizes: '512x512', type: 'image/png'},
      ],
    },
    {headers: {'Content-Type': 'application/manifest+json'}},
  );
}
