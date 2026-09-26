# Mixr POC plan

## What the POC does today

Static, mobile-first prototype in `mixer-ui/`, built on the draft site's stack (plain HTML/CSS/JS, poster skin, no build step). All data is sample data, kept in the browser's localStorage so actions stick between pages.

| Screen | File | What works |
|---|---|---|
| Home dashboard | `index.html` | Partiful-style event cards (cover photo, date tab, Booked/Planning sticker, Hosting/Going pill, co-host avatars, headcount). Filters: Upcoming, Hosting, Going, Past. Banner when invites are waiting. Tap a card for details. |
| Bottom tabs | `index.html` | Floating pill at bottom center: 📅 Calendar, + Create Event, ✉️ Invites (with unread badge). |
| Calendar | `index.html#calendar` | Month grid for the KWEST, built from the event, blackout and invite data. Coloured dots for hosting / planning / going / pending invites, hatched blackout days. Tap a day to see what's on it, mark or remove a blackout, or jump into planning. |
| Create Event | `create.html` | The draft's event builder (agent chat, venue swipe, group match, plan approval), unchanged apart from a back button. When the flow finishes, the booked mixer is saved and shows up on Home and Calendar. |
| Invites | `index.html#invites` | Cards for invites from other KWEST chairs: sender, match %, date, venue, group sizes, $/person, their note. Each is checked against your blackouts, your existing events and your budget. Accept adds it to your calendar; Decline removes it. Empty state is an empty mailbox. |
| Desktop organizer | `web.html` | Draft's desktop view, unchanged. |

Run it: `cd mixer-ui && python3 -m http.server 8000`, then open http://localhost:8000. The links under the phone frame reset the sample data or show the empty mailbox.

`js/store.js` is the only data layer. Each function in it maps to one backend endpoint below, so going live means swapping those functions for `fetch` calls.

## APIs needed

Ordered by what the demo needs first. "Gated" means partner approval is required and is unlikely to come through in a hackathon timeframe.

| Need | Recommended | Alternatives / notes |
|---|---|---|
| Backend, database, auth, realtime | **Supabase** (Postgres, Auth, Realtime for live invites, Row Level Security per KWEST) | Firebase; or a Node/Express API on Railway, where the sample app already runs. |
| Sign-in | Supabase Auth with **Google** and **Microsoft (Entra ID)** OAuth | Which one depends on what the school uses (Northwestern accounts run on Microsoft 365; inferred, please confirm). |
| KWEST calendar and free/busy | **Google Calendar API** (`events.list`, `freebusy.query`, `events.watch` for change pushes) | **Microsoft Graph** calendar (`/calendar/getSchedule`) if chairs use Outlook. Blackouts live in Mixr's own DB and can also be written back to the shared calendar. |
| The agent | **Claude API** with tool use (`claude-sonnet-5` for the chat loop, `claude-opus-5-5` for negotiation/planning) | Each builder step becomes a tool: `check_calendar`, `search_venues`, `hold_venue`, `find_groups`, `send_invite`, `propose_split`. Chair-to-chair negotiation is two agent sessions exchanging structured proposals through your backend. |
| Venue discovery | **Google Places API (New)**: Text/Nearby Search, Place Details, Place Photos | Yelp Fusion. Neither gives private-event capacity, minimums or deposits, which is why the draft's venue portal (`web.html`) matters: venues list their "dead nights" and terms themselves. |
| Reservations and holds | Venue portal + email/SMS outreach (**SendGrid**, **Twilio**) for the demo | **Tripleseat** (private-event leads API), **SevenRooms** and **OpenTable** are gated; Resy has no public API. |
| Deposits and tab splitting | **Stripe** (Payment Intents for the deposit, Connect for paying venues and splitting between two KWESTs) | Splitwise API for post-event tab splits. |
| KWEST matching | Postgres rules (date overlap, headcount, $/person) + **pgvector** embeddings on vibe tags and past-event ratings | Voyage AI or OpenAI embeddings. |
| Notifications | Supabase Realtime in-app, **Web Push**, Twilio SMS, SendGrid email | Expo push if you go native later. |
| Travel between groups/venues | **Google Routes API** (travel time, transit) | Uber Guest Rides API is gated. |

## Data model (first cut)

- `kwest` (id, name, members, home_area, budget_pp, vibe_tags)
- `chair` (user id, kwest_id, role)
- `event` (id, title, date, time, venue_id, host_kwest_id, status: planning/booked/done, headcount, budget_pp, deposit)
- `event_kwest` (event_id, kwest_id, role: hosting/going)
- `blackout` (kwest_id, start, end, label, source: manual/calendar)
- `invite` (id, from_kwest_id, to_kwest_id, event_id, note, status: pending/accepted/declined, match_score)
- `venue` (id, place_id, capacity, deposit, open_nights)
- `hold` (venue_id, event_id, expires_at)

## Endpoints the POC already assumes

| `js/store.js` function | Endpoint |
|---|---|
| `events()` | `GET /kwests/:id/events` |
| `blackouts()`, `blackoutOn()` | `GET /kwests/:id/blackouts?from=&to=` |
| `toggleBlackout()` | `POST` / `DELETE /kwests/:id/blackouts` |
| `invites()` | `GET /kwests/:id/invites?status=pending` |
| `respondInvite()` | `POST /invites/:id/respond {accept}` |
| `addEvent()` | `POST /events` (called when the builder books) |

## Suggested next steps

1. Stand up Supabase with the tables above and seed it from `js/store.js`.
2. Swap `store.js` functions for Supabase calls; add Google sign-in.
3. Connect the Google Calendar free/busy check to the Calendar tab and to invite conflict checks.
4. Put the builder chat behind the Claude API with the tools listed above, starting with Places search and calendar.
5. Deploy to Railway next to (or in place of) the current sample app.
