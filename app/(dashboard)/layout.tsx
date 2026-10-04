import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            🏠 Mess Manager
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm hidden sm:block">
              <div className="font-semibold text-gray-800">{profile?.name}</div>
              <div className="text-gray-500 text-xs">
                {isManager ? '👑 Manager' : '👤 Member'}
                {profile?.room_no && ` • Room ${profile.room_no}`}
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] hidden md:block">
          <nav className="p-4 space-y-1">
            <NavLink href="/dashboard" icon="📊" label="Dashboard" />
            <NavLink href="/meals" icon="🍽️" label="Meal" />
            <NavLink href="/expenses" icon="🛒" label="বাজার/খরচ" />
            <NavLink href="/deposits" icon="💰" label="Deposit" />
            <NavLink href="/menu" icon="📋" label="মেনু" />
            <NavLink href="/members" icon="👥" label="Members" />
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        <MobileNavLink href="/dashboard" icon="📊" label="Home" />
        <MobileNavLink href="/meals" icon="🍽️" label="Meal" />
        <MobileNavLink href="/expenses" icon="🛒" label="Bazar" />
        <MobileNavLink href="/deposits" icon="💰" label="Deposit" />
        <MobileNavLink href="/menu" icon="📋" label="Menu" />
      </nav>
      <div className="md:hidden h-16" />
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}

function MobileNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-gray-600 hover:text-blue-600 text-xs gap-1"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}