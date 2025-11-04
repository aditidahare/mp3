# MP3 – APIed Piper  
*CS 409 – Fall 2025*  

This project implements a RESTful task management API using **Node.js**, **Express**, and **MongoDB Atlas**.  
Users can create accounts and manage tasks, including assignment/unassignment logic.

---

## ✅ How to Run

### 1. Install dependencies
npm install

### 2. Create `.env` file in the project root:
PORT=3000
TOKEN=secret-starter-mern
MONGODB_URI="your mongodb atlas connection string"

### 3. Start the server
npm start

Server runs at:
http://localhost:3000/


---

## 📌 API Endpoints Summary

### Users
| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | `/api/users` | Retrieve users (supports filters/select/sort/limit) |
| GET | `/api/users/:id` | Get a specific user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Edit a user |
| DELETE | `/api/users/:id` | Delete a user and remove tasks from assigned list |

### Tasks
| Method | Endpoint | Description |
|-------|----------|-------------|
| GET | `/api/tasks` | Retrieve tasks (filter/sort/select supported) |
| GET | `/api/tasks/:id` | Get a specific task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Edit a task & maintain user pendingTasks linking |
| DELETE | `/api/tasks/:id` | Delete task (removes from assigned user's pending list) |

---

## 🔁 Assignment/Unassignment Behavior

- When assigning a task:
  - `task.assignedUser` stores user `_id`
  - `task.assignedUserName` stores user's `name`
  - User’s `pendingTasks` receives the task `_id`

- When unassigning a task:
  - `task.assignedUser` is `""`
  - `task.assignedUserName` is `"unassigned"`
  - Task `_id` is removed from the user's `pendingTasks`

---

## 🧪 Testing
Requests can be sent using:
- `curl` (demonstrated in MP instructions)
- Postman
- Insomnia
- VS Code REST Client plugin

---

## ✨ Notes
All expected behaviors confirmed & tested, including:
- Pagination / sorting / selection
- Filtering using `where` JSON
- Proper pendingTasks maintenance
