import {
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  getAssetByIdFn,
  updateAssetFn,
} from '../../../server/assets.fns'

export const Route = createFileRoute('/assets/$id/edit')({
  component: EditAssetPage,
})

function EditAssetPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [assetTag, setAssetTag] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('IN_STOCK')
  const [assignedTo, setAssignedTo] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAsset() {
      setLoading(true)
      setError('')

      try {
        const asset = await getAssetByIdFn({
          data: { id },
        })

        if (!asset) {
          setError('Asset not found')
          return
        }

        if (!cancelled) {
          setAssetTag(asset.assetTag)
          setName(asset.name)
          setCategory(asset.category)
          setStatus(asset.status)
          setAssignedTo(asset.assignedTo ?? '')
          setPurchaseDate(String(asset.purchaseDate))
          setPurchaseCost(String(asset.purchaseCost))
          setNotes(asset.notes ?? '')
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load asset')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAsset()

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await updateAssetFn({
        data: {
          id,
          assetTag,
          name,
          category: category as
            | 'LAPTOP'
            | 'MONITOR'
            | 'PHONE'
            | 'ACCESSORY',
          status: status as
            | 'IN_STOCK'
            | 'ASSIGNED'
            | 'IN_REPAIR'
            | 'RETIRED',
          assignedTo:
            status === 'ASSIGNED' ? assignedTo : null,
          purchaseDate,
          purchaseCost,
          notes: notes || null,
        },
      })

      setSuccess('Asset updated successfully!')

      setTimeout(() => {
        navigate({
          to: '/',
          search: {
            q: '',
            status: undefined,
            sort: 'newest',
          },
        })
      }, 1000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update asset',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function goBack() {
    navigate({
      to: '/',
      search: {
        q: '',
        status: undefined,
        sort: 'newest',
      },
    })
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-slate-500">
          Loading asset...
        </p>
      </main>
    )
  }

  if (error && !assetTag) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={goBack}
          className="mt-4 rounded-md border px-4 py-2"
        >
          Back to Assets
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Edit Asset
        </h1>

        <p className="mt-2 text-slate-500">
          Update the details of this asset.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-md border border-green-300 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="assetTag"
            className="mb-2 block text-sm font-medium"
          >
            Asset Tag *
          </label>

          <input
            id="assetTag"
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            maxLength={20}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Asset Name *
          </label>

          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={120}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium"
          >
            Category *
          </label>

          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="">Select category</option>
            <option value="LAPTOP">Laptop</option>
            <option value="MONITOR">Monitor</option>
            <option value="PHONE">Phone</option>
            <option value="ACCESSORY">Accessory</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-medium"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)

              if (e.target.value !== 'ASSIGNED') {
                setAssignedTo('')
              }
            }}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="IN_STOCK">In Stock</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_REPAIR">In Repair</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="assignedTo"
            className="mb-2 block text-sm font-medium"
          >
            Assigned To {status === 'ASSIGNED' && '*'}
          </label>

          <input
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            maxLength={120}
            disabled={status !== 'ASSIGNED'}
            required={status === 'ASSIGNED'}
            placeholder={
              status === 'ASSIGNED'
                ? 'Enter holder name'
                : 'Only available for assigned assets'
            }
            className="w-full rounded-md border px-3 py-2 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="purchaseDate"
            className="mb-2 block text-sm font-medium"
          >
            Purchase Date *
          </label>

          <input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="purchaseCost"
            className="mb-2 block text-sm font-medium"
          >
            Purchase Cost *
          </label>

          <input
            id="purchaseCost"
            type="number"
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium"
          >
            Notes
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            className="rounded-md border px-5 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-5 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting
              ? 'Updating...'
              : 'Update Asset'}
          </button>
        </div>
      </form>
    </main>
  )
}