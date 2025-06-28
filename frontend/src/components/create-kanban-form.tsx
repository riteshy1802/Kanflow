"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface CreateKanbanFormProps {
  onClose: () => void
}

export function CreateKanbanForm({ onClose }: CreateKanbanFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState("user")
  const [teamMembers, setTeamMembers] = useState<Array<{ email: string; role: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAddMember = () => {
    if (searchEmail && !teamMembers.find((m) => m.email === searchEmail)) {
      setTeamMembers([...teamMembers, { email: searchEmail, role: selectedRole }])
      setSearchEmail("")
      setSelectedRole("user")
    }
  }

  const handleRemoveMember = (email: string) => {
    setTeamMembers(teamMembers.filter((m) => m.email !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      toast("Kanban board created successfully")
      onClose()
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto" style={{ backgroundColor: "#1D1D1F" }}>
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Create New Kanban Board</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 cursor-pointer flex items-center justify-center hover:text-gray-200 hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200 text-xs">
              Project Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200 text-xs">
              Project Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Team Members</Label>
            <div className="flex items-center justify-center gap-2">
              <Input
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Enter email address"
                type="email"
                className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
              />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-32 bg-gray-700/50 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="admin" className="text-gray-100 hover:bg-gray-700">
                    Admin
                  </SelectItem>
                  <SelectItem value="user" className="text-gray-100 hover:bg-gray-700">
                    User
                  </SelectItem>
                </SelectContent>
              </Select>
              <div>
              <Button
                type="button"
                onClick={handleAddMember}
                size="sm"
                className="bg-[#4B06C2] cursor-pointer flex-1 hover:bg-[#4B06C2]/80 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
                
              </div>
            </div>

            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Added members:</p>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between bg-gray-700/30 p-2 rounded border border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200">{member.email}</span>
                        <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-200">
                          {member.role}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.email)}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 cursor-pointer text-gray-200 hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name}
              className="bg-[#4B06C2] cursor-pointer flex-1 hover:bg-[#4B06C2]/80 text-white"
            >
              {isLoading ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
