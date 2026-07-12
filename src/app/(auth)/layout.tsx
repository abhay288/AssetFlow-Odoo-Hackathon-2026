import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-8 bg-muted/40">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <Image src="/assets/assetflow-logo.png" alt="AssetFlow Logo" width={64} height={64} className="mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">AssetFlow</h1>
          <p className="text-sm text-muted-foreground mt-2">Enterprise Asset Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}
