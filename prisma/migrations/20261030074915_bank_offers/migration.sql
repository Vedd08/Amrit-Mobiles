-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "logoUrl" TEXT,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "brands" TEXT NOT NULL DEFAULT '',
    "minPrice" INTEGER,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Offer_isActive_idx" ON "Offer"("isActive");
