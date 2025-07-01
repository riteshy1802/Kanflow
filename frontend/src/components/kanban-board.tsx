"use client"

import { useEffect, useState } from "react"
import { KanbanColumn } from "@/components/kanban-column"
import { TaskDetail } from "@/components/task-detail"
import { AddMemberModal } from "@/components/add-member-modal"
import { FilterDropdown } from "@/components/filter-dropdown"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Pen, Trash2, X } from "lucide-react"
import { getColorForName } from "@/functions/getAvatarColor"
import { Input } from "./ui/input"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { post } from "@/actions/common"
import { GET_WORKSPACE } from "@/constants/API_Endpoints"
import { Skeleton } from "./ui/skeleton"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "blocked" | "in-review" | "done"
  priority: "low" | "medium" | "high"
  assignees: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface Member {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "user"
  joinedAt: string
}

const COLUMNS = [
  { id: "todo", title: "TO DO", color: "bg-gray-500" },
  { id: "in-progress", title: "IN PROGRESS", color: "bg-yellow-500" },
  { id: "blocked", title: "BLOCKED", color: "bg-red-500" },
  { id: "in-review", title: "IN REVIEW", color: "bg-blue-500" },
  { id: "done", title: "DONE", color: "bg-green-500" },
]

export function KanbanBoard() {
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Update the Design System to Support Dark Mode and High Contrast Accessibility Options",
      description:
        "Update the Design System to include support for dark mode and high contrast accessibility options by defining adaptable color tokens and styles that maintain visual harmony, ensuring sufficient contrast ratios for readability and compliance with accessibility standards (e.g., WCAG).",
      status: "todo",
      priority: "high",
      assignees: ["1", "2"],
      tags: ["Design System", "Accessibility"],
      createdAt: "2025-05-31",
      updatedAt: "2025-05-31",
      createdBy: "1",
    },
    {
      id: "2",
      title: "Sketch out initial wireframes for the main screen",
      description: "Create initial wireframes for the main application screen",
      status: "in-progress",
      priority: "medium",
      assignees: ["2", "3"],
      tags: ["Wireframes", "UI/UX"],
      createdAt: "2025-05-30",
      updatedAt: "2025-06-01",
      createdBy: "2",
    },
    {
      id: "3",
      title: "Map Component",
      description: "Implement the map component for location features",
      status: "in-review",
      priority: "medium",
      assignees: ["3"],
      tags: ["Component", "Maps"],
      createdAt: "2025-05-29",
      updatedAt: "2025-06-02",
      createdBy: "3",
    },
    {
      id: "4",
      title: "Add micro-interactions to prototype for user feedback",
      description: "Enhance the prototype with micro-interactions",
      status: "done",
      priority: "low",
      assignees: ["1", "4"],
      tags: ["Prototype", "Interactions"],
      createdAt: "2025-05-28",
      updatedAt: "2025-06-03",
      createdBy: "1",
    },
  ])

  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "Dominik Dutkiewicz",
      email: "dominik@example.com",
      avatar: "DD",
      role: "admin",
      joinedAt: "2025-01-15",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "SJ",
      role: "user",
      joinedAt: "2025-02-01",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com",
      avatar: "MC",
      role: "user",
      joinedAt: "2025-02-15",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "ED",
      role: "admin",
      joinedAt: "2025-03-01",
    },
  ])

  const [filters, setFilters] = useState({
    severity: "all",
    createdBy: "all",
    searchTitle: "",
    timeframe: "all",
    sortBy: "lastUpdated",
  })

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const [boardName, setBoardName] = useState("")

  const getWorkspaceData = async () => {
    try {
      const res = await post(GET_WORKSPACE, { workspaceId });
      return res.payload;
    } catch (error) {
      console.log("Error while fetching workspace data:", error);
    }
  };
  
  const { data: workspaceData, isLoading: isFetchingWorkspaceData } = useQuery({
    queryKey: ['workspace-data', workspaceId],
    queryFn: getWorkspaceData,
    enabled: !!workspaceId,
  });
  
  useEffect(()=>{
    setBoardName(workspaceData?.name);
  },[workspaceData]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleAddTask = (columnId: string, task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      status: columnId as Task["status"],
    }
    setTasks([...tasks, newTask])
  }

  const getTasksForColumn = (columnId: string) => {
    return tasks.filter((task) => task.status === columnId)
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col" style={{ backgroundColor: "#1D1D1F" }}>
        {/* Header */}
        <div className="px-6 pb-3 pt-6 border-b border-gray-700/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="w-full flex items-center">
                  <Input
                    id="board-name"
                    placeholder="Enter board name"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="border-slate-600/50 min-w-88 text-2xl font-bold text-gray-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                  />
                  <X
                    onClick={() => setIsEditingName(false)}
                    className="inline-block ml-2 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-200"
                  />
                </div>
              ) : (
                isFetchingWorkspaceData ? 
                  <Skeleton className="h-8 w-72 rounded-md bg-gray-600/50"/>
                :
                  <div className="w-full flex gap-2 items-center">
                    <h1 className="text-2xl font-bold text-gray-100">{workspaceData?.name}</h1>
                    <Pen
                      onClick={() => setIsEditingName(true)}
                      className="inline-block ml-2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-200"
                    />
                  </div>
              )}

            </div>
            <div className="flex items-center gap-3">
              {/* Team Avatars */}
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member) => (
                  <Tooltip key={member.id}>
                    <TooltipTrigger>
                      <Avatar className="h-8 w-8 border-2 border-gray-800">
                        <AvatarFallback
                          className="text-white text-xs font-medium"
                          style={{ backgroundColor: getColorForName(member?.name) }}
                        >
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                      <p>{member.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {members.length > 5 && (
                  <Avatar className="h-8 w-8 border-2 border-gray-800">
                    <AvatarFallback className="bg-gray-600 text-xs text-gray-200">+{members.length - 5}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <Button onClick={() => setShowAddMember(true)} className="bg-[#580bdb] hover:bg-[#580bdb]/80 cursor-pointer text-xs text-white">
                Add Member
              </Button>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`pb-2 border-b-2 cursor-pointer text-sm transition-colors ${
                  activeTab === "tasks"
                    ? "border-[#580bdb] text-[#580bdb] font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-2 border-b-2 cursor-pointer text-sm transition-colors ${
                  activeTab === "members"
                    ? "border-[#580bdb] text-[#580bdb] font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                Members
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "tasks" && (
                <Tooltip>
                  <TooltipTrigger>
                    <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-200" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                    <p>Export Board as PDF</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {activeTab === "tasks" && <FilterDropdown filters={filters} onFiltersChange={setFilters} />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {activeTab === "tasks" ? (
            <div className="h-full px-6 py-4 overflow-auto">
              <div className="grid grid-cols-5 gap-4 h-full">
              {COLUMNS.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tasks={getTasksForColumn(column.id)}
                  members={members}
                  onTaskClick={(task) => {
                    setSelectedTask(task)
                    setActiveTaskId(task.id)
                  }}
                  onAddTask={(task) => handleAddTask(column.id, task)}
                  onTaskUpdate={handleTaskUpdate}
                  activeTaskId={activeTaskId}
                />
              ))}
            </div>
          </div>
          ) : (
            <div className="p-6 overflow-x-hidden h-full">
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-700/30 rounded-lg border border-gray-600"
                  >
                    <div className="col-span-1 flex justify-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback style={{backgroundColor:getColorForName(member.name)}} className="text-white text-sm font-medium">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="col-span-3">
                      <p className="font-medium text-sm text-gray-100 truncate" title={member.name}>
                        {member.name}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <p className="text-sm text-gray-400 truncate" title={member.email}>
                  {member.email}
                      </p>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`px-5 py-2 text-xs rounded-full capitalize ${
                        member.role === "admin" 
                            ? "bg-[#580bdb]/50 text-white" 
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">
                        Joined {member.joinedAt}
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <div className="relative group">
                  <Button
                    variant="ghost"
                    // onClick={() => handleRemoveMember(member.id)}
                    className="p-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Remove {member.name}
                  </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            members={members}
            onClose={() => {
              setSelectedTask(null)
              setActiveTaskId(null)
            }}
            onUpdate={handleTaskUpdate}
          />
        )}

        {showAddMember && (
          <AddMemberModal
            onClose={() => setShowAddMember(false)}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
