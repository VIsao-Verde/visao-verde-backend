-- Enable PostGIS (idempotent — already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- AlterTable
ALTER TABLE "parks" ADD COLUMN "location" geography(Point, 4326);

-- Spatial index for ST_DWithin / ST_Distance queries
CREATE INDEX parks_location_idx
  ON "parks"
  USING GIST ("location");

-- Composite index for lat/lon (Prisma-native queries)
CREATE INDEX "parks_latitude_longitude_idx"
  ON "parks" ("latitude", "longitude");

-- Auto-populate location from lat/lon on any insert or update
CREATE OR REPLACE FUNCTION update_park_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location =
    ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parks_location_trigger
  BEFORE INSERT OR UPDATE
  ON "parks"
  FOR EACH ROW
  EXECUTE FUNCTION update_park_location();

-- Backfill existing rows
UPDATE "parks"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography;
