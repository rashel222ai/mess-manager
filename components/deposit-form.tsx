'use client'

import { useState, useTransition, useRef } from 'react'
import { addDeposit } from '@/app/actions/deposits'

interface Member {
  id: string
  name: string
  room_no: string | null
}

export function DepositForm({ members }: { members: Member[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await addDeposit(formData)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-bold text-lg text-gray-800 mb-4">
        ➕ নতুন Deposit
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            মেম্বার *
          </label>
          <select
            name="user_id"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="">-- মেম্বার select করুন --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.room_no ? ` (Room ${m.room_no})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              টাকা *
            </label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              তারিখ
            </label>
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            নোট (optional)
          </label>
          <input
            name="note"
            type="text"
            placeholder="যেমন: bKash এ পাঠিয়েছে"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'যোগ করা হচ্ছে...' : 'Deposit যোগ করুন'}
        </button>
      </form>
    </div>
  )
}