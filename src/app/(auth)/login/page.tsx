'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Key, ShieldAlert } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const DEMO_ACCOUNTS = [
  { role: '👑 Admin', email: 'admin@assetflow.com', pass: 'Admin@123', desc: 'Full ERP controls' },
  { role: '📦 Manager', email: 'manager@assetflow.com', pass: 'Manager@123', desc: 'Asset & maintenance operations' },
  { role: '🏢 Dept Head', email: 'depthead@assetflow.com', pass: 'Dept@123', desc: 'Dept assets & bookings' },
  { role: '👤 Employee', email: 'employee@assetflow.com', pass: 'Employee@123', desc: 'My assets & check-ins' }
]

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success('Logged in successfully')
    router.push('/dashboard')
    router.refresh()
  }

  async function handleQuickLogin(email: string, pass: string) {
    setIsLoading(true)
    setValue('email', email)
    setValue('password', pass)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    toast.success(`Logged in as ${email}`)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg z-10 flex flex-col gap-4"
      >
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center mb-2">
              <Image src="/assets/assetflow-logo.png" alt="AssetFlow" width={48} height={48} className="rounded-xl shadow-md" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">Enter credentials or select a role below to access the ERP</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500 rounded-xl' : 'rounded-xl'}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400" htmlFor="password">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 rounded-xl' : 'rounded-xl'}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Quick Demo Access</span>
              <div className="grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickLogin(acc.email, acc.pass)}
                  className="flex flex-col items-start p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-900 transition-all text-left cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{acc.role}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">{acc.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800/60 pt-4 pb-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
