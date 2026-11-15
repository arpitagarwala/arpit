'use client';

import {useEffect, useRef, useState} from 'react';
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
  const [large, setLarge] = useState<WidgetId | null>(null);
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
      } catch {
        setMessage('Your saved shortcuts could not load.');
      }
      setSettingsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
        const view = await api.requestWindow({width: 380, height: 490});
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
      window.open(url, 'arpit-' + id, 'popup,width=390,height=520');
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
            Arpit Agarwala<span>Personal workspace</span>
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
              <p className={s.eyebrow}>MAKE ROOM FOR WHAT MATTERS</p>
              <h1>
                A little space.
                <br />
                <em>Your everyday essentials.</em>
              </h1>
              <p>
                Keep time, focus on one task, and pick up where you left off.
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
        <div className={s.grid}>
          {selection.map((widget) => (
            <section
              key={widget.id}
              className={s.card + ' ' + (large === widget.id ? s.wide : '')}
              data-widget={widget.id}
            >
              <div className={s.cardHeader}>
                <h2>
                  <i className={widget.icon} aria-hidden="true" />
                  {widget.title}
                </h2>
                {!compact && (
                  <div>
                    <button
                      className={s.iconButton}
                      onClick={() =>
                        setLarge(large === widget.id ? null : widget.id)
                      }
                      aria-label={'Resize ' + widget.title}
                      aria-pressed={large === widget.id}
                    >
                      <i className="ri-layout-line" aria-hidden="true" />
                    </button>
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
                  </div>
                )}
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
                      hour12: false,
                    }) ?? '—:—'}
                  </time>
                  <span>
                    {time?.toLocaleTimeString(undefined, {second: '2-digit'}) ??
                      '—'}{' '}
                    seconds ·{' '}
                    {time
                      ? Intl.DateTimeFormat()
                          .resolvedOptions()
                          .timeZone.replace(/_/g, ' ')
                      : 'Device timezone'}
                  </span>
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
                  <p>{study.activeTask || 'Give one thing your attention.'}</p>
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
                  {!tasks.length && <p>Choose your next small step.</p>}
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
                      ? 'A thoughtful draw.'
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
            </section>
          ))}
        </div>
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
