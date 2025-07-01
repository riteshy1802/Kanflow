import { Trash2 } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { getColorForName } from '@/functions/getAvatarColor'
import { avatarCharacters } from '@/functions/AvatarCharacter'

interface Member {
  member_id: string
  userId:string | null
  name: string
  email: string | null
  privilege: "admin" | "user",
  updated_at: string
  status:"accepted" | "pending" | "rejected"
}


const TeamMemberCard = ({member, tab}:{member:Member, tab:string}) => {
  return (
    <div
        key={member.userId}
        className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-700/30 rounded-lg border border-gray-600"
    >
        <div className="col-span-1 flex justify-center">
            <Avatar className="h-10 w-10">
            <AvatarFallback style={{backgroundColor:getColorForName(member?.name)}} className="text-white text-sm font-medium">
                {avatarCharacters(member?.name || member.email)}
            </AvatarFallback>
            </Avatar>
        </div>

        <div className="col-span-3">
            <p className="font-medium text-sm text-gray-100 truncate" title={member.name}>
                {member.name || member.email}
            </p>
        </div>

        <div className="col-span-3">
            <p className="text-sm text-gray-400 truncate">
            {member.email}
            </p>
        </div>

        <div className="col-span-2 flex justify-center">
            <span
                className={`px-5 py-2 text-xs rounded-full capitalize ${
                member.privilege === "admin" 
                    ? "bg-[#580bdb]/50 text-white" 
                    : "bg-gray-600 text-white"
                }`}
            >
                {member.privilege}
            </span>
        </div>

        <div className="col-span-2 flex items-center flex-col">
            <p className="text-xs text-gray-500">
                {tab==="in_team" ? "Joined" : "Invited on"} - {new Date(member.updated_at).toLocaleDateString()}
            </p>
            {member.status!=="accepted" && <p className={`text-xs px-2 py-1 mt-2 ${member.status==="pending" ? "text-amber-500 rounded-md border border-amber-500 bg-amber-500/20" : "text-red-500 rounded-md border border-red-500 bg-red-500/20"}`}>{member.status}</p>}
        </div>

        <div className="col-span-1 flex justify-center">
            <div className="relative group">
                <Button
                    variant="ghost"
                    className="p-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Remove {member.name}
                </div>
            </div>
        </div>
    </div>
  )
}

export default TeamMemberCard