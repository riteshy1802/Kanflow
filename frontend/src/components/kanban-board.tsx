"use client"

import { useEffect, useState } from "react"
import { KanbanColumn } from "@/components/kanban-column"
import { TaskDetail } from "@/components/task-detail"
import { AddMemberModal } from "@/components/add-member-modal"
import { FilterDropdown } from "@/components/filter-dropdown"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Pen, X } from "lucide-react"
import { getColorForName } from "@/functions/getAvatarColor"
import { Input } from "./ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { post } from "@/actions/common"
import { GET_ALL_TEAM_MEMBERS, GET_WORKSPACE, UPDATE_WORKSPACE_NAME } from "@/constants/API_Endpoints"
import { Skeleton } from "./ui/skeleton"
import { avatarCharacters } from "@/functions/AvatarCharacter"
import AvatarTeamSkeleton from "./skeletons/AvatarTeamSkeleton"
import TeamMemberCard from "./team-member-card"
import toast from "react-hot-toast"

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

interface UpdateBoardNameType{
  workspaceNewName:string,
  workspaceId:string
}

interface Member {
  member_id: string
  userId:string | null
  name: string
  email: string | null
  privilege: "admin" | "user",
  updated_at: string
  status:"accepted" | "pending" | "rejected"
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
  const [activeTabMembers, setActiveTabMembers] = useState("in_team");
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

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const workspaceNameTrack = workspaceData?.name

  const [boardName, setBoardName] = useState(workspaceData?.name || "")

  const handleTeamMembersFetch = async() => {
    try {
      const payload = {workspaceId}
      const res = await post(GET_ALL_TEAM_MEMBERS,payload);
      return res.payload;
    } catch (error) {
      console.log("Some error occured while fetching the team members : ", error);
    }
  }

  // membersData contains : in_team, invited
  const {data:membersData, isLoading:loadingMembersData} = useQuery({
    queryKey:['team_members',workspaceId],
    queryFn:handleTeamMembersFetch,
    enabled:!!workspaceId
  })

  useEffect(()=>{
    console.log("Members Data : ", membersData);
  },[membersData])

  useEffect(()=>{
    setBoardName(workspaceData?.name);
  },[workspaceData]);

  const{mutate:updateProjectName, isPending:updatingProjectName} = useMutation({
    mutationKey:['update-project-name'],
    mutationFn:async(payload:UpdateBoardNameType)=>{
      const res = await post(UPDATE_WORKSPACE_NAME,payload)
      return res;
    },
    onSuccess:()=>{
      toast.success("Update successful!")
      setIsEditingName(false);
    },onError:()=>{
      toast.success("Couldn't update name!")
      setBoardName(workspaceNameTrack);
    }
  })

  const handleUpdateBoardName = async() => {
    try {
      const payload = {
        workspaceNewName:boardName,
        workspaceId:workspaceId
      }
      updateProjectName(payload);
    } catch (error) {
      console.log("Some error occured while updating the project name : ", error);
    }
  }


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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUpdateBoardName();
                      }
                    }}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="border-slate-600/50 min-w-88 text-2xl font-bold text-gray-100 placeholder-slate-400 focus:border-[#4b06c2]/50 focus:ring-[#4b06c2]/20"
                  />
                  {updatingProjectName?
                    <svg aria-hidden="true" className="w-5 h-5 ml-2 text-gray-100 animate-spin dark:text-gray-600 fill-[#580BDB]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
                    :
                    <X
                    onClick={() => setIsEditingName(false)}
                    className="inline-block ml-2 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-200"
                  />}
                </div>
              ) : (
                isFetchingWorkspaceData ? 
                  <Skeleton className="h-8 w-72 rounded-md bg-gray-600/50"/>
                :
                  <div className="w-full flex gap-2 items-center">
                    <h1 className="text-2xl font-bold text-gray-100">{boardName}</h1>
                    <Pen
                      onClick={() => setIsEditingName(true)}
                      className="inline-block ml-2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-200"
                    />
                  </div>
              )}

            </div>
            <div className="flex items-center gap-3">
              {/* Team Avatars */}
              {loadingMembersData ? <AvatarTeamSkeleton/>:
              <div className="flex -space-x-2">
                {membersData?.in_team.slice(0, 5).map((member:Member) => (
                  <Tooltip key={member.userId}>
                    <TooltipTrigger>
                      <Avatar className="h-8 w-8 border-2 border-gray-800">
                        <AvatarFallback
                          className="text-white text-xs font-medium"
                          style={{ backgroundColor: getColorForName(member?.name) }}
                        >
                          {avatarCharacters(member?.name) || "U"}
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
              </div>}
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
                  <div className="space-y-4 ">
                    <div className="flex w-full items-center justify-center gap-6">
                      <button
                        onClick={() => setActiveTabMembers("in_team")}
                        className={`pb-2 border-b-2 cursor-pointer text-sm transition-colors ${
                          activeTabMembers==="in_team"
                            ? "border-[#580bdb] text-[#580bdb] font-semibold"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        In Team
                      </button>
                      <button
                        onClick={() => setActiveTabMembers("invited")}
                        className={`pb-2 border-b-2 cursor-pointer text-sm transition-colors ${
                          activeTabMembers==="invited"
                            ? "border-[#580bdb] text-[#580bdb] font-semibold"
                            : "border-transparent text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        Invited
                      </button>
                    </div>
                    {activeTabMembers==="in_team" && membersData?.in_team?.map((member:Member) => (
                      <TeamMemberCard key={member.userId} member={member} tab={activeTabMembers}/>
                    ))}
                    {activeTabMembers==="invited" && membersData?.invited?.map((member:Member) => (
                      <TeamMemberCard key={member.userId || member.member_id} member={member} tab={activeTabMembers}/>
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
