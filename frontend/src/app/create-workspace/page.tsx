'use client'

import { CreateKanbanForm } from '@/components/create-kanban-form'

export default function CreateWorkspacePage() {
  return (
    <div className="h-screen w-[100%] w-full flex items-center justify-center bg-gray-900">
      <CreateKanbanForm onClose={() => {}} />
    </div>
  )
}
