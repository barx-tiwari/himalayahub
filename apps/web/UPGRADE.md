# Upgrade notes — HimalayaHub v3 (formerly LearnHub Nepal)

**Learn • Explore • Discover.** v3 renames the site, adds a Nepal travel layer and redesigns the home page. Every v2 feature and
route still works; `package.json` dependencies are unchanged (no new packages).

## Brand
- All names, titles, metadata, loading screens and share text now say **HimalayaHub**. Brand, taglines and WhatsApp details live in
  `src/data/site.js` — change them there.
- New original logo (`LogoMark` in `src/components/layout/Logo.jsx`, `public/favicon.svg`): a Himalayan ridge with a small
  "knowledge node" rising from the summit. `public/og-image.png` is the social-share card.
- **Saved progress is kept.** LocalStorage moved from `learnhub:*` to `himalayahub:*`; old keys are copied once on first load
  (`src/utils/storage.js`).

## New routes
`/explore-nepal/:destination` (16 destinations), `/image-credits`, `/destinations` (redirects to `/explore-nepal`).
Unknown destinations show the 404 page. Keyboard shortcut `g` then `x` opens Explore Nepal.

## Home page (in order)
Hero with parallax photo → Discover Nepal → Today in Nepal (+ headline ticker) → Where should you go today? → From the Himalayas
to the Terai → Learn without limits → How fast can you type? → Today's weather → Explore Nepal map → What's happening? →
Sports live → Market pulse → Academic hub → Useful tools → Emergency help → Have a question? (WhatsApp) → closing CTA → footer.

## Nepal travel
- Destination data: `src/data/nepalPlaces.js` (province, zone, tags, best time, duration, tips, safety, nearby, photos).
  Wording is deliberately hedged ("usually", "roughly"); pages always point to official sources.
- Weather-based travel suggestions (`travelAdvice` in `weatherService.js`) use conservative wording and never call a place "safe".
- "Sunny" and "Cool weather" filters use today's live forecast; other filters use destination tags.
- The province map is a lightweight SVG schematic plotted from real coordinates. It deliberately draws **no national border**
  and is labelled "not an official map". Destination pages load an OpenStreetMap embed only when the visitor taps "Show map".

## Images
- Photos are Wikimedia Commons files (free licences / public domain). They're requested as resized thumbnails at Commons'
  standard widths (500/960/1280/1920 px) via `srcset`, lazy-loaded below the fold; the hero is preloaded with high priority.
- Author and licence are fetched from the Commons API, cached for 14 days, and shown in the lightbox and on `/image-credits`.
- **Own photos:** give a photo `{ src, webp?, avif?, alt, credit }` instead of `{ file, alt }` — AVIF/WebP sources are then served
  through `<picture>`. (Commons thumbnails are JPEG.)
- If an image fails, a mountain placeholder is shown instead of a broken image.

## WhatsApp
Floating button (bottom-right, expands to "Chat with us", hides while an inline WhatsApp section is on screen), a
"Have a question?" section on the home and destination pages, a card on Contact, and a footer link. All open
`https://wa.me/9779863903703` in a new tab with the message "Hello HimalayaHub, I need some help." The raw URL is never shown.
The icon is a generic chat bubble; swap in WhatsApp's official asset from their brand resources if you prefer.

## Motion & accessibility
Scroll reveals use IntersectionObserver and only hide content once JS confirms it can reveal it. With `prefers-reduced-motion`,
parallax, the ticker, caret and other continuous animations are off and everything is visible immediately. The lightbox supports
← → Esc, traps focus, and returns focus on close.

## Removed
Old home "console", feature grid and stat band (component code and their CSS), unused `components/ui/Card.jsx`, the unused
`LIVE_TODAY` export.

## Tested
All 44 existing and new routes render with correct titles and no page errors; light/dark; 375 px and 390 px phones (no
horizontal overflow); reduced motion; lightbox keyboard control; WhatsApp links; finder filters; province map; map embed.
Tested offline, so live APIs and Commons photos were blocked — fallbacks and demo data were used. Run `npm install && npm run dev`
to see real photos and data.

v2 notes are in git history.
