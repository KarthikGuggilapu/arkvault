import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProfileClient from './profile-client'

export default function ProfilePage() {
  return <ProfileClient />
}
