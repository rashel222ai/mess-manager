'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMemberRole(userId: string, role: 'manager' | 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can change roles' }
  }

  if (user.id === userId) {
    return { error: 'নিজের role change করা যাবে না' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/members')
  return { success: true }
}

export async function toggleMemberActive(userId: string, active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can toggle active' }
  }

  if (user.id === userId) {
    return { error: 'নিজেকে deactivate করা যাবে না' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/members')
  return { success: true }
}