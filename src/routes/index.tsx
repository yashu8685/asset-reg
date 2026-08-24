import { createFileRoute,Link, useNavigate  } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { listAssetsFn,assignAssetFn,returnAssetFn,deleteAssetFn } from '../server/assets.fns'

type Status = 'IN_STOCK' | 'ASSIGNED' | 'IN_REPAIR' | 'RETIRED'
type Sort = 'newest' | 'cost_desc' | 'name_asc'

const statusLabels: Record<Status, string> = {
  IN_STOCK: 'In Stock',
  ASSIGNED: 'Assigned',
  IN_REPAIR: 'In Repair',
  RETIRED: 'Retired',
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : '',
    status:
      search.status === 'IN_STOCK' ||
      search.status === 'ASSIGNED' ||
      search.status === 'IN_REPAIR' ||
      search.status === 'RETIRED'
        ? (search.status as Status)
        : undefined,
    sort:
      search.sort === 'cost_desc' ||
      search.sort === 'name_asc' ||
      search.sort === 'newest'
        ? (search.sort as Sort)
        : 'newest',
  }),

  component: RegisterPage,
})

function RegisterPage() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate({ from: '/' })

  const [assets, setAssets] = useState<
    Awaited<ReturnType<typeof listAssetsFn>> | null
  >(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

const [assigningAssetId, setAssigningAssetId] = useState<string | null>(
  null,
)

const [holderName, setHolderName] = useState('')
const [actionError, setActionError] = useState('')
const [actionLoading, setActionLoading] = useState(false)


const [deletingAssetId, setDeletingAssetId] = useState<string | null>(
  null,
)

async function reloadAssets() {
  setLoading(true)
  setError('')

  try {
    const result = await listAssetsFn({
      data: {
        q: searchParams.q || undefined,
        status: searchParams.status,
        sort: searchParams.sort,
      },
    })

    setAssets(result)
  } catch {
    setError('Unable to load assets. Please try again.')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  reloadAssets()
}, [
  searchParams.q,
  searchParams.status,
  searchParams.sort,
])


async function handleAssign(assetId: string) {
  if (!holderName.trim()) {
    setActionError('Holder name is required')
    return
  }

  setActionLoading(true)
  setActionError('')

  try {
    await assignAssetFn({
      data: {
        id: assetId,
        assignedTo: holderName,
      },
    })

    setAssigningAssetId(null)
    setHolderName('')

    await reloadAssets()
  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : 'Unable to assign asset',
    )
  } finally {
    setActionLoading(false)
  }
}


async function handleReturn(assetId: string) {
  setActionLoading(true)
  setActionError('')

  try {
    await returnAssetFn({
      data: {
        id: assetId,
      },
    })

    await reloadAssets()
  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : 'Unable to return asset',
    )
  } finally {
    setActionLoading(false)
  }
}

async function handleDelete(assetId: string) {
  setActionLoading(true)
  setActionError('')

  try {
    await deleteAssetFn({
      data: {
        id: assetId,
      },
    })

    setDeletingAssetId(null)

    await reloadAssets()
  } catch (error) {
    setActionError(
      error instanceof Error
        ? error.message
        : 'Unable to delete asset',
    )
  } finally {
    setActionLoading(false)
  }
}

 function updateSearch(
  changes: Partial<{
    q: string
    status: Status | undefined
    sort: Sort
  }>,
) {
  navigate({
    search: {
      q: changes.q !== undefined ? changes.q : searchParams.q,
      status:
        'status' in changes
          ? changes.status
          : searchParams.status,
      sort: changes.sort !== undefined ? changes.sort : searchParams.sort,
    },
  })
}

  function formatMoney(value: string | number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value))
  }

  function formatDate(value: string | Date) {
    return new Intl.DateTimeFormat('en-IN').format(new Date(value))
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Orotron
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Asset Register
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage laptops, monitors, phones and accessories.
            </p>
          </div>

          {/* Temporary button.
              We will turn this into a Link after creating /assets/new. */}
          <Link
  to="/assets/new"
  className="inline-flex w-fit rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
>
  + Add Asset
</Link>
        </header>

        <StatsStrip />

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
            <input
              value={searchParams.q}
              onChange={(event) => {
                updateSearch({
                  q: event.target.value,
                })
              }}
              placeholder="Search name, tag or holder..."
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />

            <select
              value={searchParams.status ?? ''}
              onChange={(event) => {
                const value = event.target.value

                updateSearch({
                  status:
                    value === ''
                      ? undefined
                      : (value as Status),
                })
              }}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="">All statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_REPAIR">In Repair</option>
              <option value="RETIRED">Retired</option>
            </select>

            <select
              value={searchParams.sort}
              onChange={(event) => {
                updateSearch({
                  sort: event.target.value as Sort,
                })
              }}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="cost_desc">Highest cost</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading assets...
            </div>
          )}

          {!loading && error && (
            <div className="p-10 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && assets?.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-semibold">No assets found</p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {!loading && !error && assets && assets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tag</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Holder</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Cost
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Purchase Date
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className={
                        asset.status === 'RETIRED'
                          ? 'bg-slate-50 text-slate-400'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {asset.assetTag}
                      </td>

                      <td className="px-4 py-3">
                        {asset.name}
                      </td>

                      <td className="px-4 py-3">
                        {asset.category}
                      </td>

                      <td className="px-4 py-3">
                        <StatusPill status={asset.status} />
                      </td>

                      <td className="px-4 py-3">
                        {asset.assignedTo ?? '—'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        {formatMoney(asset.purchaseCost)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDate(asset.purchaseDate)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          {/* Temporary buttons until their routes/actions are created */}
                          <Link
                               to="/assets/$id/edit"
                             params={{ id: asset.id }}
                            className="text-sm font-medium text-blue-600 hover:underline"
                            >
                            Edit
                           </Link>

                          {asset.status === 'ASSIGNED' ? (
  <button
    type="button"
    disabled={actionLoading}
    onClick={() => handleReturn(asset.id)}
    className="text-sm font-medium text-slate-600 hover:underline disabled:opacity-50"
  >
    Return
  </button>
) : asset.status === 'IN_STOCK' ? (
  <button
    type="button"
    onClick={() => {
      setAssigningAssetId(asset.id)
      setHolderName('')
      setActionError('')
    }}
    className="text-sm font-medium text-slate-600 hover:underline"
  >
    Assign
  </button>
) : null}

                         {asset.status !== 'ASSIGNED' &&
  asset.status !== 'IN_REPAIR' && (
    <button
      type="button"
      onClick={() => {
        setDeletingAssetId(asset.id)
        setActionError('')
      }}
      className="text-sm font-medium text-red-600 hover:underline"
    >
      Delete
    </button>
  )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {assigningAssetId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold">
        Assign Asset
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Enter the name of the person receiving this asset.
      </p>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor="holderName"
          className="mb-2 block text-sm font-medium"
        >
          Holder Name
        </label>

        <input
          id="holderName"
          value={holderName}
          onChange={(event) =>
            setHolderName(event.target.value)
          }
          placeholder="Enter employee name"
          maxLength={120}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-500"
          autoFocus
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setAssigningAssetId(null)
            setHolderName('')
            setActionError('')
          }}
          disabled={actionLoading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() =>
            handleAssign(assigningAssetId)
          }
          disabled={actionLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {actionLoading ? 'Assigning...' : 'Assign Asset'}
        </button>
      </div>
    </div>
  </div>
)}

{deletingAssetId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold">
        Delete Asset
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Are you sure you want to delete this asset?
        This action cannot be undone.
      </p>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={actionLoading}
          onClick={() => {
            setDeletingAssetId(null)
            setActionError('')
          }}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={actionLoading}
          onClick={() =>
            handleDelete(deletingAssetId)
          }
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {actionLoading ? 'Deleting...' : 'Delete Asset'}
        </button>
      </div>
    </div>
  </div>
)}
    </main>
    
  )
  
}


function StatusPill({ status }: { status: Status }) {
  const classes: Record<Status, string> = {
    IN_STOCK: 'bg-emerald-100 text-emerald-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_REPAIR: 'bg-amber-100 text-amber-700',
    RETIRED: 'bg-slate-200 text-slate-500',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

function StatsStrip() {
  const [stats, setStats] = useState<{
    total: number
    inStock: number
    assigned: number
    inRepair: number
    retired: number
    totalValue: number
  } | null>(null)

  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/assets/stats')

        if (!response.ok) {
          throw new Error('Stats request failed')
        }

        const result: {
          success: boolean
          data?: {
            total: number
            inStock: number
            assigned: number
            inRepair: number
            retired: number
            totalValue: number
          }
        } = await response.json()

        if (result.success && result.data) {
          setStats(result.data)
        }
      } catch {
        setStatsError(true)
      }
    }

    loadStats()
  }, [])

  if (statsError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Unable to load asset statistics.
      </section>
    )
  }

  const cards = [
    ['Total', stats?.total ?? '—'],
    ['In Stock', stats?.inStock ?? '—'],
    ['Assigned', stats?.assigned ?? '—'],
    ['In Repair', stats?.inRepair ?? '—'],
    ['Retired', stats?.retired ?? '—'],
    [
      'Total Value',
      stats ? formatStatsMoney(stats.totalValue) : '—',
    ],
  ] as const

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(([label, value]) => (
        <article
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold tabular-nums">
            {value}
          </p>
        </article>
      ))}
    </section>
  )
}

function formatStatsMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}