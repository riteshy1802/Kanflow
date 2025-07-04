"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Edit3, ChevronsUp, Dot, ChevronsDown, Calendar, User, Tag, AlertCircle, ShieldAlert } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar24 } from "./DatePicker"
import { Input } from "./ui/input"
import { getColorForName } from "@/functions/getAvatarColor"
import { TaskDetailSkeleton } from "./skeletons/TaskDetailSkeleton"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { post } from "@/actions/common"
import { GET_TASK_DETAILS, UPDATE_TASK, DELETE_TASK } from "@/constants/API_Endpoints"
import { MembersObject, MemberTypes, Task, TaskDetailed } from "@/types/form.types"
import { avatarCharacters } from "@/functions/AvatarCharacter"
import toast from "react-hot-toast"


interface TaskDetailProps {
  members: MembersObject
  onClose: () => void
  taskId:string | undefined
}

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/20",
  low: "text-green-400 bg-green-400/20",
}

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
]

export function TaskDetail({  members, onClose, taskId }: TaskDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [originalDetails, setOriginalDetails] = useState<TaskDetailed>()
  const [updateDetails, setUpdateDetails] = useState<TaskDetailed>()
  const [enableUpdateButton, setEnableUpdateButton] = useState(false);

  const {data:taskDetail, isLoading:fetchingTaskDetail} = useQuery({
    queryKey:['task-detail', taskId],
    queryFn:async() => handleTaskDetailFetch(taskId)
  })

  const [editedDescription, setEditedDescription] = useState(taskDetail?.description)
  const [editedTask, setEditedTask] = useState(taskDetail)
  const [editedAssignees, setEditedAssignees] = useState(taskDetail?.assignees)
  const [editedTags, setEditedTags] = useState("")
  const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(undefined)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("")
  const params = useParams();
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient();

  useEffect(()=>{
    console.log("Member : ", members);
  },[members])

  const handleTaskDetailFetch = async(taskId:string|undefined) => {
    if(!taskId) return;
    try {
      const payload = {
        task_id:taskId,
        workspaceId
      }
      const res = await post(GET_TASK_DETAILS, payload)
      return res.payload.task_detail;
    } catch (error) {
      console.log("Some error occured while fetching the details of the task!",error);
    }
  }

  const updateTaskMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (updatePayload: any) => {
      const payload = {
        task_id: taskId,
        workspaceId,
        ...updatePayload
      }
      return await post(UPDATE_TASK, payload)
    },
    onSuccess: () => {
      setIsEditing(false)
      setEnableUpdateButton(false)
      toast.success("Task updated!");
      queryClient.invalidateQueries({queryKey:['task-detail', taskId]});
      queryClient.invalidateQueries({ queryKey: ['allTasks', workspaceId] })
    },
    onError:()=>{
      console.log("Some error occured while updating the task!")
      toast.error("Update failed!");
    }
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        taskId: taskId,
        workspaceId
      }
      console.log("Paylaod : ", payload);
      return await post(DELETE_TASK, payload)
    },
    onSuccess: () => {
      onClose()
      toast.success("Task deleted!");
      queryClient.invalidateQueries({queryKey:['task-detail', taskId]});
      queryClient.invalidateQueries({ queryKey: ['allTasks', workspaceId] })
    },
    onError : () => {
      console.log("Some error occured while deleting the Task!");
      toast.error("Couldn't delete the task!");
    }
  })

  useEffect(()=>{
    console.log("Data : ", taskDetail);
    if(taskDetail) {
      setOriginalDetails(taskDetail);
      setUpdateDetails(taskDetail);
      setEditedDescription(taskDetail.description);
      setEditedTask(taskDetail);
      setEditedTitle(taskDetail.title);
      setEditedAssignees(taskDetail.assignees);
      setEditedTags(taskDetail.tags?.join(", ") || "");
      setEditedDueDate(taskDetail.dueDate ? new Date(taskDetail.dueDate) : undefined);
    }
  },[taskDetail])

  useEffect(()=>{
    if(taskDetail) {
      const currentState = {
        ...taskDetail,
        title: editedTitle,
        description: editedDescription,
        assignees: editedAssignees,
        tags: editedTags.split(",").map(tag => tag.trim()).filter(tag => tag),
        dueDate: editedDueDate ? editedDueDate.toISOString().split('T')[0] : taskDetail.dueDate,
        priority: editedTask?.priority,
        status: editedTask?.status
      }
      setUpdateDetails(currentState);
    }
  },[editedTitle, editedDescription, editedAssignees, editedTags, editedDueDate, editedTask, taskDetail])

  useEffect(()=>{
    if(JSON.stringify(updateDetails)===JSON.stringify(originalDetails)){
      setEnableUpdateButton(false)
    }else{
      setEnableUpdateButton(true);
    }
  },[updateDetails, originalDetails])

  const handleSave = () => {
    if(originalDetails && updateDetails) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: any = {}
      
      if(originalDetails.title !== updateDetails.title) {
        updatePayload.title = updateDetails.title
      }
      if(originalDetails.description !== updateDetails.description) {
        updatePayload.description = updateDetails.description
      }
      if(JSON.stringify(originalDetails.assignees) !== JSON.stringify(updateDetails.assignees)) {
        updatePayload.assignees = updateDetails.assignees
      }
      if(JSON.stringify(originalDetails.tags) !== JSON.stringify(updateDetails.tags)) {
        updatePayload.tags = updateDetails.tags
      }
      if(originalDetails.dueDate !== updateDetails.dueDate) {
        updatePayload.dueDate = updateDetails.dueDate
      }
      if(originalDetails.priority !== updateDetails.priority) {
        updatePayload.priority = updateDetails.priority
      }
      if(originalDetails.status !== updateDetails.status) {
        updatePayload.status = updateDetails.status
      }

      updateTaskMutation.mutate(updatePayload)
    }
  }

  const handleDelete = () => {
    deleteTaskMutation.mutate()
  }
  
  const priorityColor = PRIORITY_COLORS[updateDetails?.priority || 'medium']

  const taskMembers = members.in_team?.filter((member) => taskDetail?.assignees?.includes(member.userId))

  const handleCancel = () => {
    if(taskDetail) {
      setEditedDescription(taskDetail.description)
      setEditedTask(taskDetail)
      setEditedAssignees(taskDetail.assignees)
      setEditedTags(taskDetail.tags?.join(", ") || "")
      setEditedDueDate(taskDetail.dueDate ? new Date(taskDetail.dueDate) : undefined)
    }
    setIsEditing(false)
  }

  return (
    <>
    {fetchingTaskDetail 
      ? 
    <TaskDetailSkeleton/> 
    : 
    <div
      className="fixed inset-y-0 right-0 w-2/5 border-l border-gray-700/20 slide-in-right z-50 flex flex-col shadow-2xl"
      style={{ width: "35%", backgroundColor: "#1A191C" }}
    >
      <div className="p-6 border-b border-gray-700/20 overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center flex-1">
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                className="text-xl w-[80%] font-semibold pr-4 leading-tight text-gray-100 bg-gray-700/50 border-gray-600 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                autoFocus
              />
            ) : (
              <div className="flex items-center">
                <h2 className="text-xl font-semibold pr-4 leading-tight text-gray-100">{taskDetail?.title}</h2>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                  setIsEditingTitle(true);
                }}
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

        <div className="space-y-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Assignee</span>
            </div>
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
                  {members.in_team.map((member) => (
                    <SelectItem key={member.userId} value={member.userId ?? ""} className="text-gray-100 hover:bg-gray-700">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-1 flex-wrap">
                {taskMembers?.map((member) => (
                  <div key={member.userId} className="flex items-center gap-1 px-2 bg-gray-600/30 rounded-md py-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback style={{backgroundColor:getColorForName(member.name)}} className="text-white text-[0.5rem] font-medium">
                        {avatarCharacters(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-200">{member.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditing && editedAssignees.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {editedAssignees.map((assigneeId:string) => {
                const member = members.in_team?.find((m:MemberTypes) => m.userId === assigneeId)
                return member ? (
                  <div key={assigneeId} className="gap-1 text-xs px-2 py-1 rounded-md flex items-center bg-gray-600 text-gray-200">
                    {member?.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setEditedAssignees(editedAssignees?.filter((id:string) => id !== assigneeId))}
                    />
                  </div>
                ) : null
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Status</span>
            <Select
              value={editedTask?.status}
              disabled={!isEditing}
              onValueChange={(value) => {
                const updatedTask = { ...editedTask, status: value as Task["status"] }
                setEditedTask(updatedTask)
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
              <Calendar24 
                date={editedDueDate} 
                onDateChange={setEditedDueDate}
              />
            ) : (
              <span className="text-sm text-gray-200">{taskDetail?.dueDate}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Priority</span>
              <Select
                value={editedTask?.priority}
                disabled={!isEditing}
                onValueChange={(value) => {
                  const updatedTask = { ...editedTask, priority: value as Task["priority"] }
                  setEditedTask(updatedTask)
                }}
              >
                <SelectTrigger className={`w-32 cursor-pointer text-[0.8rem] h-6 px-2 gap-1 ${priorityColor} border-gray-600`}>
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
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {taskDetail?.tags?.map((tag:string) => (
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
                    value={editedTags}
                    onChange={(e) => setEditedTags(e.target.value)}
                    placeholder="Enter tags (comma separated)"
                    required
                    className="bg-slate-800/60 border-slate-600/50 text-slate-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                />
                <p className="text-xs mt-2 text-[gray]">Enter comma seperated tags</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div>
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
                  <Button 
                    onClick={handleSave} 
                    disabled={!enableUpdateButton || updateTaskMutation.isPending} 
                    size="sm" 
                    className="bg-[#4b06c2] cursor-pointer flex-1 hover:bg-[#4b06c2]/80 text-white"
                  >
                    {updateTaskMutation.isPending ? <span className="loader-2"></span> : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">{taskDetail?.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!isEditing && <div className="w-[100%] mt-auto px-5 py-4">
        <Button 
          onClick={handleDelete}
          disabled={deleteTaskMutation.isPending}
          className="w-full cursor-pointer hover:bg-red-800 bg-red-700 text-sm text-white transition duration-200"
        >
          {deleteTaskMutation.isPending ? <span className="loader-2"></span> : "Delete Task"}
        </Button>
      </div>}
    </div>}
    </>
  )
}