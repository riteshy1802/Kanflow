"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

interface AddMemberModalProps {
  onClose: () => void
  onAddMembers: (members: Array<{ email: string; role: string }>) => void
}

export function AddMemberModal({ onClose, onAddMembers }: AddMemberModalProps) {
  const [emails, setEmails] = useState<Array<{ email: string; role: string }>>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [currentRole, setCurrentRole] = useState("user")

  const handleAddEmail = () => {
    if (currentEmail && !emails.find((e) => e.email === currentEmail)) {
      setEmails([...emails, { email: currentEmail, role: currentRole }])
      setCurrentEmail("")
      setCurrentRole("user")
    }
  }

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e.email !== emailToRemove))
  }

  const handleSendInvites = () => {
    if (emails.length === 0) return

    toast("Invites sent successfully")
    onAddMembers(emails)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Add Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Email Address</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
              />
              <Select value={currentRole} onValueChange={setCurrentRole}>
                <SelectTrigger className="w-24 cursor-pointer bg-gray-700/50 border-gray-600 text-gray-100">
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
            </div>
          </div>

          {emails.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-200 text-xs">Added Members</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {emails.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700/30 p-2 rounded border border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-200">{member.email}</span>
                      <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-200">
                        {member.role}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmail(member.email)}
                      className="text-gray-400 cursor-pointer hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 cursor-pointer text-gray-200 hover:bg-gray-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvites}
              disabled={emails.length === 0}
              className="bg-[#4508B3] cursor-pointer flex-1 hover:bg-[#4508B3]/80 text-white"
            >
              Send Invites
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}