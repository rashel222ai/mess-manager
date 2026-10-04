'use client'

import { useState, useTransition } from 'react'
import { deleteMenu } from '@/app/actions/menus'

interface Menu {
  id: number
  date: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

export function MenuList({
  menus,
  isManager,
}: {
  menus: Menu[]
  isManager: boolean
}) {
  const [items, setItems] = useState(menus)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number) {
    if (!confirm('এই মেনু delete করবেন?')) return
    startTransition(async () => {
      const result = await deleteMenu(id)
      if (result.success) {
        setItems((prev) => prev.filter((m) => m.id !== id))
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">এখনো কোনো মেনু সেট করা হয়নি</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((menu) => {
        const isToday = menu.date === today
        const isPast = menu.date < today

        return (
          <div
            key={menu.id}
            className={`rounded-xl border p-4 ${
              isToday
                ? 'border-blue-400 bg-blue-50 shadow-sm'
                : isPast
                ? 'border-gray-100 bg-gray-50 opacity-70'
                : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                  {formatDate(menu.date)}
                </span>
                {isToday && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    আজ
                  </span>
                )}
              </div>
              {isManager && (
                <button
                  onClick={() => handleDelete(menu.id)}
                  disabled={isPending}
                  className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MealRow icon="🌅" label="সকাল" value={menu.breakfast} />
              <MealRow icon="☀️" label="দুপুর" value={menu.lunch} />
              <MealRow icon="🌙" label="রাত" value={menu.dinner} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MealRow({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-gray-800 font-medium break-words">
          {value || <span className="text-gray-300 italic">—</span>}
        </div>
      </div>
    </div>
  )
}