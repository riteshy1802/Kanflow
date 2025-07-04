"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useFormik } from "formik"
import { createWorkspaceSchema } from "@/schemas/createWorkspaceSchema"
import { createWorkspace, Member } from "@/types/form.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { post } from "@/actions/common"
import { CREATE_WORKSPACE } from "@/constants/API_Endpoints"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface CreateKanbanFormProps {
  onClose: () => void
}

export function CreateKanbanForm({ onClose }: CreateKanbanFormProps) {
  const [memberEmail, setMemberEmail] = useState("");
  const [privilege, setPrivilege] = useState("user");
  const router = useRouter();
  const [error,setError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const queryClient = useQueryClient();

  const handleEmailCheck = (email:string) => {
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }else{
      setError("")
    }
  }

  const handleAddMember = () => {
    if(memberEmail.length===0){
      setError("Email is required")
      return;
    }
    const isPresent = formik.values.team_members.some((member:Member)=>member.email===memberEmail);
    if(isPresent){
      setError("Member already Added");
      return;
    }
    const payload = {
      email:memberEmail,
      privilege:privilege,
      status:"pending"
    }
    formik.setFieldValue("team_members", [...formik.values.team_members, payload]);
    setMemberEmail("");
    setPrivilege("user");
    setError("");
  }

  const {mutate:createNewWorkspace, isPending:isCreatingWorkspace} = useMutation({
    mutationKey:['creating-workspace'],
    mutationFn: (payload:createWorkspace) => post(CREATE_WORKSPACE, payload),
    onSuccess:(data)=>{
      toast.success("WorkSpace created successfully");
      router.push(`/workspace/${data?.payload?.workspaceId}`)
      queryClient.invalidateQueries({queryKey : ['all-workspaces']})
      onClose()
    },
    onError:(error)=>{
      console.log("Some Error in the workspace creation : ", error);
    }
  })

  const handleSubmitWorkspaceCreation = (values:createWorkspace) => {
    try {
      console.log("Values:  ", values);
      createNewWorkspace(values);
    } catch (error) {
      console.log("Error occured while creating workspace : ", error);
    }
  }

  const formik = useFormik({
    initialValues:{
      name:"",
      description:"",
      team_members:[],
      message:""
    },
    validationSchema:createWorkspaceSchema,
    onSubmit:async(values)=>handleSubmitWorkspaceCreation(values)
  })

  const handleRemoveMember = (email: string) => {
    const filteredTeamMembers = formik.values.team_members.filter((member:Member)=>member.email!=email)
    formik.setFieldValue("team_members",filteredTeamMembers);
  }

  useEffect(()=>{
    if(formik.values.team_members.length===0){
      formik.setFieldValue("message","");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[formik.values.team_members])


  return (
    <div className="h-full w-full flex items-center justify-center p-6 overflow-y-auto" style={{ backgroundColor: "#1a1a1a" }}>
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Create New Kanban Board</h1>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200 text-xs">
              Project Name
            </Label>
            <Input
              id="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              placeholder="Enter project name"
              onBlur={formik.handleBlur}
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
            {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-200 text-xs">
              Project Description
            </Label>
            <Textarea
              id="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Describe your project..."
              rows={4}
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-200 text-xs">Team Members</Label>
            <div className="flex items-center justify-center gap-2">
              <Input
                value={memberEmail}
                onChange={(e) => {
                  setMemberEmail(e.target.value)
                  handleEmailCheck(e.target.value);
                }}
                placeholder="Enter email address"
                type="email"
                className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
              />
              <Select value={privilege} onValueChange={setPrivilege}>
                <SelectTrigger className="w-32 cursor-pointer bg-gray-700/50 border-gray-600  text-gray-100">
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
            {error.length>0 && (
              <p className="text-red-500 text-[0.7rem]">{error}</p>
            )}

            {formik.values.team_members.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Added members:</p>
                <div className="space-y-2">
                  {formik.values.team_members.map((member:Member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between bg-gray-700/30 p-2 rounded border border-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200">{member.email}</span>
                        <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-200">
                          {member.privilege}
                        </Badge>
                      </div>
                      <Button
                        type="button"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-200 text-xs">
              Message
            </Label>
            <Textarea
              id="message"
              value={formik.values.message}
              disabled={formik.values.team_members.length===0}
              onChange={formik.handleChange}
              placeholder="Give a message to your invitees... (Optional)"
              onBlur={formik.handleBlur}
              className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isCreatingWorkspace || !formik.values.name || !formik.values.description}
              className="bg-[#4B06C2] cursor-pointer flex-1 hover:bg-[#4B06C2]/80 text-white"
            >
              {isCreatingWorkspace && <span className="loader-2"></span> }
              {isCreatingWorkspace ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
