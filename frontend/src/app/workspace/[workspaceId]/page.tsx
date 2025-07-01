'use client'

import { useParams } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban-board'

export default function WorkspaceBoard() {
  const { workspace_id } = useParams()

  return (
    <div className="h-screen bg-gray-900">
      <KanbanBoard boardId={workspace_id as string} />
    </div>
  )
}
