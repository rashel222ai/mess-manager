'use client'

import { useState, useTransition } from 'react'
import { deleteExpense } from '@/app/actions/expenses'

interface Expense {
  id: number
  date: string
  amount: number
  category: string
  description: string | null
  added_by: string | null
}

const categoryLabels: Record<string, string> = {
  bazar: '🛒 বাজার',
  rent: '🏠 রেন্ট',
  utility: '💡 ইউটিলিটি',
  other: '📦 অন্যান্য',
}

const categoryColors: Record<string, string> = {
  bazar: 'bg-green-100 text-green-700',
  rent: 'bg-purple-100 text-purple-700',
  utility: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

export function ExpenseList({
  expenses,
  isManager,
}: {
  expenses: Expense[]
  isManager: boolean
}) {
  const [items, setItems] = useState(expenses)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number) {
    if (!confirm('এই খরচটা delete করবেন?')) return
    startTransition(async () => {
      const result = await deleteExpense(id)
      if (result.success) {
        setItems((prev) => prev.filter((e) => e.id !== id))
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">এখনো কোনো খরচ যোগ করা হয়নি</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-bold text-lg text-gray-800 mb-4">
        📋 সাম্প্রতিক খরচ ({items.length})
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((expense) => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[expense.category]}`}>
                  {categoryLabels[expense.category]}
                </span>
                <span className="text-xs text-gray-500">{expense.date}</span>
              </div>
              {expense.description && (
                <div className="text-sm text-gray-700 mt-1 truncate">
                  {expense.description}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-gray-800">
                ৳ {Number(expense.amount).toLocaleString('bn-BD')}
              </span>
              {isManager && (
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={isPending}
                  className="text-red-500 hover:text-red-700 text-sm p-1 disabled:opacity-50"
                  title="Delete"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}