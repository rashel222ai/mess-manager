import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExpenseForm } from '@/components/expense-form'
import { ExpenseList } from '@/components/expense-list'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  const monthStart = startOfMonth.toISOString().split('T')[0]

  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, date, amount, category, description, added_by')
    .gte('date', monthStart)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  const expensesList = (expenses || []) as any[]

  const total = expensesList.reduce((sum, e) => sum + Number(e.amount), 0)

  const byCategory = expensesList.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🛒 বাজার / খরচ</h1>
        <p className="text-gray-500 text-sm">
          এই মাসের সব খরচের হিসাব
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-blue-600">মোট খরচ</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-800 mt-1">
            ৳ {total.toLocaleString('bn-BD')}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-green-600">🛒 বাজার</div>
          <div className="text-lg font-bold text-green-800 mt-1">
            ৳ {(byCategory.bazar || 0).toLocaleString('bn-BD')}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-purple-600">🏠 রেন্ট</div>
          <div className="text-lg font-bold text-purple-800 mt-1">
            ৳ {(byCategory.rent || 0).toLocaleString('bn-BD')}
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-xs font-semibold text-orange-600">💡 ইউটিলিটি</div>
          <div className="text-lg font-bold text-orange-800 mt-1">
            ৳ {(byCategory.utility || 0).toLocaleString('bn-BD')}
          </div>
        </div>
      </div>

      {isManager && <ExpenseForm />}

      <ExpenseList expenses={expensesList} isManager={isManager} />

      {!isManager && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ℹ️ খরচ যোগ বা delete করতে পারবেন শুধু Manager
        </div>
      )}
    </div>
  )
}