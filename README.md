# Dripply — Water Sort Puzzle

Sort coloured water into tubes until every tube holds a single colour.
60 handcrafted levels (3 → 10 colours), then endless generated levels
that keep getting harder (up to 12 colours). Plus a daily challenge
puzzle, coins, hints, extra tubes, daily rewards and 3 themes.

**Package (Android application ID):** `com.dripply.watersort`

## Play it

Open `www/index.html` in a browser — no build step needed for the web version.

## Build the Android APK (GitHub Actions)

Every push to `main` runs `.github/workflows/build-apk.yml` and produces
a signed release APK (`dripply-release-apk`). It uses the same permanent
release keystore as the other games (GitHub secrets KEYSTORE_BASE64 /
KEYSTORE_PASSWORD / KEY_ALIAS / KEY_PASSWORD), so updates install over
the previous version without uninstall. versionCode is the GitHub run
number, so it always increases.

## Ads — AdMob (⚠️ TEST IDs — replace before publishing)

Earning is ads-only (video ads, no pop-ups, no paid Premium):

- App Open ad — once, when the app opens (demo overlay for now: the AdMob
  plugin used here has no App Open API, so this slot is never faked as a
  real ad; a plugin with App Open support is a separate job)
- Banner — Home screen only, never while playing (real native banner)
- Interstitial — after every 3rd completed level (real ad first,
  3-second demo overlay only as fallback)
- Rewarded video — only when the player taps Watch Ad: Hint, Extra Tube,
  +5 Undos, Free Coins, or doubling the daily reward; the reward is
  granted only when AdMob reports it earned

**The IDs in `www/index.html` are the real Dripply AdMob IDs**
(App ID `ca-app-pub-2948876721824340~5359025385`, created 2026-11-26).
Each game has its own AdMob app and its own IDs; IDs from another game
do not work here. Real ads start only after AdMob review approval.

## Remote levels — add levels WITHOUT a new APK

The game fetches extra levels from this file on launch:

`https://raw.githubusercontent.com/SumitYadav06/Dripply/main/www/extra-levels.json`

To add new levels, just edit `www/extra-levels.json` in this repo and
push — no new APK build is needed. The game fetches it with a ~4s
timeout, validates every level strictly (correct shape, each colour
exactly 4 layers, solver-verified solvable), dedupes by `id`, appends
the new levels after the bundled ones, and never renumbers existing
levels. If the file is missing, the fetch fails or a level is invalid,
the game silently ignores it and keeps working fully offline with its
bundled + generated levels.

**Format** (see the shipped `www/extra-levels.json` for a working example):

```json
{
  "version": 1,
  "levels": [
    { "id": 67, "par": 45, "tubes": [[0,1,2,3],[3,2,1,0],[],[]] }
  ]
}
```

Rules per level:
- `id`: a unique integer **greater than 60** (bundled levels are 1–60).
  Never reuse an id and never change an existing level's id — saves and
  progress are keyed by id.
- `tubes`: an array of tubes; each tube is an array of colour indices
  (0–11), bottom layer first, at most 4 layers per tube. Every colour
  used must appear exactly 4 times in total across all tubes.
- `par`: the move count for 3 stars (optional; if missing or invalid
  the game uses the solver's solution length).
- The level must be solvable — the game checks with its built-in
  solver and drops any level that is not solvable.
- Maximum 50 remote levels are accepted per fetch.
- Colour indices map to the game's 12-colour palette (0 red, 1 orange,
  2 yellow, 3 light green, 4 green, 5 teal, 6 cyan, 7 blue, 8 indigo,
  9 purple, 10 pink, 11 brown).

**What needs a new APK and what does not:**
- New levels via `extra-levels.json` → NO new APK.
- Game rules, code, art, music, ad placements or AdMob IDs → new APK.

## Content

- **Levels:** 60 bundled (solver-verified solvable, par from the solver),
  6 remote extras in `www/extra-levels.json`, daily challenge (one
  date-seeded puzzle per day) and endless generated levels after 60
  (difficulty rises to 12 colours; generated levels are solver-checked
  in the game, with a guaranteed-solvable fallback layout).
- **Coins:** +20/+25/+30 per completed level (1/2/3 stars), +50 daily
  challenge, +100/day daily reward with a streak bonus (capped at
  +250/day). Coins buy Hint (30), Extra Tube (50) and Undo Pack (10) —
  or watch a rewarded ad instead.
- **Music — 2 original tracks in `www/assets/audio/` (~1.8 MB):**
  `music-ocean.mp3` (51 s, cheerful C-major, Ocean theme) and
  `music-sunset.mp3` (63 s, calm A-minor, Sunset/Candy themes). Each
  plays on loop for its theme and obeys the Music toggle.
  **Licence: 100% original — composed and synthesized from scratch
  with numpy/ffmpeg (no samples, no external or commercial music), so
  they are safe for Uptodown upload and for monetisation with no
  copyright-strike risk.** Sound effects (pour, select, win, error,
  click, coin) are WebAudio-synthesised originals. Music stops
  immediately when the app is minimised / sent to Home
  (visibilitychange + pagehide + Capacitor App state change).
- **Themes:** Ocean, Sunset, Candy (persisted). **Languages:**
  English / हिन्दी toggle (persisted). **Progress** persists in one
  versioned key (`dripply-save-v1`): coins, stars, unlocked levels,
  settings, daily streak.
- **Daily notification:** 10:00 AM local, once a day (Capacitor
  LocalNotifications, permission asked once on first open).
- **Icon:** `www/icon.png` (1254×1254, original PIL-drawn test tubes;
  art at 60% safe-zone). The user may replace it with his own final
  icon later.

## Verification (done at build time)

- JS syntax check on the inline scripts (`node --check`).
- Node harness proves every bundled level solvable, pour/win rules
  correct, daily levels solvable for 90 days, endless levels 61–200
  solvable, and remote extra levels valid + solvable
  (see `~/workspace/dripply-build/harness.js`).
