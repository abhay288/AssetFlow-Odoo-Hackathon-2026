import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { hasRole, UserRole } from '@/lib/rbac'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublicRoute = path === '/'
  const isAuthRoute = path.startsWith('/auth')
  const isDashboardRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/organization') ||
    path.startsWith('/assets') ||
    path.startsWith('/allocation') ||
    path.startsWith('/bookings') ||
    path.startsWith('/maintenance') ||
    path.startsWith('/audit') ||
    path.startsWith('/reports') ||
    path.startsWith('/notifications') ||
    path.startsWith('/settings') ||
    path.startsWith('/profile')

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // RBAC checks for specific routes could be handled here if needed.
  // For this application shell phase, we primarily rely on RoleGate 
  // and hiding unauthorized links in the UI, but strict API protection 
  // can also be implemented here or in route handlers.

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
