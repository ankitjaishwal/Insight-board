/*
  Warnings:

  - Added the required column `userId` to the `FilterPreset` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FilterPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "filters" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FilterPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
-- Legacy presets had no user ownership. They are dropped during migration.
DROP TABLE "FilterPreset";
ALTER TABLE "new_FilterPreset" RENAME TO "FilterPreset";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
