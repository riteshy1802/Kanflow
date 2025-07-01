"use client"

import { useEffect, useState } from "react"
import { redirect, useParams, usePathname, useRouter } from "next/navigation"
import { Kanban, Plus, ChevronDown, ChevronRight, LogOut, Folder, Share2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getColorForName } from "@/functions/getAvatarColor"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { get, post } from "@/actions/common"
import { GET_ALL_NOTIFICATIONS, GET_ALL_WORKSPACES, LOGOUT, ME } from "@/constants/API_Endpoints"
import { avatarCharacters } from "@/functions/AvatarCharacter"
import { cookie } from "@/helper/cookie"
import SpinnerTailwind from "@/app/LoadingScreen/SpinnerTailwind"
import { UserProfileSkeletion } from "./skeletons/ProfileSkeleton"
import SidebarProjectsSkeleton from "./skeletons/SidebarProjectsSkeleton"
import NoProjects from "./NothingFound/NoProjects"
import { useDispatch } from "react-redux"
import { updateProjectId } from "@/redux/Slices/activeProjectSlice"
import { Notification } from "@/types/form.types"

interface Board {
  workspaceId: string
  name: string
}
export function AppSidebar() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [myBoardsOpen, setMyBoardsOpen] = useState(true)
  const [sharedBoardsOpen, setSharedBoardsOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pathName = usePathname();
  const currentRoute = pathName.split('/').pop();
  const router = useRouter();
  const dispatch = useDispatch();
  const {workspaceId} = useParams();
  const queryClient = useQueryClient();

  console.log("Workspace id : ", workspaceId);

  const { data: notificationsData } = useQuery({
    queryKey: ['notificationsData-onAppSidebar'],
    queryFn: async () => {
      const res = await get(GET_ALL_NOTIFICATIONS)
      return res.payload.notifications
    }
  })

  useEffect(()=>{
    const unreadMessages = notificationsData?.filter((notif:Notification)=>notif.is_read===false);
    const count = unreadMessages?.length;
    setUnreadNotifications(count??0);
  },[notificationsData]);

  const projectClick = (workspaceId:string) => {
    dispatch(updateProjectId(workspaceId));
    redirect(`/workspace/${workspaceId}`)
  }

  const getUser = async () => {
    try {
      const res = await get(ME);
      return res.payload;
    } catch (error) {
      console.log("Some error occurred", error);
      throw error;
    }
  };

  const getAllWorkspaces = async() => {
    try {
      const res = await get(GET_ALL_WORKSPACES);
      return res.payload;
    } catch (error) {
      console.log("Some error occured while fetching all workspaces : ",error);
    }
  }

  const {data:userData, isLoading:fetchingUserData} = useQuery({
    queryKey:['user'],
    queryFn:getUser,
  })

  const {data:projects, isLoading:fetchingWorkspaces} = useQuery({
    queryKey:['all-workspaces'],
    queryFn:getAllWorkspaces
  })

  useEffect(()=>{
    console.log("Projects : ", projects);
  },[projects])

  const handleLogout = async() => {
    try {
      setLoggingOut(true);
      const res = await post(LOGOUT,{});
      console.log(res);
      if(res.success===true){
        cookie.delete("access_token");
        router.push('/login');
        queryClient.clear();
      }
    } catch (error) {
      console.log("Some error occured : ",error);
    }finally{
      setLoggingOut(false);
    }
  }

  return (
    <div className="w-[15%] h-full flex flex-col border-r border-gray-700/50" style={{ backgroundColor: "#161618" }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#6b1cff]/30">
            <Kanban className="h-5 w-5 text-[#6b1cff]" />
          </div>
          <h1 className="text-lg font-bold text-[#6b1cff]">Kanflow</h1>
        </div>
      </div>


      <div className="flex-1 p-4 space-y-2">
        {/* Create Kanban */}
        <Button
          variant="ghost"
          className={`w-full bg-[#4B06C2] cursor-pointer hover:bg-[#4B06C2]/80 text-[0.8rem] text-white justify-center gap-2 hover:text-white ${
            currentRoute==="create-workspace" ? "bg-white/10 font-semibold text-white hover:bg-white/10" : ""
          }`}
          onClick={()=>{redirect('/create-workspace')}}
        >
          <Plus className="h-4 w-4" />
          Create Kanban
        </Button>

        {/* My Boards */}
        {fetchingWorkspaces ? 
          <>
            <SidebarProjectsSkeleton count={3}/>
            <SidebarProjectsSkeleton count={2}/>
            <SidebarProjectsSkeleton count={0}/>
          </>
          :
          <>
            <Collapsible open={myBoardsOpen} onOpenChange={setMyBoardsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between cursor-pointer text-[0.8rem] hover:bg-white/10 text-gray-200 hover:text-white"
                >
                  <div className="flex text-xs items-center gap-2">
                    <Folder className="h-4 w-4" />
                    My Boards
                  </div>
                  {myBoardsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-4 mt-1">
                {projects?.my_workspaces?.map((board:Board) => (
                  <div className="w-full flex items-center gap-2" key={board.workspaceId}>
                    <p className="text-white">-</p>
                    <Button
                      key={board.workspaceId}
                      variant="ghost"
                      size="sm"
                      className={`w-[90%] max-w-full cursor-pointer justify-start text-[0.7rem] hover:bg-white/10 text-gray-300 hover:text-white ${
                        workspaceId === board.workspaceId ? "bg-white/10 font-semibold text-white" : ""
                      }`}
                      onClick={() => {projectClick(board.workspaceId)}}
                    >
                      <span className="truncate inline-block max-w-full">{board.name}</span>
                    </Button>
                  </div>
                ))}
                {projects?.my_workspaces?.length===0 && <NoProjects message="No personal projects"/>}
              </CollapsibleContent>
            </Collapsible>

              {/* Shared with Me */}
              <Collapsible open={sharedBoardsOpen} onOpenChange={setSharedBoardsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between cursor-pointer text-[0.8rem] hover:bg-white/10 text-gray-200 hover:text-white"
                  >
                    <div className="flex text-xs items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Shared with Me
                    </div>
                    {sharedBoardsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-4 mt-1">
                  {projects?.shared_workspaces?.map((board:Board) => (
                    <div key={board.workspaceId} className="w-full flex items-center gap-2">
                      <p className="text-white">-</p>
                      <Button
                        key={board.workspaceId}
                        variant="ghost"
                        size="sm"
                        className={`w-[90%] cursor-pointer max-w-full justify-start text-[0.7rem] hover:bg-white/10 text-gray-300 hover:text-white ${
                          workspaceId === board.workspaceId ? "bg-white/10 font-semibold text-white" : ""
                        }`}
                        onClick={() => {projectClick(board.workspaceId)}}
                      >
                        <span className="truncate inline-block max-w-full">{board.name}</span>
                      </Button>
                    </div>
                  ))}
                  {projects?.shared_workspaces?.length===0 && <NoProjects message="No shared projects"/>}
                </CollapsibleContent>
              </Collapsible>
              <Button
                variant="ghost"
                onClick={()=>{redirect('/notifications')}}
                className="w-full flex px-3 text-[0.8rem] cursor-pointer justify-between items-center hover:bg-white/10 text-gray-200 hover:text-white"
              >
                <div className="block text-xs flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </div>
                {unreadNotifications!==0 && 
                  <div className="flex items-center justify-center w-4 h-4 bg-[#4B06C2] rounded-full text-white text-[0.6rem] font-medium">
                    {unreadNotifications}
                  </div>
                }
              </Button>
            </>
          }
      </div>

      {/* User Profile */}
      {fetchingUserData ? 
        <UserProfileSkeletion/>
        :
        <div className="p-2 py-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{backgroundColor:getColorForName(userData?.name)}} className={`bg-[${getColorForName(userData?.name)}] text-white text-sm font-medium`}>
                  {avatarCharacters(userData?.name) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs font-medium truncate text-gray-200">{userData?.name}</p>
                <p className="text-[0.7rem] text-gray-400 truncate">{userData?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-red-500/20 cursor-pointer hover:text-red-400 text-gray-400"
            >
              {loggingOut?
                <SpinnerTailwind/>
                :
                <LogOut className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      }
    </div>
  )
}
