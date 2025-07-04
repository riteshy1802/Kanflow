import { ChevronDown, Minus, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { getColorForName } from '@/functions/getAvatarColor'
import { avatarCharacters } from '@/functions/AvatarCharacter'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from '@/actions/common'
import { CHANGE_PRIVILEGE, REVOKE_INVITE_REMOVE_USER } from '@/constants/API_Endpoints'
import { useParams } from 'next/navigation'
import SpinnerTailwind from '@/app/LoadingScreen/SpinnerTailwind'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

interface Member {
  member_id: string
  userId:string | null
  name: string
  email: string | null
  privilege: "admin" | "user",
  updated_at: string
  status:"accepted" | "pending" | "rejected"
}

interface RevokePayload{
    workspaceId:string | null
    email:string | null
}

interface changeRoleType{
    workspaceId:string,
    privilege:string
    roleChangeEmail:string | null
}


const TeamMemberCard = ({member, tab, isAdmin,isOwner,privilegeCurrent}:{member:Member, tab:string, isAdmin:boolean, isOwner:boolean, privilegeCurrent:{admin:string}}) => {
    const queryClient = useQueryClient();
    const params = useParams();
    const workspaceId = params.workspaceId as string
    const [nameToRemove, setNameToRemove] = useState<string | null>("")
    const [emailToRemove, setEmailToRemove] = useState<string | null>("");

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const {mutate:changePrivilege, isPending:changingPrivilege} = useMutation({
        mutationKey:['changingRole'],
        mutationFn:async(payload:changeRoleType) => {
            const res = await post(CHANGE_PRIVILEGE, payload);
            return res;     
        },
        onSuccess:(data)=>{
            toast.success(data.message);
            queryClient.invalidateQueries({queryKey:['team_members',workspaceId]});
        },
        onError:()=>{
            toast.error("Role change Failed!");
        }
    })

    const handlePrivilegeChange = (newPrivilege: "admin" | "user", email:string | null) => {
        if(member.privilege===newPrivilege){
            return;
        }
        console.log(`Changing ${member.name}'s privilege to ${newPrivilege}`);
        changePrivilege({privilege:newPrivilege, workspaceId, roleChangeEmail:email});
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const{mutate:removeRevokeUser, isPending:revokingAccess} = useMutation({
        mutationKey:['revoke-access'],
        mutationFn:async(payload:RevokePayload)=>{
            const res = await post(REVOKE_INVITE_REMOVE_USER, payload);
            return res;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:['team_members',workspaceId]});
            toast.success(`${tab==="in_team" ? "Access" : "Invite"} Revoked for ${nameToRemove || emailToRemove}`)
            setTimeout(()=>{
                setEmailToRemove("")
                setNameToRemove("")
            },2000)
        }
    })

    const handleRevokeUser = (email: string | null, name: string) => {
        setNameToRemove(name);
        setEmailToRemove(email);
        if (!workspaceId) {
            console.error("Missing workspaceId");
            return;
        }

        const payload: RevokePayload = {
            email,
            workspaceId
        };

        removeRevokeUser(payload);
    };

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

        <div className="col-span-2 flex items-center justify-center relative" ref={dropdownRef}>
            <div className="flex items-center">
                <span
                    className={`px-5 py-2 text-xs rounded-full capitalize ${
                    member.privilege === "admin" 
                        ? isOwner ? "bg-green-500/20 text-white border border-green-600" : "bg-[#580bdb]/20 border border-[#580bdb] text-white" 
                        : "bg-gray-600 text-white"
                    }`}
                >
                    {changingPrivilege ? <SpinnerTailwind/> : isOwner ? "Owner" : member.privilege}
                </span>
                {privilegeCurrent.admin && <div 
                    className={`p-1 ml-1 rounded-full transition-colors ${
                        isOwner 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'hover:bg-gray-100/10 cursor-pointer'
                    }`}
                    onClick={!isOwner ? toggleDropdown : undefined}
                >
                    <ChevronDown 
                        className={`h-4 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                        }`} 
                        color='white'
                    />
                </div>}
            </div>

            {isDropdownOpen && !isOwner && (
                <div className="absolute w-[50%] top-full mt-1 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <div className="py-1 w-[100%]">
                        <button
                            onClick={() => handlePrivilegeChange("admin", member.email)}
                            className={`w-[100%] cursor-pointer text-left px-4 py-1 text-sm hover:bg-gray-700 transition-colors ${
                                member.privilege === "admin" ? "text-[white] bg-gray-700/50" : "text-white"
                            }`}
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => handlePrivilegeChange("user",member.email)}
                            className={`w-full cursor-pointer text-left px-4 py-1 text-sm hover:bg-gray-700 transition-colors ${
                                member.privilege === "user" ? "text-white bg-gray-700/50" : "text-white"
                            }`}
                        >
                            User
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="col-span-2 flex items-center flex-col">
            {tab==="in_team" ?
                <>
                    <p className="text-xs text-gray-500">
                        Joined - {dayjs(member.updated_at).format("MMM D, YYYY")}
                    </p>
                    <p className="text-xs mt-2 text-gray-500">
                        At - {dayjs(member.updated_at).format("HH:mm")}
                    </p>
                </>
                :
                <p className="text-xs text-gray-500">
                    Sent - {dayjs(member.updated_at).format("MMM D, YYYY | HH:mm")}
                </p>
            }
            {member.status!=="accepted" && <p className={`text-xs px-2 py-1 mt-2 ${member.status==="pending" ? "text-amber-500 rounded-md border border-amber-500 bg-amber-500/20" : "text-red-500 rounded-md border border-red-500 bg-red-500/20"}`}>{member.status}</p>}
        </div>

        {isAdmin && <div className="col-span-1 flex justify-center">
            <div className="relative group">
                {isOwner ? <Minus color='white'/> : <Button
                    onClick={()=>handleRevokeUser(member.email,member?.name)}
                    variant="ghost"
                    disabled={revokingAccess}
                    className="p-2 cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                >
                    {revokingAccess ? <SpinnerTailwind /> :  <Trash2 className="h-4 w-4" />}
                </Button>}
                {!isOwner ? 
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {tab==="in_team" ? "Remove" : "Revoke invite"} {member.name}
                    </div>
                    :
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Owner - {member.name}
                    </div>
                }
            </div>
        </div>}
    </div>
  )
}

export default TeamMemberCard