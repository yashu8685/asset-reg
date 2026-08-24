import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createAssetFn } from '../../server/assets.fns'

export const Route = createFileRoute('/assets/new')({
  component: NewAssetPage,
})

function NewAssetPage() {
  const navigate = useNavigate()

  const [assetTag, setAssetTag] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('IN_STOCK')
  const [assignedTo, setAssignedTo] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await createAssetFn({
        data: {
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
          assignedTo: status === 'ASSIGNED' ? assignedTo : null,
          purchaseDate,
          purchaseCost,
          notes: notes || null,
        },
      })

      setSuccess('Asset created successfully!')

      setTimeout(() => {
        navigate({ 
            to: '/',
            search:{
                q:'',
                status:undefined,
                sort:'newest',
            },
         })
      }, 1000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create asset',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Asset</h1>

        <p className="mt-2 text-gray-600">
          Create a new asset and add it to your inventory.
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
        {/* Asset Tag */}
        <div>
          <label
            htmlFor="assetTag"
            className="mb-2 block text-sm font-medium"
          >
            Asset Tag *
          </label>

          <input
            id="assetTag"
            type="text"
            value={assetTag}
            onChange={(e) => setAssetTag(e.target.value)}
            maxLength={20}
            required
            placeholder="e.g. LAP-001"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Asset Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
          >
            Asset Name *
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            minLength={3}
            required
            placeholder="e.g. Dell Latitude 5420"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Category */}
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

        {/* Status */}
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

        {/* Assigned To */}
        <div>
          <label
            htmlFor="assignedTo"
            className="mb-2 block text-sm font-medium"
          >
            Assigned To {status === 'ASSIGNED' && '*'}
          </label>

          <input
            id="assignedTo"
            type="text"
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

        {/* Purchase Date */}
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

        {/* Purchase Cost */}
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
            placeholder="e.g. 55000.00"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Notes */}
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
            placeholder="Additional information about this asset"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate({ 
                to: '/',
            search:{
                q:'',
                status:undefined,
                sort:'newest',
            },
         })
        }
            disabled={isSubmitting}
            className="rounded-md border px-5 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>
    </main>
  )
}