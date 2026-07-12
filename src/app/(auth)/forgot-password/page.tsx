'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotFormValues) {
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    setIsSent(true)
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-inner">
                <span className="text-white dark:text-zinc-900 font-bold text-xl">AF</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
            <CardDescription>
              {isSent 
                ? "We've sent you an email with a link to reset your password." 
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSent && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Back to{' '}
              <Link href="/login" className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
