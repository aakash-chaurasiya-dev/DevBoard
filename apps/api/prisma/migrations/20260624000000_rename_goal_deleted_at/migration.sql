-- Rename Goal soft-delete column to match schema and shared types
ALTER TABLE "Goal" RENAME COLUMN "deleteAt" TO "deletedAt";
