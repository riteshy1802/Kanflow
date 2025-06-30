"use client"

import { useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateKanbanForm } from "@/components/create-kanban-form"

export default function HomePage() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="flex h-screen bg-gray-900">
      <AppSidebar
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onCreateKanban={() => setShowCreateForm(true)}
        showCreateForm={showCreateForm}
      />
      <main className="flex-1 overflow-hidden">
        {showCreateForm ? (
          <CreateKanbanForm onClose={() => setShowCreateForm(false)} />
        ) : selectedBoard ? (
          <KanbanBoard boardId={selectedBoard} />
        ) : (
          <div className="flex items-center justify-center h-full bg-[#100f12]">
            <div className="text-center">
              <h2 className="text-4xl font-semibold mb-4 text-gray-100">Welcome to Kanflow</h2>
              <p className="text-gray-400 mb-6 text-md">Select a board from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
