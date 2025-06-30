import * as Yup from 'yup';
import { inviteMember } from './createWorkspaceSchema';

export const InviteMembersSchema = Yup.object({
    workspaceId:Yup.string().required(),
    team_members:Yup.array().of(inviteMember).notRequired()
})