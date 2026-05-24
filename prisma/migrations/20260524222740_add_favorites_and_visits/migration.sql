-- DropIndex
DROP INDEX "parks_location_idx";

-- CreateTable
CREATE TABLE "conquests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "conquests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_conquests" (
    "userId" TEXT NOT NULL,
    "conquestId" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_conquests_pkey" PRIMARY KEY ("userId","conquestId")
);

-- CreateTable
CREATE TABLE "user_favorite_parks" (
    "userId" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    "favorited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_parks_pkey" PRIMARY KEY ("userId","parkId")
);

-- CreateTable
CREATE TABLE "user_visited_parks" (
    "userId" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_visited_parks_pkey" PRIMARY KEY ("userId","parkId")
);

-- AddForeignKey
ALTER TABLE "user_conquests" ADD CONSTRAINT "user_conquests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_conquests" ADD CONSTRAINT "user_conquests_conquestId_fkey" FOREIGN KEY ("conquestId") REFERENCES "conquests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_parks" ADD CONSTRAINT "user_favorite_parks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_parks" ADD CONSTRAINT "user_favorite_parks_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_visited_parks" ADD CONSTRAINT "user_visited_parks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_visited_parks" ADD CONSTRAINT "user_visited_parks_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
