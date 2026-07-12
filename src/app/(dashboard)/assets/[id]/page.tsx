import React from 'react'
import { AssetWorkspace } from '@/features/assets/components/asset-workspace'

export default async function AssetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  return (
    <div className="h-full">
      <AssetWorkspace assetId={resolvedParams.id} />
    </div>
  )
}
