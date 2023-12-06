/*
  Warnings:

  - You are about to drop the column `type` on the `Entry` table. All the data in the column will be lost.
  - Added the required column `category` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "text" TEXT NOT NULL
);
INSERT INTO "new_Entry" ("date", "id", "text") SELECT "date", "id", "text" FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
