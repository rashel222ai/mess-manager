'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMenu(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return { error: 'Only managers can set menu' }
  }

  const date = formData.get('date') as string
  const breakfast = formData.get('breakfast') as string
  const lunch = formData.get('lunch') as string
  const dinner = formData.get('dinner') as string

  if (!date) return { error: 'তারিখ দিন' }

  // Upsert (insert or update)
  const { error } = await supabase
    .from('menus')
    .upsert(
      {
        date,
        breakfast: breakfast || null,
        lunch: lunch || null,
        dinner: dinner || null,
        created_by: user.id,
      },
      { onConflict: 'date' }
    )

  if (error) return { error: error.message }

  revalidatePath('/menu')
  return { success: true }
}

export async function deleteMenu(id: number) {
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

  const { error } = await supabase.from('menus').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/menu')
  return { success: true }
}