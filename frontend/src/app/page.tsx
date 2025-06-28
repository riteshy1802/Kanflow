"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateKanbanForm } from "@/components/create-kanban-form"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("kanflow_token")
    if (!token) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">Welcome to Kanflow</h2>
              <p className="text-gray-400 mb-6">Select a board from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
