'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleMeal(
  date: string,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  value: 0 | 1
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if meal entry exists
  const { data: existing } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('meals')
      .update({
        [mealType]: value,
        status: 'pending',
      })
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    // Insert new
    const { error } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        date,
        [mealType]: value,
        status: 'pending',
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/meals')
  return { success: true }
}

export async function approveMeal(mealId: number, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can approve meals' }
  }

  const { error } = await supabase
    .from('meals')
    .update({ status })
    .eq('id', mealId)

  if (error) return { error: error.message }

  revalidatePath('/meals')
  return { success: true }
}
