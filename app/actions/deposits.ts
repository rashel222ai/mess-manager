'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDeposit(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can add deposits' }
  }

  const userId = formData.get('user_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const date = formData.get('date') as string
  const note = formData.get('note') as string

  if (!userId || !amount || amount <= 0) {
    return { error: 'সব ফিল্ড পূরণ করুন' }
  }

  const { error } = await supabase
    .from('deposits')
    .insert({
      user_id: userId,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      note: note || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/deposits')
  return { success: true }
}

export async function deleteDeposit(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can delete' }
  }

  const { error } = await supabase
    .from('deposits')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/deposits')
  return { success: true }
}
