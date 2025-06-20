import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Mock email confirmation - no backend integration
  console.log('Mock email confirmation')
  
  // Simply redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
} 