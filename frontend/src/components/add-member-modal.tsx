"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useFormik } from "formik"
import { InviteMembersSchema } from "@/schemas/inviteMembersSchema"
import { InviteMembers, Member } from "@/types/form.types"
import toast from "react-hot-toast"
import { post } from "@/actions/common"
import { SEND_INVITE } from "@/constants/API_Endpoints"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Textarea } from "./ui/textarea"

interface AddMemberModalProps {
  onClose: () => void
}

export function AddMemberModal({ onClose }: AddMemberModalProps) {
  const [currentEmail, setCurrentEmail] = useState("")
  const [currentRole, setCurrentRole] = useState<"admin" | "user">("user")
  const [error, setError] = useState("")
  const {workspaceId} = useParams()
  const queryClient = useQueryClient();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const {mutate:sendInvites, isPending:isSendingInvites} = useMutation({
    mutationKey:['sending-invites'],
    mutationFn:async(payload:InviteMembers) => post(SEND_INVITE, payload),
    onSuccess: (data) => {
      const payload = data.payload || {};

      const new_invites=payload?.new_invites?.length;
      const reinvitations=payload?.reinvitations?.length;
      const already_in_team=payload?.already_in_team?.length

      const messages = [];
      if (new_invites > 0) messages.push(`${new_invites} new`);
      if (reinvitations > 0) messages.push(`${reinvitations} re-invited`);
      if (already_in_team > 0) messages.push(`${already_in_team} in team`);

      const finalMsg = `Invites sent: ${messages.join(", ")}`;
      queryClient.invalidateQueries({queryKey:['team_members',workspaceId]})
      toast.success(finalMsg);
      
      console.log("Invites sent successfully!");
      setCurrentEmail("");
      setCurrentRole("user");
      onClose();
    },
    onError:(error)=>{
      toast.error("Couldn't send invites")
      console.log("Some error occured while sending invites : ", error.message)
    }
  })

  const handleInvitesSend = (values:InviteMembers) => {
    try {
      sendInvites(values);
    } catch (error) {
      console.log("Some error occured while sending invites: ", error);
      toast.error("Couldn't send invites");
    }
  }

  const formik = useFormik<InviteMembers>({
    initialValues: {
      workspaceId: Array.isArray(workspaceId) ? workspaceId[0] : (workspaceId || null),
      team_members: [],
      message:""
    },
    validationSchema: InviteMembersSchema,
    onSubmit: (values) => handleInvitesSend(values)
  })

  useEffect(()=>{
    if(formik.values.team_members.length===0){
      formik.setFieldValue("message","");
    }
  },[formik.values.team_members])

  const handleAddMember = () => {
    if (!emailRegex.test(currentEmail)) {
      setError("Please enter a valid email address")
      return
    }

    const alreadyExists = formik.values.team_members.some((member) => member.email === currentEmail)
    if (alreadyExists) {
      setError("Member already added")
      return
    }

    const newMember: Member = {
      email: currentEmail,
      privilege: currentRole,
      status: "pending"
    }

    formik.setFieldValue("team_members", [...formik.values.team_members, newMember])
    setCurrentEmail("")
    setCurrentRole("user")
    setError("")
  }

  const handleRemoveMember = (email: string) => {
    const filtered = formik.values.team_members.filter((member) => member.email !== email)
    formik.setFieldValue("team_members", filtered)
  }


  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Add Team Members</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Email Address</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
              />
              <Select value={currentRole} onValueChange={(value)=>setCurrentRole(value as "admin"|"user")}>
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
            {error && <p className="text-red-500 text-[0.7rem]">{error}</p>}
          </div>

          {formik.values.team_members.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-200 text-xs">Added Members</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {formik.values.team_members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-700/30 p-2 rounded border border-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-200">{member.email}</span>
                      <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-200">
                        {member.privilege}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.email)}
                      className="text-gray-400 cursor-pointer hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-200 text-xs">
              Message
            </Label>
            <Textarea
              id="message"
              value={formik.values.message}
              onChange={formik.handleChange}
              disabled={formik.values.team_members.length===0}
              placeholder="Give a message to your invitees... (Optional)"
              onBlur={formik.handleBlur}
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="w-full flex gap-2 ml-auto">
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
              disabled={formik.values.team_members.length === 0 || isSendingInvites}
              className={`flex-1 cursor-pointer text-white transition-colors duration-200 ${
                formik.values.team_members.length === 0 || isSendingInvites
                  ? "bg-gray-500 cursor-not-allowed opacity-60"
                  : "bg-[#4508B3] hover:bg-[#4508B3]/80"
              }`}
            >
              {isSendingInvites && <span className="loader-2 mr-2" />}
              {isSendingInvites ? "Inviting..." : "Send Invites"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
