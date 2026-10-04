import { createClient } from '@/lib/supabase/server'
import { BackupButton } from '@/components/backup-button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const isManager = profile?.role === 'manager'
  const today = new Date().toISOString().split('T')[0]

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStart = startOfMonth.toISOString().split('T')[0]

  // Parallel fetch
  const [
    memberCountRes,
    todayMealsRes,
    monthExpensesRes,
    monthDepositsRes,
    myMealsRes,
    myDepositsRes,
    pendingRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('meals').select('breakfast, lunch, dinner').eq('date', today).eq('status', 'approved'),
    supabase.from('expenses').select('amount').gte('date', monthStart),
    supabase.from('deposits').select('amount').gte('date', monthStart),
    supabase.from('meals').select('breakfast, lunch, dinner').eq('user_id', user!.id).gte('date', monthStart),
    supabase.from('deposits').select('amount').eq('user_id', user!.id).gte('date', monthStart),
    supabase.from('meals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const memberCount = memberCountRes.count || 0
  const todayMeals = todayMealsRes.data?.reduce(
    (s, m) => s + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0), 0
  ) || 0
  const monthExpenses = monthExpensesRes.data?.reduce((s, e) => s + Number(e.amount), 0) || 0
  const monthDeposits = monthDepositsRes.data?.reduce((s, d) => s + Number(d.amount), 0) || 0

  const myMeals = myMealsRes.data?.reduce(
    (s, m) => s + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0), 0
  ) || 0
  const myDeposits = myDepositsRes.data?.reduce((s, d) => s + Number(d.amount), 0) || 0

  // Meal rate
  const { data: allMonthMeals } = await supabase
    .from('meals')
    .select('breakfast, lunch, dinner')
    .gte('date', monthStart)

  const totalMeals = allMonthMeals?.reduce(
    (s, m) => s + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0), 0
  ) || 0

  const mealRate = totalMeals > 0 ? monthExpenses / totalMeals : 0
  const myBill = myMeals * mealRate
  const myBalance = myDeposits - myBill

  const pendingCount = pendingRes.count || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            👋 স্বাগতম, {profile?.name}!
          </h1>
          <p className="text-gray-500 text-sm">
            {isManager ? '👑 Manager Dashboard' : '👤 Member Dashboard'}
          </p>
        </div>
        {isManager && <BackupButton />}
      </div>

      {/* Alert for Manager: pending meals */}
      {isManager && pendingCount > 0 && (
        <Link
          href="/meals"
          className="block bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100 transition"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-yellow-800">
              ⚠️ {pendingCount} টা meal approve করার অপেক্ষায়
            </div>
            <div className="text-yellow-700 text-sm">দেখুন →</div>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="👥" label="Total Members" value={memberCount} color="blue" />
        <StatCard icon="🍽️" label="আজকের মিল" value={todayMeals} color="green" />
        <StatCard
          icon="🛒"
          label="এই মাসের খরচ"
          value={`৳ ${monthExpenses.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`}
          color="orange"
        />
        <StatCard
          icon="💰"
          label="এই মাসের Deposit"
          value={`৳ ${monthDeposits.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}`}
          color="purple"
        />
      </div>

      {/* My Stats */}
      <div className={`rounded-xl p-5 ${myBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
        <h2 className="font-bold text-gray-800 mb-3">📊 আমার এই মাসের হিসাব</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-gray-600">মিল</div>
            <div className="text-xl font-bold text-gray-800">{myMeals}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Bill</div>
            <div className="text-xl font-bold text-gray-800">
              ৳{myBill.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Deposit</div>
            <div className="text-xl font-bold text-gray-800">
              ৳{myDeposits.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className={`text-xs ${myBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Balance
            </div>
            <div className={`text-xl font-bold ${myBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ৳{Math.abs(myBalance).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
            </div>
            <div className={`text-xs ${myBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {myBalance >= 0 ? '✅ Advance' : '⚠️ Due'}
            </div>
          </div>
        </div>
      </div>

      {/* Month Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-lg text-gray-800 mb-3">📈 মাসিক রেট</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">মোট মিল</div>
            <div className="font-bold text-gray-800">{totalMeals}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Meal Rate</div>
            <div className="font-bold text-gray-800">৳ {mealRate.toFixed(0)}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">মোট খরচ</div>
            <div className="font-bold text-gray-800">
              ৳ {monthExpenses.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-lg text-gray-800 mb-4">👤 আপনার প্রোফাইল</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <InfoRow label="নাম" value={profile?.name || '—'} />
          <InfoRow label="Email" value={profile?.email || '—'} />
          <InfoRow label="Phone" value={profile?.phone || '—'} />
          <InfoRow label="Room" value={profile?.room_no || '—'} />
          <InfoRow
            label="Role"
            value={isManager ? '👑 Manager' : '👤 Member'}
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: string; label: string; value: string | number;
  color: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}