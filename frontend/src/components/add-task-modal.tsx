"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Calendar24 } from "./DatePicker"

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
  dueDate?: string
}

interface Member {
  id: string
  name: string
  email: string
  avatar: string
  role: "admin" | "user"
  joinedAt: string
}

interface AddTaskModalProps {
  columnId: string
  members: Member[]
  onClose: () => void
  onAdd: (task: Omit<Task, "id">) => void
}

export function AddTaskModal({ columnId, members, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignees, setAssignees] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [dueDate, setDueDate] = useState("")

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const currentDate = new Date().toISOString().split("T")[0]

    onAdd({
      title,
      description,
      status: columnId as Task["status"],
      priority,
      assignees,
      tags,
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: "1", // Current user ID
      dueDate: dueDate || undefined,
    })

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-200 text-xs">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200 text-xs">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-gray-200 text-xs">
              Due Date
            </Label>
            <Calendar24/>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Priority</Label>
            <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
              <SelectTrigger className="bg-gray-700/50 cursor-pointer border-gray-600 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="low" className="text-gray-100 hover:bg-gray-700">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="text-gray-100 hover:bg-gray-700">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="text-gray-100 hover:bg-gray-700">
                  High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Assignees</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !assignees.includes(value)) {
                  setAssignees([...assignees, value])
                }
              }}
            >
              <SelectTrigger className="bg-gray-700/50 cursor-pointer border-gray-600 text-gray-100">
                <SelectValue placeholder="Select assignees" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id} className="text-gray-100 hover:bg-gray-700">
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {assignees.map((assigneeId) => {
                  const member = members.find((m) => m.id === assigneeId)
                  return member ? (
                    <Badge key={assigneeId} variant="secondary" className="gap-1 bg-gray-600 text-gray-200">
                      {member.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setAssignees(assignees.filter((id) => id !== assigneeId))}
                      />
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                // size="sm"
                className="bg-[#4B06C2] hover:bg-[#4B06C2]/90 cursor-pointer text-white"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-gray-600 text-gray-200">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 cursor-pointer text-gray-200 hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="bg-[#4B06C2] flex-1 hover:bg-[#4B06C2]/90 cursor-pointer text-white">
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}