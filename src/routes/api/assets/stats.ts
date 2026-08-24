import { createFileRoute } from '@tanstack/react-router'
import { getAssetStats } from '../../../server/assets.queries'

export const Route = createFileRoute('/api/assets/stats')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stats = await getAssetStats()

          return Response.json({
            success: true,
            data: {
              total: Number(stats.total),
              inStock: Number(stats.inStock),
              assigned: Number(stats.assigned),
              inRepair: Number(stats.inRepair),
              retired: Number(stats.retired),
              totalValue: Number(stats.totalValue),
            },
            message: 'Stats fetched',
          })
        } catch {
          return Response.json(
            {
              success: false,
              data: null,
              message: 'Unable to fetch asset statistics',
            },
            { status: 500 },
          )
        }
      },
    },
  },
})