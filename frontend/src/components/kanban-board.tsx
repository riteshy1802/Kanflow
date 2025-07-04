"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { post } from "@/actions/common"
import { CHECK_PRIVILEGE, GET_ALL_TEAM_MEMBERS, GET_WORKSPACE, UPDATE_WORKSPACE_NAME, GET_ALL_TASKS, EXPORT_BOARD } from "@/constants/API_Endpoints"
import { Skeleton } from "./ui/skeleton"
import { avatarCharacters } from "@/functions/AvatarCharacter"
import AvatarTeamSkeleton from "./skeletons/AvatarTeamSkeleton"
import TeamMemberCard from "./team-member-card"
import toast from "react-hot-toast"
import NotFound from "./NotFound/NotFound"
import BoardSkeleton from "./skeletons/BoardSkeleton"
import { ProgressObject, TaskObject, User } from "@/types/form.types"
import Progress from "./Progress/Progress"
import { postBlob } from "@/axios/axios"

interface Member {
  member_id: string
  userId:string | null
  name: string
  email: string | null
  privilege: "admin" | "user",
  updated_at: string
  status:"accepted" | "pending" | "rejected"
}

interface MembersObject{
  creatorId:string
  in_team:Member[]
  invited:Member[]
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
  { id: "in_progress", title: "IN PROGRESS", color: "bg-yellow-500" },
  { id: "blocked", title: "BLOCKED", color: "bg-red-500" },
  { id: "in_review", title: "IN REVIEW", color: "bg-blue-500" },
  { id: "done", title: "DONE", color: "bg-green-500" },
]

export function KanbanBoard() {
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks")
  const router = useRouter()
  const searchParams = useSearchParams();
  const isPrintPage = searchParams.get('print') === "true"
  const [isFilterOpen,setIsFilterOpen] = useState<boolean>(false);
  const [openDetailedView, setOpenDetailedView] = useState(false)
  const [currentActiveTask, setCurrentActiveTask] = useState<string>()
  const [isEditingName, setIsEditingName] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [isAdmin,setIsAdmin] = useState(false);
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [activeTabMembers, setActiveTabMembers] = useState("in_team");
  const [notFound ,setNotFound] = useState(false);
  const queryClient = useQueryClient();
  const userData:User = queryClient.getQueryData<User>(['user']) ?? {
    userId:"",
    email:"",
    name:""
  } 
  const membersInTeam: MembersObject = queryClient.getQueryData<MembersObject>(['team_members', workspaceId]) ?? {
      creatorId: "",
      in_team: [],
      invited: []
    };

  const [filters, setFilters] = useState({
    severity: "all",
    createdBy: "all",
    searchTitle: "",
    sortBy: "lastUpdated",
  })

  const filterRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
      setIsFilterOpen(false)
    }
  }

  useEffect(() => {
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isFilterOpen])


  useEffect(()=>{
    console.log("currentActiveTask : ",currentActiveTask);
  },[currentActiveTask])

  const handleFetchAllTasks = async() => {
    try{
      const res = await post(GET_ALL_TASKS, {workspaceId})
      return res.payload.tasks
    }catch(err){
      console.log("Some error occured :",err);
    }
  }  
  
  const {data:allTasks, isLoading:fetchingAllTasks} = useQuery({
    queryKey:['allTasks', workspaceId],
    queryFn:handleFetchAllTasks,
    enabled: !!workspaceId,
  })

  const filteredAndSegregatedTasks = useMemo(() => {
    if (!allTasks) return {}
  
    const filtered = allTasks.filter((task: TaskObject) => {
      const matchesTitle = task.title.toLowerCase().includes(filters.searchTitle.toLowerCase())
      const matchesSeverity = filters.severity === "all" || task.priority === filters.severity
  
      const currentUserId = userData?.userId
      const matchesCreatedBy =
        filters.createdBy === "all" ||
        (filters.createdBy === "me" && task.created_by === currentUserId) ||
        (filters.createdBy === "others" && task.created_by !== currentUserId)

  
      return matchesTitle && matchesSeverity && matchesCreatedBy;
    })
  
    const sorted = filtered.sort((a:TaskObject, b:TaskObject) => {
      if (filters.sortBy === "lastUpdated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      } else if (filters.sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (filters.sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return 0
    })
  
    return sorted.reduce((acc: Record<string, TaskObject[]>, task: TaskObject) => {
      const statusKey = task.status.replace('-', '_')
      if (!acc[statusKey]) {
        acc[statusKey] = []
      }
      acc[statusKey].push(task)
      return acc
    }, {})
  
  }, [allTasks, filters, userData.userId])

  const {
    data:currentPrivilege,
    isLoading: checkingPrivilege,
  } = useQuery({
    queryKey: ['userPrivilege', workspaceId],
    queryFn: async () => {
      const res = await post(CHECK_PRIVILEGE, { workspaceId });
      return res.payload;
    },
    enabled: !!workspaceId,
  });

  useEffect(() => {
    if (currentPrivilege) {
      setIsAdmin(currentPrivilege.admin);
      console.log("Privilege found Is Admin? : ", currentPrivilege.admin);
    }
  }, [currentPrivilege]);

  const getWorkspaceData = async () => {
    try {
      setNotFound(false);
      const res = await post(GET_WORKSPACE, { workspaceId });
      console.log("API Response:", res);
      console.log("Workspace data : ", res.payload);
      setNotFound(false)
      return res.payload;
    } catch (error) {
      console.log("Error while fetching workspace data:", error);
      setNotFound(true);
      throw error;
    }
  };

  const { data: workspaceData, isLoading: isFetchingWorkspaceData } = useQuery({
    queryKey: ['workspace-data', workspaceId],
    queryFn: getWorkspaceData,
    enabled: !!workspaceId,
    retry:false
  });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!workspaceData && !isFetchingWorkspaceData) {
      timeout = setTimeout(() => {
        setNotFound(true);
      }, 1000);
    }

    if (workspaceData && !notFound) {
      setNotFound(false);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceData, isFetchingWorkspaceData]);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const workspaceNameTrack = workspaceData?.name

  const [boardName, setBoardName] = useState(workspaceData?.name.trim() || "")

  const handleTeamMembersFetch = async() => {
    try {
      const payload = {workspaceId}
      const res = await post(GET_ALL_TEAM_MEMBERS,payload);
      return res.payload;
    } catch (error) {
      console.log("Some error occured while fetching the team members : ", error);
    }
  }

  useEffect(()=>{
    console.log("Check privilege : ", checkingPrivilege);
  },[checkingPrivilege])

  const {data:membersData, isLoading:loadingMembersData} = useQuery({
    queryKey:['team_members',workspaceId],
    queryFn:handleTeamMembersFetch,
    enabled:!!workspaceId,
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

  const [progress, setProgress] = useState<ProgressObject[]>([
    { name: "todo", count: 0, bgColor: "bg-[#697283]/80" },
    { name: "in_progress", count: 0, bgColor: "bg-[#F0B000]/80" },
    { name: "blocked", count: 0, bgColor: "bg-[#fa2c36]/80" },
    { name: "in_review", count: 0, bgColor: "bg-[#2B7FFF]/80" },
    { name: "done", count: 0, bgColor: "bg-[#00C950]/80" },
  ]);

  const someHasCount = progress.some((item)=>item.count!=0);

  const getTasksForColumn = (columnId: string) => {
    return filteredAndSegregatedTasks[columnId] || [];
  };

  const { mutateAsync: exportPdf } = useMutation({
    mutationKey: ['export', workspaceId],
    mutationFn: async () => await postBlob(EXPORT_BOARD, { workspaceId }),
    onError: () => {
      toast.error('Failed to download board');
    },
  });

  const handleExportBoard = async () => {
    router.push(`/workspace/${workspaceId}?print=true`);
    await new Promise((res) => setTimeout(res, 3000));

    try {
      const response = await exportPdf();
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kanban-board.pdf';
      a.click();
      await new Promise((res) => setTimeout(res, 2000));

      toast.success('Board downloaded!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Download failed');
    } finally {
      router.push(`/workspace/${workspaceId}`);
    }
  };


  useEffect(() => {
    const updatedProgress = progress.map((col) => ({
      ...col,
      count: filteredAndSegregatedTasks[col.name]?.length || 0,
    }));

    setProgress(updatedProgress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAndSegregatedTasks]);

  useEffect(()=>{
    console.log("Progress : ", progress);
  },[progress])

  useEffect(() => {
    if (
      !fetchingAllTasks &&
      !isFetchingWorkspaceData &&
      !loadingMembersData &&
      !checkingPrivilege &&
      allTasks &&
      workspaceData &&
      membersData &&
      typeof window !== "undefined"
    ) {
      console.log("✅ Marking page as ready - all data loaded");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).isPageReady = true;
    }
  }, [
    fetchingAllTasks,
    isFetchingWorkspaceData,
    loadingMembersData,
    checkingPrivilege,
    allTasks,
    workspaceData,
    membersData
  ]);

  useEffect(()=>{
    console.log("IsprintScreen : ", isPrintPage);
  },[isPrintPage]);


  if(notFound){
    return <NotFound/>
  }

  return (
    <>
      <TooltipProvider>
        <div className="h-full overflow-auto flex flex-col" style={{ backgroundColor: "#1D1D1F" }}>
          <div className="px-6 pb-3 pt-6">
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
                          console.log("Workspace name : ", workspaceData?.name)
                          console.log("Board name : ", boardName);
                          if(workspaceData?.name===boardName.trim()){
                            setIsEditingName(false);
                          }else{
                            handleUpdateBoardName();
                          }
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
                      {isAdmin || isPrintPage && <Pen
                        onClick={() => setIsEditingName(true)}
                        className="inline-block ml-2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-200"
                      />}
                    </div>
                )}

              </div>
              <div className="flex items-center gap-3">
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
                  {membersData?.in_team?.length > 5 && (
                    <Avatar className="h-8 w-8 border-2 border-gray-800">
                      <AvatarFallback className="bg-gray-600 text-xs text-gray-200">+{membersData?.in_team?.length - 5}</AvatarFallback>
                    </Avatar>
                  )}
                </div>}
                <div className="w-full">
                  {
                    checkingPrivilege ? 
                    <div className="w-[110px]">
                      <Skeleton className="w-full max-w-[200px] rounded-md bg-gray-600/50 h-9" />
                    </div>
                    :
                    <>
                      {isAdmin || isPrintPage && <Button onClick={() => setShowAddMember(true)} className="bg-[#580bdb] hover:bg-[#580bdb]/80 cursor-pointer text-xs text-white">
                        Add Member
                      </Button>}
                    </>
                  }
                </div>
              </div>
            </div>

            {!isPrintPage && <div className="flex items-center justify-between">
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

              <div className="flex items-center gap-3">
                {activeTab === "tasks" && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div onClick={()=>handleExportBoard()} className="p-2 rounded-md bg-gray-700/20 hover:bg-gray-600/20 cursor-pointer">
                        <Download className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-200" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-gray-100 border-gray-700">
                      <p>Export Board as PDF</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {activeTab === "tasks" && <FilterDropdown filters={filters} onFiltersChange={setFilters} />}
              </div>
            </div>}
          </div>
          <>
            {fetchingAllTasks ?
              <div className="px-6">
                <Skeleton className="h-3 w-full rounded-md bg-gray-600/50"/> : 
              </div>
              : 
              <>
                {someHasCount ?
                  <>
                    {activeTab==="tasks" && <Progress progress={progress}/>}
                  </>
                  :
                  <div className="px-6">
                    <div className="bg-gray-600/50 rounded-md w-full h-3"></div>
                  </div>
                }
              </>
            }
          </>
          <div className="flex-1 min-h-0">
            {activeTab === "tasks" ? (
              <>
                {fetchingAllTasks ? 
                  <BoardSkeleton/>
                  :
                  <div className="h-full px-6 py-4 overflow-auto">
                    <div className="grid grid-cols-5 gap-4 h-full">
                      {COLUMNS.map((column) => (
                        <KanbanColumn
                          key={column.id}
                          id={column.id}
                          title={column.title}
                          color={column.color}
                          tasks={getTasksForColumn(column.id)}
                          members={membersInTeam}
                          onTaskClick={(task_id:string) => {
                            setCurrentActiveTask(task_id)
                            setOpenDetailedView(true)
                          }}
                          activeTaskId={activeTaskId}
                        />
                      ))}
                    </div>
                  </div>
                }
              </>
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
                  <div className="mb-6 space-y-3">
                    {activeTabMembers === "in_team" && membersData?.in_team?.map((member: Member) => (
                      <TeamMemberCard key={member.userId} privilegeCurrent={currentPrivilege} isOwner={membersData.creatorId===member.userId} isAdmin={isAdmin} member={member} tab={activeTabMembers} />
                    ))}

                    {activeTabMembers === "invited" && membersData?.invited?.length > 0 && membersData.invited.map((member: Member) => (
                      <TeamMemberCard key={member.userId || member.member_id} privilegeCurrent={currentPrivilege} isOwner={false} isAdmin={isAdmin} member={member} tab={activeTabMembers} />
                    ))}

                    {activeTabMembers === "invited" && (!membersData?.invited || membersData.invited.length === 0) && (
                      <div className="flex flex-col items-center mt-5 justify-center">
                        <p className="text-sm text-gray-400">No Invites yet!</p>
                        {isAdmin && <Button onClick={() => setShowAddMember(true)} size={"sm"} className="bg-[#580bdb] px-5 mt-2 hover:bg-[#580bdb]/80 cursor-pointer text-sm text-white">
                          Invite
                        </Button>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {openDetailedView && (
            <TaskDetail
              taskId={currentActiveTask}
              members={membersInTeam}
              onClose={() => {
                setOpenDetailedView(false)
                setActiveTaskId(null)
              }}
            />
          )}

          {showAddMember && (
            <AddMemberModal
              onClose={() => setShowAddMember(false)}
            />
          )}
        </div>
      </TooltipProvider>
    </>
  )
}