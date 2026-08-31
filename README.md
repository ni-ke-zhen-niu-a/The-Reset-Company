# The Reset Company

A small public utility that turns reset plans announced by [Tibo](https://x.com/thsottiaux) into a local-time countdown. It is designed for GitHub Pages and needs no application server.

## What it does

- Converts one canonical UTC reset time to the visitor's selected IANA time zone.
- Supports English, Simplified Chinese, Japanese, Spanish, German, French, and Portuguese.
- Shows the source post, detection time, last check, and five reference cities.
- Distinguishes exact times, relative times, and vague announcements. Vague posts show “time TBD” instead of a fabricated countdown.
- Runs a GitHub Actions monitor every 10 minutes and redeploys only when data changes.

## Run locally

```bash
npm install
npm run dev
```

Tests and production build:

```bash
npm test
npm run build
```

## Publish on GitHub Pages

1. Create a new GitHub repository and push this project to its `main` branch.
2. Open **Settings → Pages → Build and deployment** and choose **GitHub Actions**.
3. Run the **Deploy GitHub Pages** workflow once, or push to `main`.
4. In **Settings → Actions → General**, allow workflows to read and write the repository.

The Vite base path is relative, so the same build works at `username.github.io/repository/` and later on a custom domain.

## Automatic monitoring

For reliable discovery, create the repository secret `X_BEARER_TOKEN` with an X API v2 bearer token. The monitor reads Tibo's recent original posts. Without that secret it attempts public search discovery and fetches discovered post IDs through public embed APIs; that fallback can be delayed or blocked by third parties.

An optional `PUBLIC_TIMELINE_RSS_URL` secret may point to a trusted RSS feed for the account.

### Manual fallback

Open **Actions → Monitor Tibo reset posts → Run workflow** and paste:

- the post text,
- its X URL,
- optionally the post timestamp in ISO 8601.

The same deterministic parser is used. Supported phrases include explicit zoned times such as `at 6pm PST`, ISO timestamps, and relative durations such as `in 3 hours` or `you have 30 minutes`.

## Data contract

The UI reads `public/data/reset.json`. UTC is the canonical stored time; localization happens only in the browser. The last 50 parsed reset events are retained in `public/data/history.json`.

## Custom domain later

When the final domain is ready, add it under **Settings → Pages → Custom domain**. GitHub creates the `CNAME` configuration for Pages; the application code does not need to change.
