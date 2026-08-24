   import { and, asc, desc, ilike, or, eq,sql } from 'drizzle-orm'
import { db } from '../db'
import { assets } from '../db/schema'
// import { eq } from 'drizzle-orm'

type AssetStatus =
  | 'IN_STOCK'
  | 'ASSIGNED'
  | 'IN_REPAIR'
  | 'RETIRED'

type AssetSort = 'newest' | 'cost_desc' | 'name_asc'

interface ListAssetsParams {
  q?: string
  status?: AssetStatus
  sort?: AssetSort
}

export async function listAssets({
  q,
  status,
  sort = 'newest',
}: ListAssetsParams = {}) {
  const conditions = []

  // Search happens in SQL
  if (q?.trim()) {
    const search = `%${q.trim()}%`

    conditions.push(
      or(
        ilike(assets.name, search),
        ilike(assets.assetTag, search),
        ilike(assets.assignedTo, search),
      ),
    )
  }


 
  // Status filtering happens in SQL
  if (status) {
    conditions.push(eq(assets.status, status))
  }

  // Sorting happens in SQL
  let orderBy

  switch (sort) {
    case 'cost_desc':
      orderBy = desc(assets.purchaseCost)
      break

    case 'name_asc':
      orderBy = asc(assets.name)
      break

    case 'newest':
    default:
      orderBy = desc(assets.createdAt)
      break
  }

  return db
    .select()
    .from(assets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderBy)
}  



export async function getAssetById(id: string) {
  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1)

  return result[0] ?? null
}


export async function createAsset(data: {
  id: string
  assetTag: string
  name: string
  category: 'LAPTOP' | 'MONITOR' | 'PHONE' | 'ACCESSORY'
  status?: 'IN_STOCK' | 'ASSIGNED' | 'IN_REPAIR' | 'RETIRED'
  assignedTo?: string | null
  purchaseDate: string
  purchaseCost: string
  notes?: string | null
}) {
  return db
    .insert(assets)
    .values({
      id: data.id,
      assetTag: data.assetTag,
      name: data.name,
      category: data.category,
      status: data.status ?? 'IN_STOCK',
      assignedTo: data.assignedTo ?? null,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      notes: data.notes ?? null,
    })
    .returning()
}  




export async function updateAsset(
  id: string,
  data: {
    assetTag: string
    name: string
    category: 'LAPTOP' | 'MONITOR' | 'PHONE' | 'ACCESSORY'
    status: 'IN_STOCK' | 'ASSIGNED' | 'IN_REPAIR' | 'RETIRED'
    assignedTo?: string | null
    purchaseDate: string
    purchaseCost: string
    notes?: string | null
  },
) {
  return db
    .update(assets)
    .set({
      assetTag: data.assetTag,
      name: data.name,
      category: data.category,
      status: data.status,
      assignedTo: data.assignedTo ?? null,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id))
    .returning()
}  



     export async function assignAsset(id: string, assignedTo: string) {
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, id),
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  if (asset.status === 'RETIRED') {
    throw new Error('Retired assets cannot be assigned')
  }

  const holder = assignedTo.trim()

  if (!holder) {
    throw new Error('Holder name is required')
  }

  return db
    .update(assets)
    .set({
      status: 'ASSIGNED',
      assignedTo: holder,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id))
    .returning()
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          


export async function returnAsset(id: string) {
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, id),
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  if (asset.status === 'RETIRED') {
    throw new Error('Retired assets cannot be returned')
  }

  return db
    .update(assets)
    .set({
      status: 'IN_STOCK',
      assignedTo: null,
      updatedAt: new Date(),
    })
    .where(eq(assets.id, id))
    .returning()
}   



export async function deleteAsset(id: string) {
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, id),
  })

  if (!asset) {
    throw new Error('Asset not found')
  }

  if (asset.status === 'ASSIGNED') {
    throw new Error(
      `Cannot delete asset ${asset.assetTag} because it is assigned to ${asset.assignedTo ?? 'a holder'}`,
    )
  }

  if (asset.status !== 'IN_STOCK' && asset.status !== 'RETIRED') {
    throw new Error(
      `Asset ${asset.assetTag} can only be deleted when it is in stock or retired`,
    )
  }

  return db
    .delete(assets)
    .where(eq(assets.id, id))
    .returning()
}  

export async function getAssetStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      inStock: sql<number>`
        count(*) filter (where ${assets.status} = 'IN_STOCK')
      `,
      assigned: sql<number>`
        count(*) filter (where ${assets.status} = 'ASSIGNED')
      `,
      inRepair: sql<number>`
        count(*) filter (where ${assets.status} = 'IN_REPAIR')
      `,
      retired: sql<number>`
        count(*) filter (where ${assets.status} = 'RETIRED')
      `,
      totalValue: sql<string>`
        coalesce(sum(${assets.purchaseCost}), 0)
      `,
    })
    .from(assets)

  return result[0]
}




// export async function getAssetStats() {
//   const result = await db
//     .select({
//       total: sql<number>`count(*)`,
//       inStock: sql<number>`
//         count(*) filter (where ${assets.status} = 'IN_STOCK')
//       `,
//       assigned: sql<number>`
//         count(*) filter (where ${assets.status} = 'ASSIGNED')
//       `,
//       inRepair: sql<number>`
//         count(*) filter (where ${assets.status} = 'IN_REPAIR')
//       `,
//       retired: sql<number>`
//         count(*) filter (where ${assets.status} = 'RETIRED')
//       `,
//       totalValue: sql<string>`
//         coalesce(sum(${assets.purchaseCost}), 0)
//       `,
//     })
//     .from(assets)

//   return result[0]
// }
                                                                                                                                                                                                                                                                                                         