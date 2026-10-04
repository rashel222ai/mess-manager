'use client'

import { useState, useTransition } from 'react'
import { updateMemberRole, toggleMemberActive } from '@/app/actions/members'

interface Member {
  id: string
  name: string
  email: string | null
  phone: string | null
  room_no: string | null
  role: string
  active: boolean
  totalMeals: number
  totalDeposits: number
  balance: number
}

export function MembersList({
  members,
  isManager,
  currentUserId,
}: {
  members: Member[]
  isManager: boolean
  currentUserId: string
}) {
  const [items, setItems] = useState(members)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(userId: string, currentRole: string) {
    const newRole = currentRole === 'manager' ? 'member' : 'manager'
    if (!confirm(`Role change করবেন ${currentRole} → ${newRole}?`)) return

    startTransition(async () => {
      const result = await updateMemberRole(userId, newRole)
      if (result.success) {
        setItems((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
        )
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  function handleActiveToggle(userId: string, currentActive: boolean) {
    if (!confirm(currentActive ? 'Deactivate করবেন?' : 'Activate করবেন?')) return

    startTransition(async () => {
      const result = await toggleMemberActive(userId, !currentActive)
      if (result.success) {
        setItems((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, active: !currentActive } : m))
        )
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const filtered = items.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.room_no || '').includes(search)
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 নাম, email বা room দিয়ে খুঁজুন..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      {/* Members */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm">কোনো member পাওয়া যায়নি</p>
          </div>
        )}

        {filtered.map((member) => {
          const isSelf = member.id === currentUserId
          const balanceColor = member.balance >= 0 ? 'text-green-700' : 'text-red-700'

          return (
            <div
              key={member.id}
              className={`bg-white rounded-xl border p-4 ${
                member.active ? 'border-gray-100' : 'border-red-200 bg-red-50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">
                      {member.name}
                      {isSelf && (
                        <span className="text-xs text-blue-600 font-normal"> (আপনি)</span>
                      )}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        member.role === 'manager'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {member.role === 'manager' ? '👑 Manager' : '👤 Member'}
                    </span>
                    {!member.active && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    {member.email && <div>📧 {member.email}</div>}
                    {member.phone && <div>📞 {member.phone}</div>}
                    {member.room_no && <div>🚪 Room {member.room_no}</div>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-blue-600">মিল</div>
                      <div className="font-bold text-blue-800">{member.totalMeals}</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-green-600">Deposit</div>
                      <div className="font-bold text-green-800">
                        ৳{member.totalDeposits.toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-600">Balance</div>
                      <div className={`font-bold ${balanceColor}`}>
                        ৳{Math.abs(member.balance).toLocaleString('bn-BD', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Actions */}
                {isManager && !isSelf && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleRoleChange(member.id, member.role)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                    >
                      {member.role === 'manager' ? 'Make Member' : 'Make Manager'}
                    </button>
                    <button
                      onClick={() => handleActiveToggle(member.id, member.active)}
                      disabled={isPending}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-50 ${
                        member.active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {member.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}