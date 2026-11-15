# Windows launcher

The portable launcher opens `https://arpitagarwala.com/` in a maximized Microsoft Edge app window. It uses the regular Edge profile, so account sign-in can use the browser's Google flow. The launcher needs Edge, an internet connection and .NET Framework 4.x. The downloadable build is unsigned.

On Windows, run `npm ci`, then `node desktop/build-icons.mjs` and `./desktop/build.ps1` from PowerShell in the repository root. The build writes `public/downloads/Arpit-Agarwala.exe`, which the landing page serves with a download header. Publishing the website updates the content the launcher opens.

The web app uses the same site and has its own installation flow under **Download app**. The service worker shows a reconnect screen when a new navigation needs internet access.
