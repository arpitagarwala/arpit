import type {Metadata} from 'next';
import Link from 'next/link';
import {getSite} from '@/lib/site-server';
import {AppDownload} from '@/components/install/AppInstall';
import s from '@/components/workspace/widgets.module.css';
export const metadata: Metadata = {title: 'Install the app and widgets'};
export default async function DownloadPage() {
  const site = await getSite();
  return (
    <main className={s.page}>
      <div className={s.shell} style={{maxWidth: 850}}>
        <header className={s.header}>
          <Link href="/" className={s.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/app-icons/brand-192.png" width="42" height="42" alt="" />
            <span>
              Arpit Agarwala<small>App & widgets</small>
            </span>
          </Link>
          <Link href="/" className={s.link}>
            Back to website ↗
          </Link>
        </header>
        <div className={s.intro}>
          <h1>Install the app</h1>
          <p>
            Install the full website as an app. Add Android home-screen
            widgets for a clock, focus timer, calculator and game.
          </p>
          <div className={s.actions}>
            <AppDownload className={s.primary} email={site.home.email} />
          </div>
        </div>
        <section className={s.settings}>
          <h2>iPhone & iPad</h2>
          <p>
            Open this site in Safari, tap Share, then Add to Home Screen. Enable
            Open as Web App if prompted to access the website’s tools and games.
          </p>
          <p>
            Native iPhone home-screen widgets require the companion app’s
            Apple-signed build. The widget extension is prepared for signing and
            testing on a Mac. Native iPhone widgets are not included in the web app.
          </p>
          <p>
            <a href="/downloads/Apple-Widgets-Source.zip" download>
              Download Apple widget project
            </a>
          </p>
        </section>
        <section className={s.settings}>
          <h2>Android home-screen widgets</h2>
          <p>
            Download and install the Android companion. If prompted, allow
            installation from this browser. Long-press an empty area of your
            home screen, choose Widgets, then find Arpit Agarwala.
          </p>
          <p>
            Add the Clock, Focus timer, Calculator or Tic Tac Toe widget. Press
            and hold a widget to resize it. Tap its ⋮ button to customize its
            theme, text size and settings. Native companion widgets work
            offline. Their timer and game are saved on the phone. Website
            account sync applies to the tools inside the web app.
          </p>
          <div className={s.actions}>
            <a
              className={s.primary}
              href="/downloads/Arpit-Agarwala.apk?v=1.1"
              download
            >
              Download Android app · 1.1
            </a>
          </div>
        </section>
        <section className={s.settings}>
          <h2>Desktop app</h2>
          <p>
            Install the web app in Chrome or Edge, or use Safari’s Add to Dock.
            The installed app opens the full website in its own window.
          </p>
          <div className={s.actions}>
            <a
              className={s.primary}
              href="/downloads/Arpit-Agarwala.exe?v=1.1"
              download
            >
              Download Windows launcher
            </a>
          </div>
          <p>
            The Windows launcher uses Microsoft Edge and is unsigned. Windows
            can show a security prompt when you download or open it.
          </p>
        </section>
        <footer className={s.footer}>
          <a href={'mailto:' + site.home.email}>Email support</a>
          <a href="https://arpitagarwala.com">Website</a>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </main>
  );
}
