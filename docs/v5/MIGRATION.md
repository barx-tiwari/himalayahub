# Upgrading from v4 to v5

## 1. Back up
```bash
npm run db:backup -w @himalayahub/api      # copy of the SQLite file into apps/api/backups/
```

## 2. Update the code and install
Replace the code with v5, keeping your own `.env` (never commit it). Then:
```bash
npm install
npm run build -w @himalayahub/shared        # the API imports the shared package's build
```

## 3. Add new environment variables
All are optional. Compare your `.env` with `.env.example`; see [ENV.md](ENV.md).
In production, set `COMMUNITY_ALIAS_SECRET` before the first community post (see ENV.md).

## 4. Apply the database migration
```bash
npm run db:deploy        # production: prisma migrate deploy
# or in development:
npm run db:migrate       # prisma migrate dev
```
Migration `20260925000000_v5_community_stays_auth`:

| Change | Detail |
|---|---|
| **Removed** | `GoldPrice` table; `MarketSnapshot` rows with `assetType` GOLD/SILVER; `ApiSetting` row for GOLD. **This deletes stored gold/silver history.** Take the backup above if you need it. |
| `UserProfile` | + `travelInterests` (JSON array), `travelerType` (`domestic` \| `international`) |
| `Destination` | + `region`, `elevationM`, `difficulty`, `distanceFromKtmKm`, `isHiddenGem`, `hiddenGemRank`, `guide` (JSON), with indexes |
| New tables | `RefreshToken`, `Stay`, `SavedTrip`, `Community`, `CommunityPost`, `CommunityComment`, `CommunityVote`, `ContentReport`, `CommunityBan` |
| Enums | `AssetType` loses GOLD/SILVER; `LiveService` loses GOLD; new `StayType`, `CommunityItemStatus`, `VoteTarget`, `ReportReason`, `ReportStatus` |

Everything else is additive. The migration was tested by applying `init` + `v5` to a fresh SQLite database.

**PostgreSQL:** the SQL file is SQLite-flavoured. If you have switched providers (docs/DATABASE.md), generate the equivalent with `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`.

## 5. Seed the new content
```bash
npm run seed:check -w @himalayahub/api     # dry run: validates the 10 Hidden Gems against the CMS schema
npm run db:seed
```
This adds the six communities and the ten Hidden Gems, without overwriting existing rows. With `SEED_UPDATE=true` it refreshes seeded rows from code, which **overwrites CMS edits** to those rows.

## 6. Regenerate the Prisma client and restart
```bash
npm run db:generate
npm run build && npm run start
```

## 7. Give moderators access
Moderation needs the `comments.moderate` permission (MODERATOR, ADMIN, SUPER_ADMIN). Until the Users screen ships, change a user's `role` in Prisma Studio: `npm run db:studio -w @himalayahub/api`.

## Behaviour changes to know about
- **Navigation:** new top-level "Community" item; the full menu now needs ≥1240px and collapses to the hamburger menu below that.
- **Password changes and resets** now also sign out mobile devices (refresh tokens are revoked).
- **CSRF:** requests with no `Origin`, no session cookie and a `Bearer` token (native apps) skip the origin check; browser requests are unchanged. The Apple callback is accepted only from `https://appleid.apple.com`.
- **CORS** now allows the `Authorization`, `X-Filename` and `X-Alt` headers.
