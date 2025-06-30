import * as Yup from 'yup';

export const inviteMember = Yup.object().shape({
  email: Yup.string().email("Invalid Email ID").required("Email is required"),
  privilege: Yup.string().oneOf(["admin", "user"]).required(),
  status: Yup.string().oneOf(["pending", "accepted", "rejected"]).required(),
});

export const createWorkspaceSchema = Yup.object().shape({
  name: Yup.string().required("Project name is required"),
  description: Yup.string().required("Project description is required"),
  team_members: Yup.array().of(inviteMember).notRequired(),
});
