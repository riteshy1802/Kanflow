export interface login{
    email:string,
    password:string
}

export interface signUp{
    email:string,
    name:string,
    password:string,
    confirmPassword:string
}

export interface Member{
    email:string,
    privilege:"admin"|"user",
    status:"pending"|"accepted"|"rejected"
}

export interface InviteMembers{
    workspaceId:string | null ,
    team_members:Member[],
    message?:string
}

export interface createWorkspace{
    name:string,
    description:string
    team_members?:Member[],
    message?:string
}

export interface Notification {
  notification_id: string
  fromUser: string
  toUser: string
  type:string
  workspaceId: string
  workspace_name: string
  is_read: boolean
  name: string
  message_content: string
  reaction: "pending" | "accepted" | "rejected"
  created_at: string
  senderEmail: string
}

export interface Task {
    workspaceId:string
    title: string
    description: string
    dueDate: string | undefined
    status: "todo" | "in_progress" | "blocked" | "in_review" | "done"
    priority: "low" | "medium" | "high"
    assignees: string[]
    tags: string[]
}


export interface MemberTypes {
  member_id: string
  userId:string | null
  name: string
  email: string | null
  privilege: "admin" | "user",
  updated_at: string
  status:"accepted" | "pending" | "rejected"
}

export interface MembersObject{
  creatorId:string
  in_team:MemberTypes[]
  invited:MemberTypes[]
}