'use client'

import { useState, useTransition, useRef } from 'react'
import { addExpense } from '@/app/actions/expenses'

export function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await addExpense(formData)
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
        ➕ নতুন খরচ যোগ করুন
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              তারিখ *
            </label>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>

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
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ক্যাটাগরি *
          </label>
          <select
            name="category"
            required
            defaultValue="bazar"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="bazar">🛒 বাজার</option>
            <option value="rent">🏠 রেন্ট/বিল</option>
            <option value="utility">💡 ইউটিলিটি (বিদ্যুৎ, পানি, গ্যাস)</option>
            <option value="other">📦 অন্যান্য</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            বিবরণ (optional)
          </label>
          <input
            name="description"
            type="text"
            placeholder="যেমন: চাল, ডাল, তেল"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'যোগ করা হচ্ছে...' : 'খরচ যোগ করুন'}
        </button>
      </form>
    </div>
  )
}