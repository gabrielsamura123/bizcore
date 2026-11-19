import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  UserCog,
  UsersRound,
} from 'lucide-react'
import api from '@/api/axios'
import { formatDate } from '@/utils/formatDate'
import AddMemberModal from './AddMemberModal'

const ROLE_LABELS = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  inventory: 'Inventory',
}

const ROLE_STYLES = {
  owner: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  manager: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  cashier: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
  inventory: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
}

function titleCase(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function TeamManagement({ business, currentRole }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [recentMemberId, setRecentMemberId] = useState(null)

  const canManage = currentRole === 'owner' || currentRole === 'manager'
  const isOwner = currentRole === 'owner'

  useEffect(() => {
    if (!business?.id) return undefined

    let active = true
    setLoading(true)
    setError('')

    api
      .get(`/businesses/${business.id}/members`)
      .then(({ data }) => {
        if (active) setMembers(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.detail || 'Could not load the team roster.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [business?.id])

  useEffect(() => {
    if (!recentMemberId) return undefined
    const timer = setTimeout(() => setRecentMemberId(null), 1200)
    return () => clearTimeout(timer)
  }, [recentMemberId])

  const handleRoleChange = async (member, role) => {
    if (role === member.role) return

    setBusyId(member.id)
    setError('')
    setNotice('')

    try {
      const { data } = await api.patch(
        `/businesses/${business.id}/members/${member.id}/role`,
        { role }
      )
      setMembers((current) =>
        current.map((item) => (item.id === data.id ? data : item))
      )
      setNotice(`${data.full_name} is now ${ROLE_LABELS[data.role]}.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update this role.')
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (member) => {
    const confirmed = window.confirm(
      `Remove ${member.full_name} from this workspace?`
    )
    if (!confirmed) return

    setBusyId(member.id)
    setError('')
    setNotice('')

    try {
      await api.delete(`/businesses/${business.id}/members/${member.id}`)
      setMembers((current) => current.filter((item) => item.id !== member.id))
      setNotice(`${member.full_name} was removed from the team.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not remove this member.')
    } finally {
      setBusyId(null)
    }
  }

  const handleCreated = (member) => {
    setMembers((current) => [...current, member])
    setRecentMemberId(member.id)
    setNotice(`${member.full_name} was added to the team.`)
    setAddOpen(false)
  }

  if (!business) return null

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-200">
            <UsersRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Team & Staff</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Manage cashier and manager access to this store workspace.
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="btn-shimmer inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/20 px-4 py-2.5 text-xs font-semibold text-emerald-100 backdrop-blur transition hover:bg-emerald-400/30"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="notice mx-6 mt-5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="notice mx-6 mt-5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading team roster...
        </div>
      ) : members.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02]">
              <tr className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                <th className="px-6 py-3 font-semibold">Name &amp; Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Joined Date</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={`transition hover:bg-white/[0.03] ${
                    member.id === recentMemberId ? 'animate-member-in' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">
                      {member.full_name}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {member.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        ROLE_STYLES[member.role] || ROLE_STYLES.cashier
                      }`}
                    >
                      {ROLE_LABELS[member.role] || titleCase(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {isOwner && member.role !== 'owner' ? (
                        <label className="relative inline-flex items-center">
                          <span className="sr-only">
                            Change role for {member.full_name}
                          </span>
                          <UserCog className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-neutral-500" />
                          <select
                            value={member.role}
                            disabled={busyId === member.id}
                            onChange={(event) =>
                              handleRoleChange(member, event.target.value)
                            }
                            className="appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-7 text-xs font-semibold text-neutral-200 outline-none transition hover:border-white/25 focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="manager">Manager</option>
                            <option value="cashier">Cashier</option>
                            <option value="inventory">Inventory</option>
                          </select>
                        </label>
                      ) : (
                        <span className="text-xs text-neutral-500">
                          {member.role === 'owner' ? 'Owner account' : '—'}
                        </span>
                      )}

                      {isOwner && member.role !== 'owner' && (
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() => handleRemove(member)}
                          aria-label={`Remove ${member.full_name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <UsersRound className="mx-auto h-6 w-6 text-neutral-200" />
          <p className="mt-3 text-sm font-semibold text-white">
            No team members yet
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Add a cashier or manager to start building your store team.
          </p>
        </div>
      )}

      <AddMemberModal
        open={addOpen}
        businessId={business.id}
        canCreateManager={isOwner}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </section>
  )
}
