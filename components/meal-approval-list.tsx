'use client'

import { useState, useTransition } from 'react'
import { approveMeal } from '@/app/actions/meals'

interface Meal {
  id: number
  date: string
  breakfast: number
  lunch: number
  dinner: number
  status: string
  user_id: string
  profiles: { name: string; room_no: string | null } | null
}

export function MealApprovalList({ initialMeals }: { initialMeals: Meal[] }) {
  const [meals, setMeals] = useState(initialMeals)
  const [isPending, startTransition] = useTransition()

  function handleApprove(mealId: number, status: 'approved' | 'rejected') {
    startTransition(async () => {
      const result = await approveMeal(mealId, status)
      if (result.success) {
        setMeals((prev) => prev.filter((m) => m.id !== mealId))
      }
    })
  }

  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-lg text-gray-800 mb-2">
          👑 Manager Approval
        </h2>
        <p className="text-gray-400 text-sm text-center py-6">
          ✅ কোনো pending meal নেই
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">
          👑 Manager Approval
        </h2>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
          {meals.length} pending
        </span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {meals.map((meal) => {
          const total = meal.breakfast + meal.lunch + meal.dinner
          return (
            <div
              key={meal.id}
              className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">
                  {meal.profiles?.name || 'Unknown'}
                  {meal.profiles?.room_no && (
                    <span className="text-gray-500 font-normal">
                      {' '}• Room {meal.profiles.room_no}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {meal.date} • {total} meal{total !== 1 ? 's' : ''}
                  <span className="ml-2">
                    {meal.breakfast ? '🌅' : ''}
                    {meal.lunch ? '☀️' : ''}
                    {meal.dinner ? '🌙' : ''}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(meal.id, 'approved')}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleApprove(meal.id, 'rejected')}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}