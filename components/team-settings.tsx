'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trash2, Shield, Edit2 } from 'lucide-react'

interface TeamMember {
  id: string
  user_id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  added_at: string
}

interface TeamSettingsProps {
  projectId: string
  currentUserId: string
}

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner', description: 'Full access' },
  { value: 'admin', label: 'Admin', description: 'Can manage tasks and team' },
  { value: 'member', label: 'Member', description: 'Can create and edit tasks' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
]

export function TeamSettings({ projectId, currentUserId }: TeamSettingsProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberId, role: newRole }),
      })
      setEditingId(null)
      fetchMembers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const removeMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await fetch(`/api/projects/${projectId}/members`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_id: memberId }),
        })
        fetchMembers()
      } catch (error) {
        console.error('Error removing member:', error)
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading team members...</div>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Team Members</h3>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members added yet</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>

              <div className="flex items-center gap-2">
                {editingId === member.id ? (
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.user_id, e.target.value)}
                    className="px-3 py-1 text-sm border border-border rounded bg-background"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full font-medium capitalize">
                    {member.role}
                  </span>
                )}

                {member.user_id !== currentUserId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(editingId === member.id ? null : member.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
