-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'CAREWORKER');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CAREWORKER',
    "auth0_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clock_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clock_in_latitude" DOUBLE PRECISION NOT NULL,
    "clock_in_longitude" DOUBLE PRECISION NOT NULL,
    "clock_in_note" TEXT,
    "clock_out_time" TIMESTAMP(3),
    "clock_out_latitude" DOUBLE PRECISION,
    "clock_out_longitude" DOUBLE PRECISION,
    "clock_out_note" TEXT,
    "duration_minutes" INTEGER,
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location_perimeters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "center_latitude" DOUBLE PRECISION NOT NULL,
    "center_longitude" DOUBLE PRECISION NOT NULL,
    "radius_km" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_perimeters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth0_id_key" ON "users"("auth0_id");

-- AddForeignKey
ALTER TABLE "shift_records" ADD CONSTRAINT "shift_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_perimeters" ADD CONSTRAINT "location_perimeters_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
