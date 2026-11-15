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
            Arpit Agarwala<span>App & widgets</span>
          </Link>
          <Link href="/widgets" className={s.link}>
            Open widgets ↗
          </Link>
        </header>
        <div className={s.intro}>
          <p className={s.eyebrow}>A PLACE ON YOUR HOME SCREEN</p>
          <h1>
            Your everyday tools.
            <br />
            <em>One tap away.</em>
          </h1>
          <p>
            Install the full website, or keep a clock, focus timer and
            calculator close at hand.
          </p>
          <div className={s.actions}>
            <AppDownload className={s.primary} email={site.home.email} />
            <Link href="/widgets">Explore widgets ↗</Link>
          </div>
        </div>
        <section className={s.settings}>
          <h2>iPhone & iPad</h2>
          <p>
            Open this site in Safari, tap Share, then Add to Home Screen. Enable
            Open as Web App if prompted. Your clock, timer, tasks, calculator
            and game are available on the Widgets page.
          </p>
          <p>
            Native iPhone home-screen widgets require the companion app’s
            Apple-signed build. The widget extension is prepared for signing and
            testing on a Mac. This web app’s icons open compact tools.
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
            Add the Clock, Focus timer, Calculator or Tic Tac Toe widget. Native
            companion widgets work offline. Their timer and game are saved on
            the phone. Website account sync applies to the tools inside the web
            app.
          </p>
          <div className={s.actions}>
            <a
              className={s.primary}
              href="/downloads/Arpit-Agarwala.apk"
              download
            >
              Download Android app
            </a>
          </div>
        </section>
        <section className={s.settings}>
          <h2>Laptop widgets</h2>
          <p>
            Install the web app in Chrome or Edge, or use Safari’s Add to Dock.
            On the Widgets page, choose Pop out to open a compact tool. Browsers
            with picture-in-picture window support can keep it above your work.
          </p>
          <div className={s.actions}>
            <a
              className={s.primary}
              href="/downloads/Arpit-Agarwala.exe"
              download
            >
              Download Windows launcher
            </a>
            <Link href="/widgets">Open widget workspace ↗</Link>
          </div>
          <p>
            The Windows launcher uses Microsoft Edge and is unsigned. Windows
            can show a security prompt when you download or open it.
          </p>
        </section>
        <section className={s.settings}>
          <h2>Work without a connection</h2>
          <p>
            Open Widgets and download an offline pack. Open each tool once while
            connected so your account and saved preferences are ready. Changes
            stay on the device until the connection returns.
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
