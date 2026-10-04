'use client'

import { useState, useTransition } from 'react'
import { deleteDeposit } from '@/app/actions/deposits'

interface Deposit {
  id: number
  amount: number
  date: string
  note: string | null
  user_id: string
  profiles: { name: string; room_no: string | null } | null
}

export function DepositList({
  deposits,
  isManager,
}: {
  deposits: Deposit[]
  isManager: boolean
}) {
  const [items, setItems] = useState(deposits)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: number) {
    if (!confirm('এই deposit delete করবেন?')) return
    startTransition(async () => {
      const result = await deleteDeposit(id)
      if (result.success) {
        setItems((prev) => prev.filter((d) => d.id !== id))
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">এখনো কোনো deposit নেই</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-bold text-lg text-gray-800 mb-4">
        💰 সাম্প্রতিক Deposits ({items.length})
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {items.map((deposit) => (
          <div
            key={deposit.id}
            className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-800">
                {deposit.profiles?.name || 'Unknown'}
                {deposit.profiles?.room_no && (
                  <span className="text-gray-500 font-normal">
                    {' '}• Room {deposit.profiles.room_no}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {deposit.date}
                {deposit.note && ` • ${deposit.note}`}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-green-700">
                ৳ {Number(deposit.amount).toLocaleString('bn-BD')}
              </span>
              {isManager && (
                <button
                  onClick={() => handleDelete(deposit.id)}
                  disabled={isPending}
                  className="text-red-500 hover:text-red-700 text-sm p-1 disabled:opacity-50"
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