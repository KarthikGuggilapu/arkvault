import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simple pass-through middleware - no backend integration
  console.log('Supabase middleware - Path:', request.nextUrl.pathname)
  
  // Allow all requests to pass through
  return NextResponse.next()
} 