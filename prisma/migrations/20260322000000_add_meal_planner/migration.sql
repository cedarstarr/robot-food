-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_slots" (
    "id" TEXT NOT NULL,
    "meal_plan_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "meal_type" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,

    CONSTRAINT "meal_plan_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_plans_user_id_idx" ON "meal_plans"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plans_user_id_week_start_key" ON "meal_plans"("user_id", "week_start");

-- CreateIndex
CREATE INDEX "meal_plan_slots_meal_plan_id_idx" ON "meal_plan_slots"("meal_plan_id");

-- CreateIndex
CREATE INDEX "meal_plan_slots_recipe_id_idx" ON "meal_plan_slots"("recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_slots_meal_plan_id_day_of_week_meal_type_key" ON "meal_plan_slots"("meal_plan_id", "day_of_week", "meal_type");

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_slots" ADD CONSTRAINT "meal_plan_slots_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_slots" ADD CONSTRAINT "meal_plan_slots_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

