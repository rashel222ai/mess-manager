'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Manager check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can add expenses' }
  }

  const date = formData.get('date') as string
  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const description = formData.get('description') as string

  if (!date || !amount || amount <= 0 || !category) {
    return { error: 'সব ফিল্ড পূরণ করুন' }
  }

  const { error } = await supabase
    .from('expenses')
    .insert({
      date,
      amount,
      category,
      description: description || null,
      added_by: user.id,
    })

  if (error) return { error: error.message }

  revalidatePath('/expenses')
  return { success: true }
}

export async function deleteExpense(id: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can delete expenses' }
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/expenses')
  return { success: true }
}