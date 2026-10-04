import { MealApprovalList } from '@/components/meal-approval-list'
import { MealToggle } from '@/components/meal-toggle'
import { createClient } from '@/lib/supabase/server'

const mealOptions = [
  { key: 'breakfast', label: 'নাস্তা', emoji: '🌅' },
  { key: 'lunch', label: 'দুপুর', emoji: '☀️' },
  { key: 'dinner', label: 'রাত', emoji: '🌙' },
] as const

export default async function MealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().slice(0, 10)

  if (!user) {
    return <p className="text-red-600">মিল দেখতে লগইন করুন।</p>
  }

  const [{ data: todayMeal, error: todayMealError }, { data: profile }] = await Promise.all([
    supabase
      .from('meals')
      .select('breakfast, lunch, dinner, status')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle(),
    supabase.from('profiles').select('role').eq('id', user.id).single(),
  ])

  let approvalMeals: Array<{
    id: number
    date: string
    breakfast: number
    lunch: number
    dinner: number
    status: string
    user_id: string
    profiles: { name: string; room_no: string | null } | null
  }> = []
  let approvalError = ''

  if (profile?.role === 'manager') {
    const { data: pendingMeals, error } = await supabase
      .from('meals')
      .select('id, date, breakfast, lunch, dinner, status, user_id')
      .eq('status', 'pending')
      .order('date', { ascending: false })

    if (error) {
      approvalError = error.message
    } else if (pendingMeals?.length) {
      const userIds = [...new Set(pendingMeals.map((meal) => meal.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, room_no')
        .in('id', userIds)
      const profilesById = new Map(profiles?.map((item) => [item.id, item]) ?? [])

      approvalMeals = pendingMeals.map((meal) => ({
        ...meal,
        profiles: profilesById.get(meal.user_id) ?? null,
      }))
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🍽️ মিল ট্র্যাকিং</h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Intl.DateTimeFormat('bn-BD', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          }).format(new Date(`${today}T12:00:00`))}
        </p>
      </header>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-gray-800">আজকের মিল</h2>
          <p className="mt-1 text-sm text-gray-500">আপনার প্রতিটি মিল চালু বা বন্ধ করতে চাপ দিন।</p>
        </div>

        {todayMealError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            মিলের তথ্য লোড করা যায়নি: {todayMealError.message}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:max-w-md">
            {mealOptions.map((meal) => (
              <MealToggle
                key={meal.key}
                date={today}
                mealType={meal.key}
                currentValue={todayMeal?.[meal.key] ?? 0}
                status={todayMeal?.status ?? 'pending'}
                label={meal.label}
                emoji={meal.emoji}
              />
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500">
          নতুন বা পরিবর্তিত মিল ম্যানেজারের অনুমোদনের জন্য যাবে।
        </p>
      </section>

      {profile?.role === 'manager' && (
        approvalError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Pending মিল লোড করা যায়নি: {approvalError}
          </p>
        ) : (
          <MealApprovalList initialMeals={approvalMeals} />
        )
      )}
    </div>
  )
}