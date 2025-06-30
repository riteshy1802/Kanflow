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
    workspaceId:string | null,
    team_members:Member[]
}

export interface createWorkspace{
    name:string,
    description:string
    team_members?:Member[]
}