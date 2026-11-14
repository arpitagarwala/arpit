# Account sync

Account sign-in uses Firebase Authentication with Google and Cloud Firestore on Spark. The application keeps working with browser storage until all four public Firebase settings are present. The owner login continues to use its existing backend.

## Local development

1. Run `npm ci`.
2. With the Firebase CLI and a Java runtime installed, run `firebase emulators:start --project demo-arpit-sync`. The demo project uses local emulators only.
3. Set the following in `.env.local` and run `npm run dev`.

   ```dotenv
   NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-arpit-sync.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-arpit-sync
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:arpit-sync
   NEXT_PUBLIC_FIREBASE_EMULATOR=1
   ```

4. Open `/account` and use the emulator's Google account picker. Sign into the same test account in a second browser profile to verify cross-device sync.

## Production setup

Create a dedicated Firebase project on Spark and register a web app. Enable Google in Authentication and authorize `arpitagarwala.com` and any other host that serves the account page. Create a Standard edition Firestore database. Deploy this repository's Firestore rules and index exemptions using `firebase deploy --only firestore --project YOUR_PROJECT_ID`. Add the registered web app's four public Firebase values to the website's build environment, then redeploy. The emulator flag is for development.

## Data behavior

Signed-in tool data is cached in a browser profile scoped to the account. Visitors can explicitly copy existing signed-out browser data from the account screen. If both copies have changes, the account screen offers a choice for that tool. Cloud writes verify the last known revision in a Firestore transaction. The site uploads edits in the background. Incoming changes load when a signed-in device opens the site or refreshes from the account screen, so a cloud restore cannot replace a tool while someone edits it. Edits made offline stay on the device until the connection returns.

Structured tool data syncs. Trade screenshots stay in IndexedDB and can be transferred with the journal's existing backup flow. Firestore stores at most 10 MB per tool before encoding overhead. Spark quotas apply to the whole Firebase project. Sign-out returns the tools to the signed-out browser profile.
