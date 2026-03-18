# TODOS

## Auth & Cloud Sync

### P1 — Supabase Auth (Email + Google OAuth)
**What:** Add user authentication via Supabase Auth (email/password + Google OAuth).
**Why:** Profile data and climb records currently live in localStorage — lose your device, lose everything. Auth unlocks cloud sync, multi-device, and future social features.
**How to apply:** Add `middleware.ts` for session management, update `user_profiles` to use `auth.users` foreign key, migrate localStorage data on first sign-in.
**Effort:** human ~3 days / CC+gstack ~45 min
**Depends on:** Nothing — can start any time.

## Social & Growth

### P2 — Social sharing (Twitter/LINE + shareable permalink)
**What:** Share AI suggestion results via Twitter/LINE with a permalink.
**Why:** Lowest-cost growth channel — one user shares, 10 discover YamaMatch.
**How to apply:** Generate a `suggestions/{id}` URL that stores results server-side (Supabase table). Share button posts pre-filled tweet/LINE message with the link.
**Effort:** human ~2 days / CC+gstack ~20 min
**Depends on:** Auth (permalink needs a user to own it).

## Completed

<!-- Items completed in this PR will be moved here by /ship -->
