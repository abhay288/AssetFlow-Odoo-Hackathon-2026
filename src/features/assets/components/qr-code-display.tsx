'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'

interface QRCodeDisplayProps {
  tagNumber: string
  assetName: string
}

export function QRCodeDisplay({ tagNumber, assetName }: QRCodeDisplayProps) {
  // In a real app, this would be the actual public URL to the asset details page
  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/assets/${tagNumber}` : `https://assetflow.app/assets/${tagNumber}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 mb-6 print:shadow-none print:border-none">
        <QRCodeSVG 
          value={qrUrl} 
          size={200}
          level="H"
          includeMargin={true}
          fgColor="#09090b"
          bgColor="#ffffff"
        />
      </div>
      
      <div className="text-center mb-8">
        <h3 className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-wider">{tagNumber}</h3>
        <p className="text-sm text-zinc-500">{assetName}</p>
      </div>

      <div className="flex gap-3 print:hidden">
        <Button variant="outline" onClick={handlePrint} className="w-full">
          <Printer className="w-4 h-4 mr-2" /> Print Label
        </Button>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Download className="w-4 h-4 mr-2" /> Save SVG
        </Button>
      </div>
    </div>
  )
}
