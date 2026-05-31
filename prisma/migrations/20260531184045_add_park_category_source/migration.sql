-- CreateEnum
CREATE TYPE "ParkCategory" AS ENUM ('park', 'plaza', 'garden', 'nature_reserve', 'national_park', 'recreation_ground');

-- CreateEnum
CREATE TYPE "ParkSource" AS ENUM ('overpass', 'datario', 'icmbio', 'inea', 'manual');

-- AlterTable
ALTER TABLE "parks" ADD COLUMN     "category" "ParkCategory" NOT NULL DEFAULT 'park',
ADD COLUMN     "source" "ParkSource" NOT NULL DEFAULT 'manual';
