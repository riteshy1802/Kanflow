"use client"

import { useEffect, useState } from "react"
import { KanbanBoard } from "@/components/kanban-board"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateKanbanForm } from "@/components/create-kanban-form"
import { useSearchParams } from "next/navigation"
import Notifications from "@/components/notifications"

export default function HomePage() {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const searchParams = useSearchParams();
  const workspace_id = searchParams.get('workspace_id');
  const [openNotifications, setOpenNotifications] = useState(false);

  useEffect(()=>{
    console.log("Workspace : ", workspace_id);
  },[workspace_id]);

  return (
    <div className="flex h-screen bg-gray-900">
      <AppSidebar
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onCreateKanban={() => setShowCreateForm(true)}
        showCreateForm={showCreateForm}
        setShowCreateForm={setShowCreateForm}
      />
      <main className="flex-1 overflow-hidden">
        {showCreateForm ? (
          <>
            <CreateKanbanForm onClose={() => setShowCreateForm(false)} />
            <Notifications/>
          </>
        ) : (selectedBoard || workspace_id) ? (
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
