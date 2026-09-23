# Running the FORCOACH mobile app on your MacBook

This app is built on this Windows machine and pushed to GitHub. All testing/running
happens on your MacBook, using its iOS Simulator or an Android emulator — nothing
gets run here.

## One-time setup on the MacBook

1. **Install Node.js** (if not already installed) — get the LTS version from nodejs.org.
2. **Install Xcode** from the Mac App Store (needed for the iOS Simulator). Open it once
   and let it finish installing additional components.
3. **Install Watchman** (recommended by Expo for file watching):
   ```
   brew install watchman
   ```
4. Clone the repo:
   ```
   git clone https://github.com/Hassan-Jamal8735/forcoach-mobile.git
   cd forcoach-mobile
   npm install
   ```
5. Create the `.env` file (this is never committed to git, so you need to create it
   yourself — copy from `.env.example` and I'll give you the real values separately):
   ```
   cp .env.example .env
   ```
   Then fill in:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://db.forcoach.io
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg2MTM5MzQ0LCJleHAiOjIxMDE0OTkzNDR9.BjLCT_s6L3n8Wy7W_lkXoa3QgP-1yG4kZKDO8myidJA
   EXPO_PUBLIC_API_URL=https://api.forcoach.io
   ```

## Running the app

```
npx expo start
```

This opens the Expo dev tools in your terminal. From there:
- Press **i** to launch it in the iOS Simulator (no physical iPhone needed).
- Press **a** to launch it in an Android emulator, if you have Android Studio installed.
- Or scan the QR code with the **Expo Go** app on a real phone (fastest way to test on
  a real device without any native build step).

## Pulling future updates

Every time I push new milestone work:
```
git pull
npm install
npx expo start
```

`npm install` is only needed again if `package.json` changed (new dependency added).
Otherwise `git pull` + `npx expo start` is enough.

## What to test in Milestone 1

- Log in with a real FORCOACH coach account (same email/password as the web app).
- View the calendar — it should show the same classes as the web app.
- Add a new class (with and without assigning a studio).
- Edit an existing class.
- Delete a class.
- Log out and back in.
- Earnings / Invoices / Studios tabs will show a "Coming in the next milestone"
  placeholder — that's expected, not a bug.
