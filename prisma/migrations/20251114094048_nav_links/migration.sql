-- CreateTable
CREATE TABLE "NavigationLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "brandId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NavigationLink_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "navOrder" INTEGER NOT NULL DEFAULT 0,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Brand" ("createdAt", "domain", "id", "name", "primaryColor", "secondaryColor", "slug", "updatedAt") SELECT "createdAt", "domain", "id", "name", "primaryColor", "secondaryColor", "slug", "updatedAt" FROM "Brand";
DROP TABLE "Brand";
ALTER TABLE "new_Brand" RENAME TO "Brand";
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE UNIQUE INDEX "Brand_domain_key" ON "Brand"("domain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
