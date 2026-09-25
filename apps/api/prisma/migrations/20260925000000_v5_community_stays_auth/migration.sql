-- HimalayaHub v5: remove gold prices; add community, stays, saved trips, refresh tokens,
-- traveller profile fields and structured destination guides.
-- Additive except for the gold removal. Safe to run on a database created by the init migration.

-- ── Gold removal ─────────────────────────────────────────────────────────────
DROP INDEX IF EXISTS "GoldPrice_metal_recordedAt_idx";
DROP TABLE IF EXISTS "GoldPrice";
-- AssetType GOLD/SILVER and LiveService GOLD no longer exist in the schema; remove rows that used them
-- so Prisma never reads an unknown enum value.
DELETE FROM "MarketSnapshot" WHERE "assetType" IN ('GOLD', 'SILVER');
DELETE FROM "ApiSetting" WHERE "service" = 'GOLD';

-- ── Profiles & destinations ─────────────────────────────────────────────────
ALTER TABLE "UserProfile" ADD COLUMN "travelInterests" JSONB;
ALTER TABLE "UserProfile" ADD COLUMN "travelerType" TEXT;

ALTER TABLE "Destination" ADD COLUMN "region" TEXT;
ALTER TABLE "Destination" ADD COLUMN "elevationM" INTEGER;
ALTER TABLE "Destination" ADD COLUMN "difficulty" TEXT;
ALTER TABLE "Destination" ADD COLUMN "distanceFromKtmKm" INTEGER;
ALTER TABLE "Destination" ADD COLUMN "isHiddenGem" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Destination" ADD COLUMN "hiddenGemRank" INTEGER;
ALTER TABLE "Destination" ADD COLUMN "guide" JSONB;
CREATE INDEX "Destination_status_isHiddenGem_hiddenGemRank_idx" ON "Destination"("status", "isHiddenGem", "hiddenGemRank");
CREATE INDEX "Destination_region_idx" ON "Destination"("region");

-- ── Refresh tokens (native clients) ─────────────────────────────────────────
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "rotatedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_familyId_idx" ON "RefreshToken"("familyId");

-- ── Stays ───────────────────────────────────────────────────────────────────
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "amenities" JSONB,
    "priceMinNpr" INTEGER,
    "priceMaxNpr" INTEGER,
    "googlePlaceId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verificationNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Stay_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Stay_slug_key" ON "Stay"("slug");
CREATE INDEX "Stay_destinationId_status_sortOrder_idx" ON "Stay"("destinationId", "status", "sortOrder");
CREATE INDEX "Stay_type_idx" ON "Stay"("type");

-- ── Saved trips ─────────────────────────────────────────────────────────────
CREATE TABLE "SavedTrip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startDate" DATETIME,
    "days" INTEGER,
    "destinations" JSONB NOT NULL,
    "itinerary" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedTrip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "SavedTrip_userId_updatedAt_idx" ON "SavedTrip"("userId", "updatedAt" DESC);

-- ── Community ───────────────────────────────────────────────────────────────
CREATE TABLE "Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "rules" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "hotRank" REAL NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "spamScore" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'VISIBLE',
    "removedReason" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CommunityPost_communityId_status_hotRank_idx" ON "CommunityPost"("communityId", "status", "hotRank" DESC);
CREATE INDEX "CommunityPost_communityId_status_createdAt_idx" ON "CommunityPost"("communityId", "status", "createdAt" DESC);
CREATE INDEX "CommunityPost_status_hotRank_idx" ON "CommunityPost"("status", "hotRank" DESC);
CREATE INDEX "CommunityPost_authorId_createdAt_idx" ON "CommunityPost"("authorId", "createdAt");

CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "spamScore" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'VISIBLE',
    "removedReason" TEXT,
    "editedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommunityComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CommunityComment_postId_createdAt_idx" ON "CommunityComment"("postId", "createdAt");
CREATE INDEX "CommunityComment_parentId_idx" ON "CommunityComment"("parentId");
CREATE INDEX "CommunityComment_authorId_createdAt_idx" ON "CommunityComment"("authorId", "createdAt");

CREATE TABLE "CommunityVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunityVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CommunityVote_userId_targetType_targetId_key" ON "CommunityVote"("userId", "targetType", "targetId");
CREATE INDEX "CommunityVote_targetType_targetId_idx" ON "CommunityVote"("targetType", "targetId");

CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolvedById" TEXT,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ContentReport_reporterId_targetType_targetId_key" ON "ContentReport"("reporterId", "targetType", "targetId");
CREATE INDEX "ContentReport_status_createdAt_idx" ON "ContentReport"("status", "createdAt");
CREATE INDEX "ContentReport_targetType_targetId_idx" ON "ContentReport"("targetType", "targetId");

CREATE TABLE "CommunityBan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "communityId" TEXT,
    "reason" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liftedAt" DATETIME,
    CONSTRAINT "CommunityBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityBan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CommunityBan_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CommunityBan_userId_liftedAt_idx" ON "CommunityBan"("userId", "liftedAt");
