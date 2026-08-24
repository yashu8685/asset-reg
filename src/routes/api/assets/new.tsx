import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/assets/new')({
  component: NewAsset,
})

function NewAsset() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Add New Asset
      </h1>

      <p className="mt-3">
        Create a new asset and add it to your inventory.
      </p>
    </main>
  )
}