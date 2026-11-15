'use client';

import {useState, useSyncExternalStore} from 'react';

function subscribe(update: () => void) {
  document.addEventListener('fullscreenchange', update);
  return () => document.removeEventListener('fullscreenchange', update);
}

function fullscreenMode() {
  if (!document.fullscreenEnabled || typeof document.documentElement.requestFullscreen !== 'function') return 'unavailable';
  if (!document.fullscreenElement) return 'windowed';
  return document.fullscreenElement === document.documentElement ? 'full' : 'nested';
}

export function FullscreenButton({className}: {className: string}) {
  const mode = useSyncExternalStore(subscribe, fullscreenMode, () => 'unavailable');
  const [message, setMessage] = useState('');
  if (mode === 'unavailable' || mode === 'nested') return null;
  const full = mode === 'full';
  const label = full ? 'Exit full screen' : 'Enter full screen';

  async function toggle() {
    try {
      setMessage('');
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setMessage('Full screen is unavailable right now.');
    }
  }

  return <>
    <button type="button" className={className} aria-label={label} title={label} onClick={() => void toggle()}>
      <i className={full ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'} aria-hidden="true"/>
    </button>
    <span className="sr-only" role="status">{message}</span>
  </>;
}
