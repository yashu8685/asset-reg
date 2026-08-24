import {
  date,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

export const assetCategoryEnum = pgEnum('asset_category', [
  'LAPTOP',
  'MONITOR',
  'PHONE',
  'ACCESSORY',
])

export const assetStatusEnum = pgEnum('asset_status', [
  'IN_STOCK',
  'ASSIGNED',
  'IN_REPAIR',
  'RETIRED',
])

export const assets = pgTable('assets', {
  id: varchar('id', { length: 21 }).primaryKey(),

  assetTag: varchar('asset_tag', { length: 20 }).notNull().unique(),

  name: varchar('name', { length: 120 }).notNull(),

  category: assetCategoryEnum('category').notNull(),

  status: assetStatusEnum('status')
    .notNull()
    .default('IN_STOCK'),

  assignedTo: varchar('assigned_to', { length: 120 }),

  purchaseDate: date('purchase_date').notNull(),

  purchaseCost: numeric('purchase_cost', {
    precision: 10,
    scale: 2,
  }).notNull(),

  notes: text('notes'),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})
