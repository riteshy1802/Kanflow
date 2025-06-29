"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Kanban, Plus, ChevronDown, ChevronRight, LogOut, Folder, Share2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getColorForName } from "@/functions/getAvatarColor"

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface Board {
  id: string
  name: string
  isShared?: boolean
}

interface AppSidebarProps {
  selectedBoard: string | null
  onSelectBoard: (boardId: string) => void
  onCreateKanban: () => void
  showCreateForm: boolean
}

export function AppSidebar({ selectedBoard, onSelectBoard, onCreateKanban, showCreateForm }: AppSidebarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [myBoards, setMyBoards] = useState<Board[]>([
    { id: "1", name: "Design System Project" },
    { id: "2", name: "Mobile App Development" },
    { id: "3", name: "Website Redesign" },
  ])
  const [sharedBoards, setSharedBoards] = useState<Board[]>([
    { id: "4", name: "Marketing Campaign", isShared: true },
    { id: "5", name: "Product Launch", isShared: true },
  ])
  const [myBoardsOpen, setMyBoardsOpen] = useState(true)
  const [sharedBoardsOpen, setSharedBoardsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("kanflow_user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("kanflow_token")
    localStorage.removeItem("kanflow_user")
    router.push("/login")
  }

  return (
    <TooltipProvider>
      <div className="w-[15%] h-full flex flex-col border-r border-gray-700/50" style={{ backgroundColor: "#161618" }}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#4B06C2]/20">
              <Kanban className="h-5 w-5 text-[#5d0ee6]" />
            </div>
            <h1 className="text-lg font-bold text-[#5d09ed]/80">Kanflow</h1>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-2">
          {/* Create Kanban */}
          <Button
            variant="ghost"
            className={`w-full bg-[#4B06C2] cursor-pointer hover:bg-[#4B06C2]/80 text-[0.8rem] text-white justify-center gap-2 hover:text-white ${
              showCreateForm ? "bg-white/10 font-semibold text-white hover:bg-white/10" : ""
            }`}
            onClick={onCreateKanban}
          >
            <Plus className="h-4 w-4" />
            Create Kanban
          </Button>

          {/* My Boards */}
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
              {myBoards.map((board) => (
                <div className="w-full flex items-center gap-2" key={board.id}>
                  <p className="text-white">-</p>
                  <Button
                    key={board.id}
                    variant="ghost"
                    size="sm"
                    className={`w-[90%] max-w-full cursor-pointer justify-start text-[0.7rem] hover:bg-white/10 text-gray-300 hover:text-white ${
                      selectedBoard === board.id ? "bg-white/10 font-semibold text-white" : ""
                    }`}
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <span className="truncate inline-block max-w-full">{board.name}</span>
                  </Button>
                </div>
              ))}
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
              {sharedBoards.map((board) => (
                <div key={board.id} className="w-full flex items-center gap-2">
                  <p className="text-white">-</p>
                  <Button
                    key={board.id}
                    variant="ghost"
                    size="sm"
                    className={`w-[90%] cursor-pointer max-w-full justify-start text-[0.7rem] hover:bg-white/10 text-gray-300 hover:text-white ${
                      selectedBoard === board.id ? "bg-white/10 font-semibold text-white" : ""
                    }`}
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <span className="truncate inline-block max-w-full">{board.name}</span>
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
          <Button
            variant="ghost"
            className="w-full flex px-3 text-[0.8rem] cursor-pointer justify-between items-center hover:bg-white/10 text-gray-200 hover:text-white"
          >
            <div className="block text-xs flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </div>
            <div className="flex items-center justify-center w-4 h-4 bg-[#4B06C2] rounded-full text-white text-[0.6rem] font-medium">
              1
            </div>
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{backgroundColor:getColorForName(user?.name)}} className={`bg-[${getColorForName(user?.name)}] text-white text-sm font-medium`}>
                      {user?.avatar || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                  <p>{user?.name}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-gray-200">{user?.name}</p>
                <p className="text-[0.7rem] text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-red-500/20 cursor-pointer hover:text-red-400 text-gray-400"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
