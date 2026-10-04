'use client'

import { useState, useTransition, useRef } from 'react'
import { saveMenu } from '@/app/actions/menus'

interface Menu {
  id: number
  date: string
  breakfast: string | null
  lunch: string | null
  dinner: string | null
}

export function MenuForm({ editMenu }: { editMenu?: Menu }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await saveMenu(formData)
      if (result.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-bold text-lg text-gray-800 mb-4">
        {editMenu ? '✏️ মেনু Edit' : '➕ নতুন মেনু'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            তারিখ *
          </label>
          <input
            name="date"
            type="date"
            required
            defaultValue={editMenu?.date || today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            🌅 সকাল
          </label>
          <input
            name="breakfast"
            type="text"
            defaultValue={editMenu?.breakfast || ''}
            placeholder="যেমন: ভুনা খিচুড়ি, ডিম"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            ☀️ দুপুর
          </label>
          <input
            name="lunch"
            type="text"
            defaultValue={editMenu?.lunch || ''}
            placeholder="যেমন: ভাত, মাছ, ডাল"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            🌙 রাত
          </label>
          <input
            name="dinner"
            type="text"
            defaultValue={editMenu?.dinner || ''}
            placeholder="যেমন: ভাত, মুরগি, সবজি"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isPending ? 'সেভ হচ্ছে...' : editMenu ? 'Update করুন' : 'মেনু সেভ করুন'}
        </button>
      </form>
    </div>
  )
}