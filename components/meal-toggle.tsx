'use client'

import { useState, useTransition } from 'react'
import { toggleMeal } from '@/app/actions/meals'

type MealType = 'breakfast' | 'lunch' | 'dinner'

interface MealToggleProps {
  date: string
  mealType: MealType
  currentValue: number
  status: string
  label: string
  emoji: string
}

export function MealToggle({
  date,
  mealType,
  currentValue,
  status,
  label,
  emoji,
}: MealToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticValue, setOptimisticValue] = useState(currentValue)

  function handleToggle() {
    const newValue = optimisticValue === 1 ? 0 : 1
    setOptimisticValue(newValue)

    startTransition(async () => {
      const result = await toggleMeal(date, mealType, newValue as 0 | 1)
      if (result.error) {
        // Rollback
        setOptimisticValue(currentValue)
      }
    })
  }

  const isOn = optimisticValue === 1

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition
        ${isOn 
          ? 'bg-green-50 border-green-400 text-green-700' 
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
        }
        ${isPending ? 'opacity-60' : ''}
      `}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold">{label}</span>
      <span className={`text-xs font-bold ${isOn ? 'text-green-600' : 'text-gray-400'}`}>
        {isOn ? 'ON' : 'OFF'}
      </span>
      {isOn && status === 'pending' && (
        <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
          Pending
        </span>
      )}
      {isOn && status === 'approved' && (
        <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded">
          ✓ Approved
        </span>
      )}
    </button>
  )
}