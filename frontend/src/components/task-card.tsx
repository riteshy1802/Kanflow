"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dot, ChevronsUp, ChevronsDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

interface TaskCardProps {
  task: Task
  members: Member[]
  isActive: boolean
  onClick: () => void
  onUpdate: (task: Task) => void
}

const PRIORITY_ICONS = {
  high: ChevronsUp,
  medium: Dot,
  low: ChevronsDown,
}

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/20",
  low: "text-green-400 bg-green-400/20",
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "in-review", label: "In Review" },
  { value: "done", label: "Done" },
]

export function TaskCard({ task, members, isActive, onClick, onUpdate }: TaskCardProps) {
  const PriorityIcon = PRIORITY_ICONS[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  const taskMembers = members.filter((member) => task.assignees.includes(member.id))

  const handleStatusChange = (newStatus: string) => {
    onUpdate({
      ...task,
      status: newStatus as Task["status"],
      updatedAt: new Date().toISOString().split("T")[0],
    })
  }

  const handlePriorityChange = (newPriority: string) => {
    onUpdate({
      ...task,
      priority: newPriority as Task["priority"],
      updatedAt: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isActive ? "border border-gray-500/50 shadow-lg" : "hover:bg-gray-700/50"
      }`}
      style={{
        backgroundColor: isActive ? "#2a2a2c" : "#242426",
      }}
      onClick={onClick}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[0.6rem] px-2 py-1 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 text-gray-200"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <h4 className="text-xs font-medium mb-2 line-clamp-3 leading-relaxed text-gray-100">{task.title}</h4>

      <div className="flex items-center justify-start mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className={`h-6 px-1 gap-1 cursor-pointer ${priorityColor} hover:bg-white/10`}>
              <PriorityIcon className="h-2 w-2" />
              <span className="text-[0.6rem] capitalize">{task.priority}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-800 border-gray-700">
            <DropdownMenuItem onClick={() => handlePriorityChange("high")} className="text-gray-100 text-xs cursor-pointer hover:bg-gray-700">
              <ChevronsUp className="h-2 w-2 text-red-400" />
              High
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handlePriorityChange("medium")}
              className="text-gray-100 text-xs cursor-pointer hover:bg-gray-700"
            >
              <Dot className="h-3 w-3 text-yellow-400" />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePriorityChange("low")} className="text-gray-100 text-xs cursor-pointer hover:bg-gray-700">
              <ChevronsDown className="h-3 w-3 text-green-400" />
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1">
          {taskMembers.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="h-6 w-6 border border-gray-800">
              <AvatarFallback className="bg-[#4b06c2] text-white text-[0.5rem] font-medium">{member.avatar}</AvatarFallback>
            </Avatar>
          ))}
          {taskMembers.length > 3 && (
            <Avatar className="h-6 w-6 border border-gray-800">
              <AvatarFallback className="bg-gray-600 text-xs text-gray-200">+{taskMembers.length - 3}</AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Date */}
        <div className="text-[0.6rem] text-gray-400">{task.updatedAt}</div>
      </div>
    </div>
  )
}
