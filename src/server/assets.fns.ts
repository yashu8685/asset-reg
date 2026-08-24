import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import {
  assignAsset,
  createAsset,
  deleteAsset,
  getAssetById,
  listAssets,
  returnAsset,
  updateAsset,
} from './assets.queries'

const categorySchema = z.enum([
  'LAPTOP',
  'MONITOR',
  'PHONE',
  'ACCESSORY',
])

const statusSchema = z.enum([
  'IN_STOCK',
  'ASSIGNED',
  'IN_REPAIR',
  'RETIRED',
])

const assetFormSchema = z
  .object({
    assetTag: z
      .string()
      .trim()
      .min(1, 'Asset tag is required')
      .max(20, 'Asset tag must be 20 characters or fewer'),

    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(120, 'Name must be 120 characters or fewer'),

    category: categorySchema,

    status: statusSchema.default('IN_STOCK'),

    assignedTo: z
      .string()
      .trim()
      .max(120, 'Holder name must be 120 characters or fewer')
      .nullable()
      .optional(),

    purchaseDate: z.string().refine(
      (value) => {
        const selectedDate = new Date(`${value}T00:00:00`)
        const today = new Date()

        today.setHours(0, 0, 0, 0)

        return selectedDate <= today
      },
      {
        message: 'Purchase date cannot be in the future',
      },
    ),

    purchaseCost: z
      .string()
      .trim()
      .refine(
        (value) => {
          const amount = Number(value)
          return Number.isFinite(amount) && amount > 0
        },
        {
          message: 'Purchase cost must be greater than 0',
        },
      ),

    notes: z
      .string()
      .max(500, 'Notes must be 500 characters or fewer')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'ASSIGNED' && !data.assignedTo?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['assignedTo'],
        message: 'Holder name is required for an assigned asset',
      })
    }

    if (data.status !== 'ASSIGNED' && data.assignedTo?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['assignedTo'],
        message: 'Holder can only be set for an assigned asset',
      })
    }
  })

const listAssetsSchema = z.object({
  q: z.string().optional(),
  status: statusSchema.optional(),
  sort: z
    .enum(['newest', 'cost_desc', 'name_asc'])
    .default('newest'),
})

const idSchema = z.object({
  id: z.string().min(1, 'Asset ID is required'),
})

const assignSchema = z.object({
  id: z.string().min(1, 'Asset ID is required'),
  assignedTo: z
    .string()
    .trim()
    .min(1, 'Holder name is required')
    .max(120, 'Holder name must be 120 characters or fewer'),
})

export const listAssetsFn = createServerFn({ method: 'GET' })
  .validator(listAssetsSchema)
  .handler(async ({ data }) => {
    return listAssets(data)
  })

  export const getAssetByIdFn = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    return getAssetById(data.id)
  })

export const createAssetFn = createServerFn({ method: 'POST' })
  .validator(assetFormSchema)
  .handler(async ({ data }) => {
    try {
      return await createAsset({
        id: nanoid(),
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        status: data.status,
        assignedTo: data.assignedTo?.trim() || null,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        notes: data.notes?.trim() || null,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('unique')
      ) {
        throw new Error(
          `Asset tag ${data.assetTag} is already in use`,
        )
      }

      throw new Error('Unable to create asset')
    }
  })

export const updateAssetFn = createServerFn({ method: 'POST' })
  .validator(
    idSchema.and(assetFormSchema),
  )
  .handler(async ({ data }) => {
    try {
      const asset = await getAssetById(data.id)

      if (!asset) {
        throw new Error('Asset not found')
      }

      if (asset.status === 'RETIRED') {
        throw new Error('Retired assets cannot be edited')
      }

      return await updateAsset(data.id, {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        status: data.status,
        assignedTo: data.assignedTo?.trim() || null,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        notes: data.notes?.trim() || null,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('unique')) {
          throw new Error(
            `Asset tag ${data.assetTag} is already in use`,
          )
        }

        throw new Error(error.message)
      }

      throw new Error('Unable to update asset')
    }
  })

export const assignAssetFn = createServerFn({ method: 'POST' })
  .validator(assignSchema)
  .handler(async ({ data }) => {
    try {
      return await assignAsset(data.id, data.assignedTo)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw new Error('Unable to assign asset')
    }
  })

export const returnAssetFn = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    try {
      return await returnAsset(data.id)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw new Error('Unable to return asset')
    }
  })

export const deleteAssetFn = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    try {
      return await deleteAsset(data.id)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      throw new Error('Unable to delete asset')
    }
  })