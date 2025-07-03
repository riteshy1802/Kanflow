
import * as Yup from 'yup';

export const taskSchema = Yup.object({
    workspaceId:Yup.string().required(),
    title: Yup.string().min(6, "Title should be atleast 6 characters").required("Title is required"),
    description: Yup.string().min(10, "Please describe atleast in 10 characters").required("Description is required"),
    dueDate: Yup.string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
        .required("Due date is required"),
    status: Yup.string().oneOf(["todo", "in_progress", "blocked", "in_review", "done"]).required(),
    priority: Yup.string().oneOf(["low", "medium", "high"]).required('Please specify the priority'),
    assignees: Yup.array().of(Yup.string()).min(1, "At least one assignee is required").required("Assignees are required"),
    tags: Yup.array().of(Yup.string()).min(1, "Atleast one tag is required").required("Please enter a tag to make it more identifiable")
})