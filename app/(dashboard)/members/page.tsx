import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MembersList } from '@/components/members-list'

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  // সব member
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, phone, room_no, role, active')
    .order('name')

  // এই মাসের শুরু
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStart = startOfMonth.toISOString().split('T')[0]

  // সব meals
  const { data: meals } = await supabase
    .from('meals')
    .select('user_id, breakfast, lunch, dinner')
    .gte('date', monthStart)

  // সব deposits
  const { data: deposits } = await supabase
    .from('deposits')
    .select('user_id, amount')
    .gte('date', monthStart)

  // মোট খরচ
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', monthStart)

  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0

  const totalMeals = meals?.reduce(
    (sum, m) => sum + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0),
    0
  ) || 0

  const mealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0

  const enriched = (profiles || []).map((p) => {
    const memberMeals = meals?.filter((m) => m.user_id === p.id) || []
    const memberMealCount = memberMeals.reduce(
      (sum, m) => sum + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0),
      0
    )
    const memberDeposits = deposits
      ?.filter((d) => d.user_id === p.id)
      .reduce((s, d) => s + Number(d.amount), 0) || 0
    const bill = memberMealCount * mealRate
    const balance = memberDeposits - bill

    return {
      ...p,
      totalMeals: memberMealCount,
      totalDeposits: memberDeposits,
      balance,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">👥 Members</h1>
        <p className="text-gray-500 text-sm">
          সব মেম্বারের তথ্য ও এই মাসের হিসাব
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-blue-600">মোট Members</div>
          <div className="text-xl font-bold text-blue-800 mt-1">
            {profiles?.length || 0}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-green-600">Active</div>
          <div className="text-xl font-bold text-green-800 mt-1">
            {profiles?.filter((p) => p.active).length || 0}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-purple-600">Managers</div>
          <div className="text-xl font-bold text-purple-800 mt-1">
            {profiles?.filter((p) => p.role === 'manager').length || 0}
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-orange-600">Meal Rate</div>
          <div className="text-xl font-bold text-orange-800 mt-1">
            ৳ {mealRate.toFixed(0)}
          </div>
        </div>
      </div>

      <MembersList
        members={enriched}
        isManager={isManager}
        currentUserId={user.id}
      />
    </div>
  )
}