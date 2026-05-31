-- AlterTable
ALTER TABLE "conquests" ADD COLUMN "key" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "conquests_key_key" ON "conquests"("key");

-- RemoveDefault
ALTER TABLE "conquests" ALTER COLUMN "key" DROP DEFAULT;
