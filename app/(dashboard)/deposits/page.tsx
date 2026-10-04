import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DepositForm } from '@/components/deposit-form'
import { DepositList } from '@/components/deposit-list'

export default async function DepositsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  // সব active member
  const { data: members } = await supabase
    .from('profiles')
    .select('id, name, room_no')
    .eq('active', true)
    .order('name')

  // Deposits
  let depositsQuery = supabase
    .from('deposits')
    .select('id, amount, date, note, user_id')
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (!isManager) {
    depositsQuery = depositsQuery.eq('user_id', user.id)
  }

  const { data: deposits } = await depositsQuery

  // Profile lookup for names
  const memberMap = new Map((members || []).map((m) => [m.id, m]))
  const depositsWithProfiles = (deposits || []).map((d) => ({
    ...d,
    profiles: memberMap.get(d.user_id) || null,
  }))

  const total = depositsWithProfiles.reduce((sum, d) => sum + Number(d.amount), 0)

  // এই মাসের সব expenses
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStart = startOfMonth.toISOString().split('T')[0]

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', monthStart)

  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0

  // এই মাসের সব meals
  const { data: meals } = await supabase
    .from('meals')
    .select('breakfast, lunch, dinner, user_id')
    .gte('date', monthStart)

  const totalMeals = meals?.reduce(
    (sum, m) => sum + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0),
    0
  ) || 0

  const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0

  // নিজের balance
  const myMeals = meals?.filter((m) => m.user_id === user.id)
  const myMealCount = myMeals?.reduce(
    (sum, m) => sum + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0),
    0
  ) || 0

  const myBill = myMealCount * mealRate
  const myDeposits = depositsWithProfiles
    .filter((d) => d.user_id === user.id)
    .reduce((s, d) => s + Number(d.amount), 0)
  const myBalance = myDeposits - myBill

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">💰 Deposit / Balance</h1>
        <p className="text-gray-500 text-sm">
          ডিপোজিট ও বাকির হিসাব
        </p>
      </div>

      {/* My Balance Card */}
      <div className={`rounded-xl p-5 ${myBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className={`text-sm font-semibold ${myBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              আমার Balance
            </div>
            <div className={`text-3xl font-bold mt-1 ${myBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              ৳ {Math.abs(myBalance).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
            </div>
            <div className={`text-xs mt-1 ${myBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {myBalance >= 0 ? '✅ Advance পাবেন' : '⚠️ Due দিতে হবে'}
            </div>
          </div>

          <div className="text-right text-sm">
            <div className="text-gray-600">
              Deposit: <span className="font-semibold">৳ {myDeposits.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-gray-600">
              Bill: <span className="font-semibold">৳ {myBill.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="text-gray-600">
              মিল: <span className="font-semibold">{myMealCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-blue-600">মোট Deposit</div>
          <div className="text-lg font-bold text-blue-800 mt-1">
            ৳ {total.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-orange-600">মোট খরচ</div>
          <div className="text-lg font-bold text-orange-800 mt-1">
            ৳ {totalExpenses.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-purple-600">মোট মিল</div>
          <div className="text-lg font-bold text-purple-800 mt-1">{totalMeals}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-green-600">Meal Rate</div>
          <div className="text-lg font-bold text-green-800 mt-1">
            ৳ {mealRate.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Manager Form */}
      {isManager && <DepositForm members={members || []} />}

      {/* Deposit List */}
      <DepositList deposits={depositsWithProfiles} isManager={isManager} />
    </div>
  )
}