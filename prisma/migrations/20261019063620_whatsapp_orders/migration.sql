-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "checkoutMethod" TEXT NOT NULL,
    "branch" TEXT,
    "note" TEXT,
    "staffNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("address", "checkoutMethod", "createdAt", "customerName", "id", "phone", "status", "total", "updatedAt") SELECT "address", "checkoutMethod", "createdAt", "customerName", "id", "phone", "status", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Orders are completed on WhatsApp now: collapse the payment-era statuses
-- into New -> Contacted -> Completed / Cancelled.
UPDATE "Order" SET "status" = CASE "status"
    WHEN 'PAID' THEN 'COMPLETED'
    WHEN 'FULFILLED' THEN 'COMPLETED'
    WHEN 'CANCELLED' THEN 'CANCELLED'
    ELSE 'NEW'
END;

-- Orders placed before these columns existed carried the store and note as
-- extra lines in the address ("...\nStore: <name>\nNote: <text>"). Move them out.
UPDATE "Order" SET "note" = substr("address", instr("address", char(10) || 'Note: ') + 7)
WHERE instr("address", char(10) || 'Note: ') > 0;

UPDATE "Order" SET "branch" = CASE
    WHEN instr(substr("address", instr("address", char(10) || 'Store: ') + 8), char(10)) > 0
    THEN substr(substr("address", instr("address", char(10) || 'Store: ') + 8), 1,
                instr(substr("address", instr("address", char(10) || 'Store: ') + 8), char(10)) - 1)
    ELSE substr("address", instr("address", char(10) || 'Store: ') + 8)
END
WHERE instr("address", char(10) || 'Store: ') > 0;

UPDATE "Order" SET "branch" = CASE "branch"
    WHEN 'Pal' THEN 'pal'
    WHEN 'Vesu' THEN 'vesu'
    WHEN 'Udhna' THEN 'udhna'
    WHEN 'Ring Road (Branch 1)' THEN 'ring-road-1'
    WHEN 'Ring Road (Branch 2)' THEN 'ring-road-2'
    WHEN 'Limbayat' THEN 'limbayat'
    WHEN 'Mahaprabhu Nagar' THEN 'mahaprabhu-nagar'
    WHEN 'Godadara' THEN 'godadara'
    WHEN 'Pandol, Ved Road' THEN 'pandol-ved-road'
    ELSE NULL
END
WHERE "branch" IS NOT NULL;

UPDATE "Order" SET "address" = substr("address", 1, instr("address", char(10) || 'Store: ') - 1)
WHERE instr("address", char(10) || 'Store: ') > 0;
