'use client'

import { useState } from 'react'

export function BackupButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleBackup() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/backup')
      if (!res.ok) throw new Error('Backup failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mess-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Backup failed. আবার try করুন।')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleBackup}
      disabled={isLoading}
      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
    >
      {isLoading ? '⏳ Backup হচ্ছে...' : '💾 Backup Download'}
    </button>
  )
}