'use client';

import {createContext, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import styles from './app-install.module.css';
import Link from 'next/link';

type InstallPrompt = Event & {
  prompt(): Promise<{outcome: 'accepted' | 'dismissed'}>;
};

const InstallContext = createContext<{prompt: InstallPrompt | null; installed: boolean} | null>(null);

export function AppInstallProvider({children}: {children: ReactNode}) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = matchMedia('(display-mode: standalone)');
    const ios = navigator as Navigator & {standalone?: boolean};
    const updateMode = () => setInstalled(standalone.matches || ios.standalone === true);
    const available = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const complete = () => {
      setPrompt(null);
      setInstalled(true);
    };
    window.addEventListener('beforeinstallprompt', available);
    window.addEventListener('appinstalled', complete);
    standalone.addEventListener('change', updateMode);
    updateMode();
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', available);
      window.removeEventListener('appinstalled', complete);
      standalone.removeEventListener('change', updateMode);
    };
  }, []);

  return <InstallContext.Provider value={{prompt, installed}}>{children}</InstallContext.Provider>;
}

export function AppDownload({className, email}: {className?: string; email: string}) {
  const install = useContext(InstallContext);
  const dialog = useRef<HTMLDialogElement>(null);
  const [usedPrompt, setUsedPrompt] = useState<InstallPrompt | null>(null);
  const prompt = install?.prompt;

  async function installWebApp() {
    if (!prompt || usedPrompt === prompt) return;
    setUsedPrompt(prompt);
    try {
      if ((await prompt.prompt()).outcome === 'accepted') dialog.current?.close();
    } catch {
      // The browser instructions remain available if the native prompt fails.
    }
  }

  return <>
    <button className={className} type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
      Download app
    </button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="app-download-title">
      <div className={styles.heading}>
        <h2 id="app-download-title">Arpit Agarwala app</h2>
        <form method="dialog"><button className={styles.close} aria-label="Close download options">×</button></form>
      </div>
      <p>Open the whole site in its own window, including Productivity and Games.</p>
      {install?.installed ? <p role="status">You’re using the web app.</p> : prompt && prompt !== usedPrompt
        ? <button type="button" className={styles.primary} onClick={() => void installWebApp()}>Install web app</button>
        : <section className={styles.instructions} aria-label="Install the web app">
          <p><strong>iPhone or iPad</strong> · In Safari, tap Share and choose Add to Home Screen.</p>
          <p><strong>Android</strong> · In Chrome, open the menu and choose Install app or Add to Home screen.</p>
          <p><strong>Desktop</strong> · Use Install in Chrome or Edge, or File → Add to Dock in Safari.</p>
        </section>}
      <a className={styles.secondary} href="/downloads/Arpit-Agarwala.exe?v=1.1" download>Download for Windows</a>
      <a className={styles.secondary} href="/downloads/Arpit-Agarwala.apk?v=1.1" download>Android app with widgets</a>
      <p><Link href="/download">Installation guide & phone widgets ↗</Link></p>
      <p className={styles.detail}>The portable launcher uses Microsoft Edge. Windows may show a warning because the launcher is unsigned.</p>
      <footer className={styles.support}><a href={'mailto:' + email}>Email support</a><a href="https://arpitagarwala.com">Website</a></footer>
    </dialog>
  </>;
}
