/*
  Warnings:

  - You are about to drop the column `workout_log_id` on the `Exercise_log` table. All the data in the column will be lost.
  - You are about to drop the `Workout_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exercise_log" DROP CONSTRAINT "Exercise_log_workout_log_id_fkey";

-- DropForeignKey
ALTER TABLE "Workout_log" DROP CONSTRAINT "Workout_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Workout_log" DROP CONSTRAINT "Workout_log_workout_id_fkey";

-- AlterTable
ALTER TABLE "Exercise_log" DROP COLUMN "workout_log_id";

-- DropTable
DROP TABLE "Workout_log";
