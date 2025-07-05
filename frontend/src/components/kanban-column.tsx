"use client"

import { useState } from "react"
import { TaskCard } from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTaskModal } from "./add-task-modal"
import { MembersObject, TaskObject } from "@/types/form.types"
import TaskCardSkeleton from "./skeletons/TaskCardSkeleton"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  tasks: TaskObject[]
  members: MembersObject
  onTaskClick:(task_id:string)=>void
  activeTaskId: string | null
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  activeTaskId,
  onTaskClick
}: KanbanColumnProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [addingTask, setAddingTask] = useState(false);
  return (
    <div className="flex flex-col" data-testid="kanban-column">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-medium text-xs text-gray-400">{title}</h3>
          <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-full">{tasks.length}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddTask(true)}
          className="h-6 w-6 p-0 cursor-pointer hover:bg-white/10 text-gray-400 hover:text-gray-200"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-2">
        {tasks.map((task:TaskObject) => (
          <div key={task.task_id}>
            <TaskCard
              key={task.task_id}
              task={task}
              isActive={activeTaskId === task.task_id}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
        {addingTask && <TaskCardSkeleton/>}
        <button className="w-full cursor-pointer mb-20" onClick={()=>setShowAddTask(true)}>
          <div className={`border border-dashed w-full flex items-center justify-center gap-1 border-yellow-600 bg-yellow-600/10 rounded-[6px] te px-4 py-2 text-yellow-600`}>
            <Plus size={18}/>
            <p className="text-xs">New Task</p>
          </div>
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal columnId={id} setAddingTask={setAddingTask} onClose={() => setShowAddTask(false)} />
      )}
    </div>
  )
}
