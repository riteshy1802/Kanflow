"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dot, ChevronsUp, ChevronsDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MembersObject, TaskObject } from "@/types/form.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { getColorForName } from "@/functions/getAvatarColor"
import { avatarCharacters } from "@/functions/AvatarCharacter"
import { Skeleton } from "./ui/skeleton"
import { post } from "@/actions/common"
import { UPDATE_TASK } from "@/constants/API_Endpoints"
import { useState } from "react"
import SpinnerTailwind from "@/app/LoadingScreen/SpinnerTailwind"

interface TaskCardProps {
  task: TaskObject
  isActive: boolean
  onTaskClick : (task_id:string)=>void
}

const PRIORITY_ICONS = {
  high: ChevronsUp,
  medium: Dot,
  low: ChevronsDown,
}

const PRIORITY_COLORS = {
  high: "text-red-400 bg-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/20",
  low: "text-green-400 bg-green-400/20",
}

export function TaskCard({ task, isActive, onTaskClick }: TaskCardProps) {
  const params = useParams();
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient();
  const membersInTeam: MembersObject = queryClient.getQueryData<MembersObject>(['team_members', workspaceId]) ?? {
      creatorId: "",
      in_team: [],
      invited: []
  };
  const PriorityIcon = PRIORITY_ICONS[task.priority]
  const priorityColor = PRIORITY_COLORS[task.priority]

  const taskMembers = membersInTeam.in_team.filter(
    (member) => member.userId !== null && task.assignees.includes(member.userId)
  )

  const truncateTags = (tag:string) => {
    if(tag.length>=12){
      return tag.trim().slice(0,10)+"..";
    }
    return tag.trim();
  }

  const {mutate:updatePriority} = useMutation({
    mutationKey:['updating-priority'],
    mutationFn:async(payload:{task_id:string, priority:string})=>{
      setUpdatingPriority(true);
      await post(UPDATE_TASK, payload);
    },
    onSuccess:async()=>{
      console.log("Priority Updated!")
      await queryClient.invalidateQueries({queryKey:['allTasks', workspaceId]})
      setUpdatingPriority(false);
    },
    onError:()=>{
      console.log("Some error occured while updating the task");
      setUpdatingPriority(false);
    }
  })

  const handlePriorityUpdate = async(newPriority:string) => {
    try {
      if(newPriority===task.priority){
        return;
      }
      updatePriority({task_id:task.task_id, priority:newPriority});
    } catch (error) {
      console.log("Update failed!", error);
    }
  }

  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isActive ? "border border-gray-500/50 shadow-lg" : "hover:bg-gray-700/50"
      }`}
      data-testid="task-card"
      onClick={()=>onTaskClick(task.task_id)}
      style={{
        backgroundColor: isActive ? "#2a2a2c" : "#242426",
      }}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.tags.slice(0, 5).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[0.6rem] px-2 py-1 rounded-md backdrop-blur-sm bg-white/10 border border-white/20 text-gray-200"
          >
            {truncateTags(tag)}
          </Badge>
        ))}

        {task.tags.length > 5 && (
          <div className="text-[0.6rem] px-2 py-1 rounded-md bg-white/10 border border-white/20 text-gray-400">
            +{task.tags.length - 5}
          </div>
        )}
      </div>

      <h4 className="text-xs font-medium mb-2 line-clamp-3 leading-relaxed text-gray-100">{task.title}</h4>

      <div className="flex items-center justify-start mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className={`h-6 px-1 gap-1 cursor-pointer ${priorityColor} hover:bg-white/10`}>
              {updatingPriority ?
                <div className="px-4 flex items-center justify-center">
                  <SpinnerTailwind/>
                </div>
                :
                <>
                  <PriorityIcon className="h-2 w-2" />
                  <span className="text-[0.6rem] capitalize">{task.priority}</span>
                </>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-gray-800 space-y-1 cursor-pointer border border-gray-700 min-w-[100px] py-1">
            <DropdownMenuItem
              onClick={() => handlePriorityUpdate("high")}
              className={`text-gray-100 text-xs cursor-pointer flex items-center gap-2 px-2 py-1 ${
                task.priority === "high" ? "bg-gray-700/50" : ""
              } hover:bg-gray-700`}
            >
              <ChevronsUp className="h-4 w-4 text-red-400" />
              High
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handlePriorityUpdate("medium")}
              className={`text-gray-100 text-xs cursor-pointer flex items-center gap-2 px-2 py-1 ${
                task.priority === "medium" ? "bg-gray-700/50" : ""
              } hover:bg-gray-700`}
            >
              <Dot className="h-4 w-4 text-yellow-400" />
              Medium
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => handlePriorityUpdate("low")}
              className={`text-gray-100 cursor-pointer text-xs flex items-center gap-2 px-2 py-1 ${
                task.priority === "low" ? "bg-gray-700/50" : ""
              } hover:bg-gray-700`}
            >
              <ChevronsDown className="h-4 w-4 text-green-400" />
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1">
          {membersInTeam.in_team.length===0 ? 
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  data-testid="skeleton"
                  key={i}
                  className="h-6 w-6 rounded-full bg-gray-600/50"
                />
              ))}
            </div>
            :
            <>
            {taskMembers.slice(0, 3).map((member) => (
              <Avatar key={member.userId} className="h-6 w-6 border border-gray-800">
                <AvatarFallback style={{backgroundColor:getColorForName(member.name)}} className="text-white text-[0.5rem] font-medium">{avatarCharacters(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            {taskMembers.length > 3 && (
              <Avatar className="h-6 w-6 border border-gray-800">
                <AvatarFallback className="bg-gray-600 text-xs text-gray-200">+{taskMembers.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </>}
        </div>

        {/* Date */}
        <div className="text-[0.6rem] text-gray-400">{task.dueDate}</div>
      </div>
    </div>
  )
}
