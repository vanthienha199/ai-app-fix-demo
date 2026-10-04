# Mossy Paws booking app: an AI-built app, audited and fixed

This repo is a portfolio sample. Mossy Paws is a made up dog grooming business, and every customer and booking in `src/data` is synthetic.

The `before` tag is the app the way an AI builder hands it over. It works in a quick click-through, but it has the problems I see most often in "please fix my app" projects. The commits after it fix them one area at a time, add tests, and leave a production build that passes.

## BEFORE / AFTER

| Problem in the `before` tag | What was wrong | After the fix |
|---|---|---|
| Staff login goes to a 404 | The password was checked in the browser, the flag lived in localStorage, and the redirect pointed at `/dashboard`, a route that does not exist | The form posts to `/api/login`, the password is checked on the server against `STAFF_PASSWORD`, and an httpOnly HMAC-signed cookie is set. Middleware guards `/admin` and `/api/admin` |
| Secret key shipped to every visitor | `NEXT_PUBLIC_MAILER_KEY` plus a hardcoded fallback, and `.env` committed | The mailer is a `server-only` module, `.env` is out of git, and the smoke test scans the client bundle for secrets |
| Customer data open to anyone | `GET /api/bookings` returned all 38,400 bookings with no sign in | The open endpoint is removed. `/api/admin/bookings` returns 401 without a session |
| Slow dashboard | It downloaded 5.8 MB of bookings, then made 300 customer lookups one by one, and searched with `JSON.stringify` on every keystroke | Bookings are joined once and kept in date order for binary-search ranges. Filters run on the server, and pages hold 25 rows |
| Build fails | A type error, and `useSearchParams` without a Suspense boundary | Search params are read on the server, and the types are fixed. `next build` passes |
| No loading or error states | Blank screens, errors swallowed, double submits | Slot loading skeletons, field errors from the API, a pending button, an admin skeleton, an error boundary with retry, and empty states |
| Broken on phones | A fixed 1100 px layout made the page 1101 px wide on a 390 px phone | The layout is responsive, and the dashboard turns into cards on small screens |

Measured on the same machine with the same data. The full numbers are in `evidence/summary.json`.

| Metric | Before | After |
|---|---|---|
| Dashboard data per load | 5,778,915 bytes | 88,388 bytes (whole page) |
| Customer requests per load | 300 | 0 |
| Time until customer names show (dev server) | 6,846 ms | 128 ms |
| One search | 705 ms per keystroke | 128 ms per filtered search (77 ms in production) |
| Page width on a 390 px phone | 1101 px | 390 px |
| `next build` | fails | passes |
| Tests | none | 19 unit tests, 11 production smoke checks |

To see the difference yourself, run `git diff before main --stat`, or read the four commits after `before`. Each one covers one area: security, performance, UI and states, then tests.

## Run it

    npm install
    cp .env.example .env.local   # set STAFF_PASSWORD and a 32+ character SESSION_SECRET
    npm run dev                  # http://localhost:3000, staff area at /admin
    npm test                     # 19 unit tests
    npm run build && npm start   # then, in another terminal:
    STAFF_PASSWORD=... npm run smoke

## Notes for a real deployment

- The old mailer key is still in this repo's history at the `before` tag, so a real project would rotate it. Deleting it from the code does not make it secret again.
- The demo keeps new bookings in memory, so they reset when the server restarts. A real deployment would swap `src/lib/db.ts` for Postgres or Supabase. Keep the same `queryBookings` contract and add indexes on `(date, time)`, `status` and `customer_id`.
- Set `MAILER_KEY` to send real confirmation emails. Without it, confirmations are queued in memory.
