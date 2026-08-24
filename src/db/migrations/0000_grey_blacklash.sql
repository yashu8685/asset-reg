CREATE TYPE "public"."asset_category" AS ENUM('LAPTOP', 'MONITOR', 'PHONE', 'ACCESSORY');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('IN_STOCK', 'ASSIGNED', 'IN_REPAIR', 'RETIRED');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"asset_tag" varchar(20) NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" "asset_category" NOT NULL,
	"status" "asset_status" DEFAULT 'IN_STOCK' NOT NULL,
	"assigned_to" varchar(120),
	"purchase_date" date NOT NULL,
	"purchase_cost" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_asset_tag_unique" UNIQUE("asset_tag")
);
