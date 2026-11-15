'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import Link from 'next/link';
import {
  WIDGETS,
  calculate,
  gameWinner,
  type Tool,
  type WidgetId,
} from '@/lib/widget-tools';
import {dayKey, remaining, resetStudy} from '@/lib/study';
import {useStudyRoom, updateStudy} from '@/lib/study-store';
import {completeTask, plannerTasks, saveTask} from '@/lib/study-planner';
import {toolStorage} from '@/lib/account-storage';
import {useProductivity} from '@/components/productivity/ProductivityProvider';
import {AccountLink} from '@/components/account/AccountLink';
import {AppDownload} from '@/components/install/AppInstall';
import {FullscreenButton} from '@/components/install/FullscreenButton';
import OfflinePacks from './OfflinePacks';
import RecoveryHistory from './RecoveryHistory';
import s from './widgets.module.css';
import {
  defaultLayout,
  LAYOUT_KEY,
  readLayout,
  minimumHeight,
  type WidgetAppearance,
  type WidgetLayout,
} from '@/lib/widget-layout';

export default function WidgetWorkspace({
  tools,
  widgets,
  email,
  compact = false,
}: {
  tools: Tool[];
  widgets: WidgetId[];
  email: string;
  compact?: boolean;
}) {
  const {now, toggleFocus} = useProductivity();
  const {study, ready, error} = useStudyRoom();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState('');
  const [settingsReady, setSettingsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [quickTask, setQuickTask] = useState('');
  const [expression, setExpression] = useState('');
  const [answer, setAnswer] = useState('');
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turn, setTurn] = useState('X');
  const [layout, setLayout] = useState<WidgetLayout>(defaultLayout);
  const layoutRef = useRef(layout);
  const [customizing, setCustomizing] = useState<WidgetId>('clock');
  const customizeDialog = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: WidgetId;
    x: number;
    pointerId: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const popup = useRef<Window | null>(null);
  const time = now ? new Date(now) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved: unknown = JSON.parse(
          localStorage.getItem('workspace-favorites') ?? '[]',
        );
        if (Array.isArray(saved))
          setFavorites(
            saved
              .filter((value): value is string => typeof value === 'string')
              .slice(0, 12),
          );
        setRecent(localStorage.getItem('workspace-last-tool') ?? '');
        const savedLayout = readLayout(localStorage.getItem(LAYOUT_KEY));
        layoutRef.current = savedLayout;
        setLayout(savedLayout);
      } catch {
        setMessage('Your saved workspace settings could not load.');
      }
      setSettingsReady(true);
    }, 0);
    const changed = (event: StorageEvent) => {
      if (event.key !== LAYOUT_KEY) return;
      try {
        const saved = readLayout(event.newValue);
        layoutRef.current = saved;
        setLayout(saved);
      } catch {
        setMessage('Updated widget settings could not be loaded.');
      }
    };
    window.addEventListener('storage', changed);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', changed);
    };
  }, []);

  function persistLayout() {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layoutRef.current));
    } catch {
      setMessage('Your layout could not be saved on this device.');
    }
  }

  function appearance(
    id: WidgetId,
    change: Partial<WidgetAppearance>,
    persist = true,
  ) {
    const next = {
      ...layoutRef.current,
      [id]: {...layoutRef.current[id], ...change},
    };
    layoutRef.current = next;
    setLayout(next);
    if (persist) persistLayout();
  }

  function startResize(event: PointerEvent<HTMLButtonElement>, id: WidgetId) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    const bounds = event.currentTarget
      .closest('section')!
      .getBoundingClientRect();
    drag.current = {
      id,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      width: bounds.width,
      height: bounds.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resize(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const maximum = Math.min(1200, grid.current?.clientWidth ?? 1200);
    appearance(
      current.id,
      {
        width: Math.round(
          Math.max(
            Math.min(240, maximum),
            Math.min(maximum, current.width + event.clientX - current.x),
          ),
        ),
        height: Math.round(
          Math.max(
            minimumHeight[current.id],
            Math.min(900, current.height + event.clientY - current.y),
          ),
        ),
      },
      false,
    );
  }

  function finishResize() {
    if (!drag.current) return;
    drag.current = null;
    persistLayout();
  }

  function favorite(href: string) {
    const next = favorites.includes(href)
      ? favorites.filter((item) => item !== href)
      : [...favorites, href].slice(-12);
    try {
      localStorage.setItem('workspace-favorites', JSON.stringify(next));
      setFavorites(next);
    } catch {
      setMessage('The shortcut could not be saved.');
    }
  }

  async function newTask(event: React.FormEvent) {
    event.preventDefault();
    if (!quickTask.trim()) return;
    try {
      await updateStudy((state) =>
        saveTask(state, {
          id: crypto.randomUUID(),
          title: quickTask.trim(),
          done: false,
          plannedDate: dayKey(Date.now()),
          createdAt: Date.now(),
        }),
      );
      setQuickTask('');
    } catch {
      setMessage('Your task could not be saved.');
    }
  }

  async function taskDone(id: string) {
    try {
      await updateStudy((state) => completeTask(state, id, Date.now()));
    } catch {
      setMessage('Your task could not be updated.');
    }
  }

  function evaluate(event: React.FormEvent) {
    event.preventDefault();
    try {
      const result = String(calculate(expression));
      const history: unknown = JSON.parse(
        toolStorage.getItem('calcHistory') ?? '[]',
      );
      if (!Array.isArray(history))
        throw new Error('Calculator history is unavailable.');
      toolStorage.setItem(
        'calcHistory',
        JSON.stringify([{calc: expression, result}, ...history].slice(0, 200)),
      );
      setAnswer(result);
    } catch (failure) {
      setAnswer(
        failure instanceof Error ? failure.message : 'Check the calculation.',
      );
    }
  }

  async function popOut(id: WidgetId) {
    const url = '/widgets/' + id;
    try {
      type PipWindow = Window & {
        documentPictureInPicture?: {
          requestWindow: (options: {
            width: number;
            height: number;
          }) => Promise<Window>;
        };
      };
      const api = (window as PipWindow).documentPictureInPicture;
      if (api) {
        popup.current?.close();
        const preferences = layoutRef.current[id];
        const view = await api.requestWindow({
          width: Math.min(preferences.width + 28, screen.availWidth - 40),
          height: Math.min(preferences.height + 154, screen.availHeight - 40),
        });
        popup.current = view;
        const frame = view.document.createElement('iframe');
        frame.src = url;
        frame.title =
          WIDGETS.find((widget) => widget.id === id)?.title ?? 'Widget';
        frame.style.cssText = 'width:100%;height:100%;border:0';
        view.document.body.style.cssText =
          'margin:0;height:100vh;background:#0b1220';
        view.document.body.append(frame);
        return;
      }
      const preferences = layoutRef.current[id];
      window.open(
        url,
        'arpit-' + id,
        'popup,width=' +
          (preferences.width + 28) +
          ',height=' +
          (preferences.height + 154),
      );
    } catch {
      setMessage('Open the widget using its link below.');
    }
  }

  const seconds = remaining(study, now);
  const tasks = now
    ? plannerTasks(study, {
        view: 'today',
        category: '',
        query: '',
        today: dayKey(now),
        week: [],
      }).slice(0, 4)
    : [];
  const winner = gameWinner(board);
  const last = tools.find((tool) => tool.href === recent);
  const selection = WIDGETS.filter((widget) => widgets.includes(widget.id));

  return (
    <main className={compact ? s.compact : s.page}>
      <div className={s.shell}>
        <header className={s.header}>
          <Link href="/" className={s.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icons/brand-192.png" width="42" height="42" alt="" />
            <span>
              Arpit Agarwala<small>Workspace</small>
            </span>
          </Link>
          <div className={s.actions}>
            {!compact && <AccountLink className={s.link} />}
            <AppDownload className={s.link} email={email} />
            <FullscreenButton className={s.iconButton} />
          </div>
        </header>
        {!compact && (
          <>
            <div className={s.intro}>
              <h1>Your workspace</h1>
              <p>
                Adjust each widget to fit the way you work. Drag its lower-right
                corner, or open its settings.
              </p>
            </div>
            <section className={s.shortcuts} aria-label="Quick launch">
              {study.sessionId && (
                <Link href="/productivity/pomodoro" className={s.resume}>
                  <i className="ri-timer-line" aria-hidden="true" />
                  <span>
                    Resume your focus session
                    <small>
                      {study.activeTask || 'Focus Room'} ·{' '}
                      {Math.ceil(seconds / 60)} minutes
                    </small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
              {last && (
                <Link href={last.href} className={s.resume}>
                  <i className={last.icon} aria-hidden="true" />
                  <span>
                    Continue {last.title}
                    <small>Your last open tool</small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
              {tools
                .filter((tool) => favorites.includes(tool.href))
                .map((tool) => (
                  <Link href={tool.href} key={tool.href} className={s.shortcut}>
                    <i className={tool.icon} aria-hidden="true" />
                    {tool.title}
                  </Link>
                ))}
            </section>
          </>
        )}
        <div className={s.grid} ref={grid}>
          {selection.map((widget) => (
            <section
              key={widget.id}
              className={s.card}
              data-widget={widget.id}
              data-theme={layout[widget.id].theme}
              data-density={
                layout[widget.id].height < 300 ? 'compact' : 'comfortable'
              }
              style={
                {
                  '--widget-width': layout[widget.id].width + 'px',
                  '--widget-height': layout[widget.id].height + 'px',
                  '--text-scale': layout[widget.id].textSize / 100,
                } as CSSProperties
              }
            >
              <div className={s.cardHeader}>
                <h2>
                  <i className={widget.icon} aria-hidden="true" />
                  {widget.title}
                </h2>
                <div>
                  <button
                    className={s.iconButton}
                    onClick={() => {
                      setCustomizing(widget.id);
                      customizeDialog.current?.showModal();
                    }}
                    aria-label={'Customize ' + widget.title}
                    aria-haspopup="dialog"
                    title="Size and appearance"
                  >
                    <i className="ri-settings-3-line" aria-hidden="true" />
                  </button>
                  {!compact && (
                    <button
                      className={s.iconButton}
                      onClick={() => void popOut(widget.id)}
                      aria-label={'Pop out ' + widget.title}
                    >
                      <i
                        className="ri-picture-in-picture-line"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
              {widget.id === 'clock' && (
                <div className={s.clock}>
                  <p>
                    {time?.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }) ?? 'Your local time'}
                  </p>
                  <time>
                    {time?.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: layout.clock.hour12,
                    }) ?? '—:—'}
                  </time>
                  {layout.clock.seconds && (
                    <span>
                      {time?.toLocaleTimeString(undefined, {
                        second: '2-digit',
                      }) ?? '—'}{' '}
                      seconds ·{' '}
                      {time
                        ? Intl.DateTimeFormat()
                            .resolvedOptions()
                            .timeZone.replace(/_/g, ' ')
                        : 'Device timezone'}
                    </span>
                  )}
                </div>
              )}
              {widget.id === 'focus' && (
                <div className={s.focus}>
                  <div className={s.modes}>
                    {(['focus', 'short', 'long'] as const).map((mode) => (
                      <button
                        key={mode}
                        disabled={Boolean(study.sessionId)}
                        aria-pressed={study.mode === mode}
                        onClick={() =>
                          void updateStudy((state) =>
                            resetStudy(state, mode, Date.now()),
                          ).catch(() =>
                            setMessage('The timer could not be updated.'),
                          )
                        }
                      >
                        {mode === 'focus'
                          ? 'Focus'
                          : mode === 'short'
                            ? 'Short break'
                            : 'Long break'}
                      </button>
                    ))}
                  </div>
                  <time role="timer" aria-label="Time remaining">
                    {String(Math.floor(seconds / 60)).padStart(2, '0')}
                    <span>:</span>
                    {String(seconds % 60).padStart(2, '0')}
                  </time>
                  <p>{study.activeTask || 'No task selected'}</p>
                  <button
                    className={s.primary}
                    disabled={!ready}
                    onClick={() => void toggleFocus()}
                  >
                    {study.deadline !== null
                      ? 'Pause timer'
                      : study.sessionId
                        ? 'Resume timer'
                        : 'Start timer'}
                  </button>
                </div>
              )}
              {widget.id === 'tasks' && (
                <div className={s.tasks}>
                  {tasks.map((task) => (
                    <label key={task.id}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => void taskDone(task.id)}
                      />
                      <span>{task.title}</span>
                    </label>
                  ))}
                  {!tasks.length && <p>No tasks planned for today.</p>}
                  <form onSubmit={newTask}>
                    <input
                      aria-label="New task"
                      placeholder="Add a task for today"
                      value={quickTask}
                      onChange={(e) => setQuickTask(e.target.value)}
                      maxLength={160}
                      disabled={!ready || study.tasks.length >= 2000}
                    />
                    <button
                      className={s.iconButton}
                      disabled={
                        !ready ||
                        !quickTask.trim() ||
                        study.tasks.length >= 2000
                      }
                      aria-label="Add task"
                    >
                      ＋
                    </button>
                  </form>
                </div>
              )}
              {widget.id === 'calculator' && (
                <form onSubmit={evaluate} className={s.calculator}>
                  <input
                    aria-label="Calculation"
                    value={expression}
                    placeholder="(125 + 75) / 4"
                    maxLength={150}
                    inputMode="text"
                    onChange={(e) => setExpression(e.target.value)}
                  />
                  <output aria-live="polite">{answer || '0'}</output>
                  <div className={s.keypad}>
                    {[
                      '7',
                      '8',
                      '9',
                      '/',
                      '4',
                      '5',
                      '6',
                      '*',
                      '1',
                      '2',
                      '3',
                      '-',
                      '0',
                      '.',
                      '(',
                      ')',
                    ].map((key) => (
                      <button
                        key={key}
                        type="button"
                        aria-label={
                          key === '*'
                            ? 'Multiply'
                            : key === '/'
                              ? 'Divide'
                              : key
                        }
                        onClick={() =>
                          setExpression((old) => (old + key).slice(0, 150))
                        }
                      >
                        {key === '*' ? '×' : key === '/' ? '÷' : key}
                      </button>
                    ))}
                  </div>
                  <div className={s.actions}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpression('');
                        setAnswer('');
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      aria-label="Plus"
                      onClick={() =>
                        setExpression((old) => (old + '+').slice(0, 150))
                      }
                    >
                      ＋
                    </button>
                    <button className={s.primary} disabled={!expression.trim()}>
                      Calculate
                    </button>
                  </div>
                </form>
              )}
              {widget.id === 'game' && (
                <div className={s.game}>
                  <p role="status">
                    {winner === 'draw'
                      ? 'Draw.'
                      : winner
                        ? winner + ' wins this round.'
                        : turn + ' to play · pass and play'}
                  </p>
                  <div className={s.board} aria-label="Tic Tac Toe board">
                    {board.map((cell, index) => (
                      <button
                        key={index}
                        aria-label={
                          'Square ' +
                          (index + 1) +
                          (cell ? ' ' + cell : ' empty')
                        }
                        disabled={Boolean(cell || winner)}
                        onClick={() => {
                          setBoard((old) =>
                            old.map((value, i) => (i === index ? turn : value)),
                          );
                          setTurn(turn === 'X' ? 'O' : 'X');
                        }}
                      >
                        {cell}
                      </button>
                    ))}
                  </div>
                  <button
                    className={s.secondary}
                    onClick={() => {
                      setBoard(Array(9).fill(''));
                      setTurn('X');
                    }}
                  >
                    New round
                  </button>
                </div>
              )}
              <Link
                href={compact ? '/widgets' : widget.href}
                className={s.open}
              >
                {compact ? 'All widgets' : 'Open ' + widget.title}
                <span aria-hidden="true">↗</span>
              </Link>
              {!compact && (
                <button
                  className={s.resizeHandle}
                  aria-label={'Resize ' + widget.title}
                  title="Drag to resize. Arrow keys adjust width and height."
                  onPointerDown={(event) => startResize(event, widget.id)}
                  onPointerMove={resize}
                  onPointerUp={finishResize}
                  onPointerCancel={finishResize}
                  onLostPointerCapture={finishResize}
                  onKeyDown={(event) => {
                    if (
                      ![
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowUp',
                        'ArrowDown',
                      ].includes(event.key)
                    )
                      return;
                    event.preventDefault();
                    const step = event.shiftKey ? 40 : 10;
                    const item = layoutRef.current[widget.id];
                    const shownWidth = event.currentTarget
                      .closest('section')!
                      .getBoundingClientRect().width;
                    const horizontal =
                      event.key === 'ArrowLeft' || event.key === 'ArrowRight';
                    const delta =
                      event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                        ? -step
                        : step;
                    appearance(
                      widget.id,
                      horizontal
                        ? {
                            width: Math.max(
                              240,
                              Math.min(1200, shownWidth + delta),
                            ),
                          }
                        : {
                            height: Math.max(
                              minimumHeight[widget.id],
                              Math.min(900, item.height + delta),
                            ),
                          },
                    );
                  }}
                >
                  <span className={s.grip} aria-hidden="true" />
                </button>
              )}
            </section>
          ))}
        </div>
        <dialog
          ref={customizeDialog}
          className={s.customizeDialog}
          aria-labelledby="widget-settings-title"
        >
          <div className={s.dialogHeader}>
            <h2 id="widget-settings-title">
              {WIDGETS.find((widget) => widget.id === customizing)?.title}{' '}
              settings
            </h2>
            <form method="dialog">
              <button
                className={s.iconButton}
                aria-label="Close widget settings"
              >
                ×
              </button>
            </form>
          </div>
          <p>
            Changes are saved on this device. Width fits the available screen
            space.
          </p>
          <div className={s.sizePresets} aria-label="Widget size presets">
            {[
              {
                name: 'Compact',
                width: 280,
                height: customizing === 'calculator' ? 440 : 260,
              },
              {
                name: 'Standard',
                width: 370,
                height: defaultLayout()[customizing].height,
              },
              {name: 'Expanded', width: 760, height: 540},
            ].map((preset) => (
              <button
                key={preset.name}
                aria-pressed={
                  layout[customizing].width === preset.width &&
                  layout[customizing].height === preset.height
                }
                onClick={() =>
                  appearance(customizing, {
                    width: preset.width,
                    height: preset.height,
                  })
                }
              >
                {preset.name}
              </button>
            ))}
          </div>
          <label>
            Width <output>{layout[customizing].width} px</output>
            <input
              type="range"
              aria-label="Widget width"
              min="240"
              max="1200"
              step="1"
              value={layout[customizing].width}
              onChange={(event) =>
                appearance(customizing, {width: Number(event.target.value)})
              }
            />
          </label>
          <label>
            Height <output>{layout[customizing].height} px</output>
            <input
              type="range"
              aria-label="Widget height"
              min={minimumHeight[customizing]}
              max="900"
              step="1"
              value={layout[customizing].height}
              onChange={(event) =>
                appearance(customizing, {height: Number(event.target.value)})
              }
            />
          </label>
          <label>
            Text size <output>{layout[customizing].textSize}%</output>
            <input
              type="range"
              aria-label="Widget text size"
              min="80"
              max="130"
              step="5"
              value={layout[customizing].textSize}
              onChange={(event) =>
                appearance(customizing, {textSize: Number(event.target.value)})
              }
            />
          </label>
          <label>
            Appearance
            <select
              aria-label="Appearance"
              value={layout[customizing].theme}
              onChange={(event) =>
                appearance(customizing, {
                  theme: event.target.value as WidgetAppearance['theme'],
                })
              }
            >
              <option value="graphite">Graphite</option>
              <option value="slate">Slate</option>
              <option value="paper">Paper</option>
            </select>
          </label>
          {customizing === 'clock' && (
            <>
              <label className={s.checkSetting}>
                <input
                  type="checkbox"
                  checked={layout.clock.hour12}
                  onChange={(event) =>
                    appearance('clock', {hour12: event.target.checked})
                  }
                />
                12-hour clock
              </label>
              <label className={s.checkSetting}>
                <input
                  type="checkbox"
                  checked={layout.clock.seconds}
                  onChange={(event) =>
                    appearance('clock', {seconds: event.target.checked})
                  }
                />
                Show seconds and timezone
              </label>
            </>
          )}
          <button
            className={s.secondary}
            onClick={() =>
              appearance(customizing, defaultLayout()[customizing])
            }
          >
            Reset widget settings
          </button>
        </dialog>
        {(error || message) && (
          <p role="status" className={s.notice}>
            {message || error}
          </p>
        )}
        {!compact && (
          <>
            <details className={s.settings}>
              <summary>Personalise quick launch</summary>
              <p>
                Choose up to twelve favourites. These shortcuts stay on this
                device.
              </p>
              <div className={s.choices}>
                {tools.map((tool) => (
                  <button
                    key={tool.href}
                    disabled={!settingsReady}
                    aria-pressed={favorites.includes(tool.href)}
                    onClick={() => favorite(tool.href)}
                  >
                    <i className={tool.icon} aria-hidden="true" />
                    {tool.title}
                    <span aria-hidden="true">
                      {favorites.includes(tool.href) ? '★' : '☆'}
                    </span>
                  </button>
                ))}
              </div>
            </details>
            <OfflinePacks />
            <RecoveryHistory />
            <section className={s.settings}>
              <h2>Take your widgets with you</h2>
              <p>
                Open a single widget, then use your browser’s install option to
                give it its own icon. On a laptop, Pop out opens a compact
                window. Supported browsers can keep it above other windows.
              </p>
              <div className={s.actions}>
                {selection.map((widget) => (
                  <Link key={widget.id} href={'/widgets/' + widget.id}>
                    {widget.title} ↗
                  </Link>
                ))}
              </div>
              <p>
                <Link href="/download">
                  Phone home-screen widgets and installation guide ↗
                </Link>
              </p>
            </section>
          </>
        )}
        <footer className={s.footer}>
          <a href={'mailto:' + email}>Email support</a>
          <a href="https://arpitagarwala.com">Website</a>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
