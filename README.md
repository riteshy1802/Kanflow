# Kanflow: Modern Task and Team Management System

**Kanflow** is a powerful web-first task and team management application designed for streamlined collaboration, productivity, and task tracking. It is built using Django for the backend and Next.js (with TypeScript) for the frontend, leveraging PostgreSQL (via NeonDB) for persistent storage. The system supports smooth client-server communication using React Query and integrates several modern libraries for rich UI and efficient workflows.

> GitHub Repository: [https://github.com/riteshy1802/Kanflow](https://github.com/riteshy1802/Kanflow)

## 🚀 Features

### ✅ Authentication & Authorization

* Full JWT-based authentication system using access and refresh tokens.
* Role-based access control with Owner, Admin, and Member roles.
* Protected routes and access gating with meaningful error responses on unauthorized access.

### 🧑‍🤝‍🧑 Workspace Management & Collaboration

* Users can create workspaces and invite collaborators via email.
* Role assignment: Users can be promoted to Admin or demoted to Member (only by Owner/Admin).
* Accepting an invitation joins a user to the workspace.
* Access can be revoked with real-time notifications (app-side).
* Differentiation of personal vs shared workspaces in the UI.

### 📋 Task Management System

* Add, update, and manage tasks with details like title, description, tags, assignees, due date, priority, and status.
* Drag-and-drop tasks between columns (coming soon).
* Export task boards to PDF with current progress (coming soon).
* Filter and sort tasks by assignee, priority, status, and due date.
* Inline UI feedback using toast notifications on task creation and errors.
* Proper form validation using **Yup** and **Formik**.

### 💬 Notification System

* Internal app notification when members are invited.
* Notification on invitation acceptance and role change.
* Notification on access revocation.

### 🎨 UI/UX & Styling

* Web-first design with full dark mode support.
* UI built using **TailwindCSS**, **Shadcn/UI**, and **Lucide React** for iconography.
* Smooth animations and transitions via **Framer Motion**.
* Efficient state and cache management using **React TanStack Query**.

### 📡 Real-time Features (Upcoming)

* WebSockets-based live updates for notifications and task changes.

## 🛠️ Tech Stack

| Layer    | Technology                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------ |
| Frontend | Next.js (TypeScript), TailwindCSS, Shadcn, Lucide React, React Query, Formik, Yup, Framer Motion |
| Backend  | Django, Django REST Framework                                                                    |
| Database | PostgreSQL (via NeonDB)                                                                          |
| Auth     | JWT (Access/Refresh Tokens)                                                                      |

## 📂 Project Structure (Key Folders)

* `frontend/`: Next.js client-side app
* `backend/`: Django-based API and database models
* `api/models/`: Django models (e.g., Task, Workspace, Team Members)
* `components/`: UI components like modals, task cards, skeletons
* `schemas/`: Yup validation schemas for all forms

## 🧪 Functional Highlights

* 🛂 Role-based permission management
* 🔐 JWT-based login/session authentication
* 📧 Email-based user invitation and role-based access control
* 📝 Task creation and real-time UI update with skeleton loading
* 🔔 Notifications for all workspace-level changes
* 🔍 Filtering & sorting support for tasks
* 📤 Export boards as PDFs (upcoming)
* ↔️ Real-time sync via WebSockets (upcoming)

## 🖥️ Setup Instructions

### Prerequisites

* Node.js (v18+)
* Python 3.10+
* PostgreSQL account (NeonDB or local)

### Backend Setup (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## 🖼️ Screenshots & Demo

*(To be added)*

* Login Screen
* Taskboard UI
* Notifications View
* Task Creation Modal

### 🔐 User Authentication: Login & Register
Users can register and securely log in to the platform using a modern dark-themed form. Authentication is powered by JWT access and refresh tokens to maintain secure session management.

*Login Form:*

![image](https://github.com/user-attachments/assets/aa11b054-b6ae-4da7-afff-3a94fdc835f7)

*Register Page:*

![image](https://github.com/user-attachments/assets/299c7130-2285-4dc0-b899-cd0a2c2ac95d)

### 🏠 Landing 
After login, users are directed to the landing page showing all available workspaces—both personal and shared. It also provides the ability to create new workspaces.

![image](https://github.com/user-attachments/assets/e666a05e-954c-4dd8-aac7-542a9a5c4558)

### 🧪 Create a Workspace
Users can create a new workspace by assigning a name and optional description. Upon creation, users become the owner and can invite others.

![image](https://github.com/user-attachments/assets/7a83cbb1-0438-43ed-a29a-ba772c447e44)

### 📋 Kanban Board Interface
Each workspace is equipped with a clean Kanban board UI to manage tasks across different stages like To Do, In Progress, In Review, etc.

![image](https://github.com/user-attachments/assets/f7085bcd-1937-478a-8e7b-0669a61558b0)

### 👥 Add Members to Workspace
Invite collaborators to your workspace via email. The invited user will receive a notification and must accept to join.
![image](https://github.com/user-attachments/assets/106d5b45-d48b-42e4-8c89-01e791ced0a2)

###🔧 Manage Roles and Access
Team members list change the roles remove them

Admins and Owners can:
- Promote members to Admin
- Revoke admin access
- Remove members from the workspace

![image](https://github.com/user-attachments/assets/67175a44-4730-4c69-bfab-b17398be4b6e)

### ✅ Add Tasks with Tags and Assignees
Users can create detailed tasks with:
- Title and Description
- Due date
- Priority selection

![image](https://github.com/user-attachments/assets/806c4f86-4577-4278-924d-011a8de42432)

### 📝 Edit Tasks
Each task can be updated after creation. Only authorized users can edit the task details including status, assignees, and tags.

![image](https://github.com/user-attachments/assets/f2cdadc8-c6ca-467d-adda-f91da04497af)

### 🔔 Notification System

![image](https://github.com/user-attachments/assets/d61d7bf3-18ae-4a0b-89fd-c79a3af25f30)

### 🚫 Workspace Access Protection
If a user tries to access a non-existent or unauthorized workspace, a clean fallback UI prevents them with a relevant message.

![image](https://github.com/user-attachments/assets/f675241d-b4a6-4f36-9f75-48fccd3341eb)

## 📌 Planned Features

* 🧲 Real-time WebSocket integration
* 🧮 Drag-and-drop task reordering
* 🖨️ PDF export of boards
* 🔍 Advanced task filtering/sorting
* 🛎️ Enhanced notification system with email support

---

### Future Scope :
-> Integrate Web sockets to enable real time task updates and notifications about access invite or revoke messages.
-> Add a Export to pdf functionality
-> Enable users to drag and drop the tasks between the different status columns for UX.

For more details, visit the repo: [https://github.com/riteshy1802/Kanflow](https://github.com/riteshy1802/Kanflow)
