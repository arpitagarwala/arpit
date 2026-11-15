import {WIDGETS, type WidgetId} from './widget-tools';
export type WidgetAppearance = {
  width: number;
  height: number;
  textSize: number;
  theme: 'graphite' | 'slate' | 'paper';
  hour12: boolean;
  seconds: boolean;
};
export type WidgetLayout = Record<WidgetId, WidgetAppearance>;
export const LAYOUT_KEY = 'workspace-widget-layout-v2';
const heights = {
  clock: 300,
  focus: 380,
  tasks: 350,
  calculator: 510,
  game: 450,
};
export const minimumHeight = {
  clock: 180,
  focus: 200,
  tasks: 220,
  calculator: 280,
  game: 240,
};
export function defaultLayout(): WidgetLayout {
  return Object.fromEntries(
    WIDGETS.map(({id}) => [
      id,
      {
        width: 370,
        height: heights[id],
        textSize: 100,
        theme: 'graphite',
        hour12: false,
        seconds: true,
      },
    ]),
  ) as WidgetLayout;
}
export function readLayout(raw: string | null): WidgetLayout {
  const layout = defaultLayout();
  if (!raw) return layout;
  const saved: unknown = JSON.parse(raw);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved))
    return layout;
  const bounded = (
    value: unknown,
    fallback: number,
    min: number,
    max: number,
  ) =>
    typeof value === 'number' && Number.isFinite(value)
      ? Math.round(Math.max(min, Math.min(max, value)))
      : fallback;
  for (const {id} of WIDGETS) {
    const item = (saved as Record<string, unknown>)[id];
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const value = item as Partial<WidgetAppearance>;
    layout[id] = {
      width: bounded(value.width, 370, 240, 1200),
      height: bounded(value.height, heights[id], minimumHeight[id], 900),
      textSize: bounded(value.textSize, 100, 80, 130),
      theme:
        value.theme === 'slate' || value.theme === 'paper'
          ? value.theme
          : 'graphite',
      hour12: value.hour12 === true,
      seconds: value.seconds !== false,
    };
  }
  return layout;
}
