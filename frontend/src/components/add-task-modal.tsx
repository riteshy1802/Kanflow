"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Calendar24 } from "./DatePicker"
import { useFormik } from "formik"
import { taskSchema } from "@/schemas/taskSchema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { MembersObject, MemberTypes, Task } from "@/types/form.types"
import { post } from "@/actions/common"
import { CREATE_TASK } from "@/constants/API_Endpoints"
import { useParams } from "next/navigation"


interface AddTaskModalProps {
  columnId: string
  onClose: () => void
  setAddingTask: (value: boolean) => void
}

export function AddTaskModal({ columnId, setAddingTask, onClose }: AddTaskModalProps) {
  const [newTag, setNewTag] = useState("")
  const [error, setError] = useState("")
  const params = useParams();
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const membersInTeam: MembersObject = queryClient.getQueryData<MembersObject>(['team_members', workspaceId]) ?? {
    creatorId: "",
    in_team: [],
    invited: []
  };


  useEffect(()=>{
    console.log(membersInTeam);
  },[membersInTeam])

  const handleAddTag = () => {
    if (newTag && !formik.values?.tags?.includes(newTag)) {
      formik.setFieldValue("tags", [...formik.values?.tags, newTag])
      setNewTag("")
      setError("")
    } else {
      setError("Tag Already Added")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    console.log("Tag clicked : ",tagToRemove);
    const tags = formik.values.tags.filter((tag) => tag !== tagToRemove)
    formik.setFieldValue("tags", tags)
  }

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    const assignees = formik.values.assignees.filter((assignee) => assignee !== assigneeToRemove)
    formik.setFieldValue("assignees", assignees)
  }

  const { mutate: createTask, isPending:creatingTask } = useMutation({
    mutationKey: ['createTask'],
    mutationFn: async (payload: Task) => {
      setAddingTask(true);
      console.log("Payload : ", payload)
      const res = await post(CREATE_TASK, payload)
      return res.payload
    },
    onSuccess: async() => {
      onClose()
      toast.success("Task created!")
      await queryClient.invalidateQueries({queryKey:['allTasks', workspaceId]})
      setAddingTask(false);
    },
    onError: () => {
      toast.error("Failed to create task!")
      setAddingTask(false);
    }
  })

  const formik = useFormik<Task>({
    initialValues: {
      workspaceId:workspaceId,
      title: "",
      description: "",
      status: columnId as Task['status'],
      priority: "medium" as Task['priority'],
      assignees: [] as string[],
      tags: [] as string[],
      dueDate: undefined,
    },
    validationSchema: taskSchema,
    onSubmit: (values) => {
      createTask(values)
    },
  })

  useEffect(()=>{
    console.log(formik.values);
    console.log("Formiik errors : ", formik.errors);
  },[formik.values, formik.errors])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate())

      const year = nextDate.getFullYear()
      const month = String(nextDate.getMonth()).padStart(2, '0')
      const day = String(nextDate.getDate()).padStart(2, '0')

      const formattedDate = `${year}-${month}-${day}`
      formik.setFieldValue("dueDate", formattedDate)
    } else {
      formik.setFieldValue("dueDate", undefined)
    }
  }


  const getDateForCalendar = (): Date | undefined => {
    if (formik.values.dueDate) {
      const [year, month, day] = formik.values.dueDate.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    return undefined
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-800 overflow-y-auto border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-gray-200 text-xs">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              placeholder="Enter task title"
              onBlur={formik.handleBlur}
              className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-500 text-[0.7rem]">{formik.errors.title}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-gray-200 text-xs">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Enter task description"
              onBlur={formik.handleBlur}
              rows={3}
              className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-[0.7rem]">{formik.errors.description}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="dueDate" className="text-gray-200 text-xs">
              Due Date
            </Label>
            <Calendar24
              date={getDateForCalendar()}
              onDateChange={handleDateChange}
              onBlur={() => formik.setFieldTouched("dueDate", true)}
            />
            {formik.touched.dueDate && formik.errors.dueDate && (
              <p className="text-red-500 text-[0.7rem]">{formik.errors.dueDate}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-200 text-xs">Priority</Label>
            <Select
              value={formik.values.priority}
              onValueChange={(value) => formik.setFieldValue("priority", value)}
              onOpenChange={(open) => {
                if (!open) {
                  formik.setFieldTouched("priority", true)
                }
              }}
            >
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
            {formik.touched.priority && formik.errors.priority && (
              <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.priority}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-200 text-xs">Assignees</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formik.values.assignees.includes(value)) {
                  const newAssignees = [...formik.values.assignees, value]
                  formik.setFieldValue("assignees", newAssignees)
                }
              }}
              onOpenChange={(open) => {
                if (!open) {
                  formik.setFieldTouched("assignees", true)
                }
              }}
            >
              <SelectTrigger className="bg-gray-700/50 cursor-pointer border-gray-600 text-gray-100">
                <SelectValue placeholder="Select assignees" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {membersInTeam?.in_team.map((member:MemberTypes) => (
                  <SelectItem key={member.userId} value={member.userId!} className="text-gray-100 hover:bg-gray-700">
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.assignees && formik.errors.assignees && (
              <p className="text-red-500 text-[0.7rem]">{formik.errors.assignees}</p>
            )}
            {formik.values.assignees.length > 0 && (
              <div className="flex flex-wrap gap-1 flex-wrap mt-3">
                {formik.values.assignees.map((assigneeId) => {
                  const member = membersInTeam?.in_team.find((m) => m.userId === assigneeId)
                  return member ? (
                    <div
                      key={member.userId}
                      className="flex rounded-xl items-center gap-1 px-2 py-1 rounded bg-gray-600 text-gray-200 text-xs"
                    >
                      {member.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-red-400"
                        onClick={() => handleRemoveAssignee(assigneeId)}
                      />
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-200 text-xs">Tags</Label>
            <div className="flex gap-2 flex">
              <Input
                name="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                className="bg-[#4B06C2] hover:bg-[#4B06C2]/90 cursor-pointer text-white"
              >
                Add
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-[0.7rem]">{error}</p>
            )}
            {formik.touched.tags && formik.errors.tags && (
              <p className="text-red-500 text-[0.7rem] mt-1">{formik.errors.tags}</p>
            )}
            <div className="flex items-center gap-1 mt-3 flex-wrap">
              {formik.values.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex rounded-xl items-center gap-1 px-2 py-1 rounded bg-gray-600 text-gray-200 text-xs"
                >
                  {tag}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-red-400"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </div>
              ))}
            </div>

          </div>

          <div className="flex gap-2">
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
              disabled={!formik.isValid || formik.isSubmitting}
              className="bg-[#4B06C2] flex-1 hover:bg-[#4B06C2]/90 cursor-pointer text-white"
            >
              {creatingTask && <span className="loader-2"></span>}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
