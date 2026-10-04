import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function toCSV(data: any[]): string {
  if (!data || data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') {
    return NextResponse.json({ error: 'Only managers can backup' }, { status: 403 })
  }

  // সব data fetch
  const [profiles, meals, expenses, deposits, menus] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('meals').select('*').order('date', { ascending: false }),
    supabase.from('expenses').select('*').order('date', { ascending: false }),
    supabase.from('deposits').select('*').order('date', { ascending: false }),
    supabase.from('menus').select('*').order('date', { ascending: false }),
  ])

  const timestamp = new Date().toISOString().split('T')[0]

  const backup = {
    exported_at: new Date().toISOString(),
    profiles: profiles.data,
    meals: meals.data,
    expenses: expenses.data,
    deposits: deposits.data,
    menus: menus.data,
  }

  return NextResponse.json(backup, {
    headers: {
      'Content-Disposition': `attachment; filename="mess-backup-${timestamp}.json"`,
    },
  })
}