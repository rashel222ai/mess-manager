import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuForm } from '@/components/menu-form'
import { MenuList } from '@/components/menu-list'

export default async function MenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  const { data: menus } = await supabase
    .from('menus')
    .select('id, date, breakfast, lunch, dinner')
    .order('date', { ascending: false })
    .limit(15)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">📋 মেনু</h1>
        <p className="text-gray-500 text-sm">
          রান্নার শিডিউল
        </p>
      </div>

      {isManager && <MenuForm />}

      <MenuList menus={menus || []} isManager={isManager} />

      {!isManager && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ℹ️ মেনু সেট বা edit করতে পারবেন শুধু Manager
        </div>
      )}
    </div>
  )
}
