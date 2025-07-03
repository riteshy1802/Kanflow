"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Edit3, ChevronsUp, Dot, ChevronsDown, Calendar, User, Tag, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar24 } from "./DatePicker"
import { Input } from "./ui/input"
import { getColorForName } from "@/functions/getAvatarColor"

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

interface TaskDetailProps {
  task: Task
  members: Member[]
  onClose: () => void
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

export function TaskDetail({ task, members, onClose, onUpdate }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(task.description)
  const [editedTask, setEditedTask] = useState(task)
  const [editedAssignees, setEditedAssignees] = useState(task.assignees)
  const [editedDueDate, setEditedDueDate] = useState("2025-05-31")
  const [editedTime, setEditedTime] = useState("10:30:00")

  const PriorityIcon = PRIORITY_ICONS[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  const taskMembers = members.filter((member) => editedTask.assignees.includes(member.id))
  const assignee = members.find((member) => member.id === task.assignees[0])

  const handleSave = () => {
    onUpdate({
      ...editedTask,
      description: editedDescription,
      assignees: editedAssignees,
      updatedAt: new Date().toISOString().split("T")[0],
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedDescription(task.description)
    setEditedTask(task)
    setEditedAssignees(task.assignees)
    setEditedDueDate("2025-05-31")
    setIsEditing(false)
  }

  return (
    <div
      className="fixed inset-y-0 right-0 w-2/5 border-l border-gray-700/20 slide-in-right z-50 flex flex-col shadow-2xl"
      style={{ width: "35%", backgroundColor: "#1A191C" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/20">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold pr-4 leading-tight text-gray-100">{task.title}</h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="hover:bg-white/10 cursor-pointer text-gray-400 hover:text-gray-200"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 cursor-pointer hover:text-gray-200 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Task Meta Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Assignee</span>
            {isEditing ? (
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !editedAssignees.includes(value)) {
                    setEditedAssignees([...editedAssignees, value])
                  }
                }}
              >
                <SelectTrigger className="w-40 h-8 bg-gray-700/50 cursor-pointer border-gray-600 text-gray-100">
                  <SelectValue placeholder="Add assignee" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="text-gray-100 hover:bg-gray-700">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                {assignee && (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback style={{backgroundColor:getColorForName(assignee.name)}} className="text-white text-[0.5rem] font-medium">
                        {assignee.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-200">{assignee.name}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {isEditing && editedAssignees.length > 0 && (
            <div className="flex flex-wrap gap-1 ml-6">
              {editedAssignees.map((assigneeId) => {
                const member = members.find((m) => m.id === assigneeId)
                return member ? (
                  <Badge key={assigneeId} variant="secondary" className="gap-1 bg-gray-600 text-gray-200">
                    {member.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setEditedAssignees(editedAssignees.filter((id) => id !== assigneeId))}
                    />
                  </Badge>
                ) : null
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Status</span>
            <Select
              value={editedTask.status}
              disabled={!isEditing}
              onValueChange={(value) => {
                const updatedTask = { ...editedTask, status: value as Task["status"] }
                setEditedTask(updatedTask)
                onUpdate(updatedTask)
              }}
            >
              <SelectTrigger className="w-32 cursor-pointer h-8 bg-gray-700/50 border-gray-600 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-gray-100 cursor-pointer hover:bg-gray-700">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Due Date</span>
            {isEditing ? (
              <Calendar24/>
            ) : (
              <span className="text-sm text-gray-200">{editedDueDate} | {editedTime}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Priority</span>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => {
                  const updatedTask = { ...editedTask, priority: value as Task["priority"] }
                  setEditedTask(updatedTask)
                  onUpdate(updatedTask)
                }}
              >
                <SelectTrigger disabled={!isEditing} className={`w-32 cursor-pointer text-[0.8rem] h-6 px-2 gap-1 ${priorityColor} border-gray-600`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="high" className="text-gray-100 cursor-pointer hover:bg-gray-700">
                    <div className="flex items-center gap-1">
                      <ChevronsUp className="h-3 w-3 mr-2 text-red-400 " />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="text-gray-100 cursor-pointer hover:bg-gray-700">
                    <div className="flex items-center gap-1">
                      <Dot className="h-3 w-3 mr-2 text-yellow-400" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low" className="text-gray-100 cursor-pointer hover:bg-gray-700">
                    <div className="flex items-center gap-1">
                      <ChevronsDown className="h-3 w-3 mr-2 text-green-400" />
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-[100%] flex-col items-start gap-2">
            <div className="flex w-full items-center gap-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Tags</span>
                <div className="flex flex-wrap gap-1">
                    {editedTask.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-1 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 text-gray-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            {isEditing && 
              <div className="flex-1 w-full">
                <Input
                    id="tags"
                    type="text"
                    placeholder="Enter tags (comma separated)"
                    required
                    className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                />
              </div>
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-3">
          <div className="border-b border-gray-700/20 mb-6">
            <button className="pb-2 border-b-2 border-[#5e00ff] text-[#5e00ff] font-semibold text-sm">
              Description
            </button>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-32 bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                  placeholder="Enter task description..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 cursor-pointer text-gray-200 hover:bg-gray-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm" className="bg-[#4b06c2] cursor-pointer flex-1 hover:bg-[#4b06c2]/80 text-white">
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">{task.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isEditing && <div className="w-[100%] px-5 py-4">
        <Button className="w-full cursor-pointer hover:bg-red-800 bg-red-700 text-sm text-white transition duration-200">Delete Task</Button>
      </div>}
    </div>
  )
}