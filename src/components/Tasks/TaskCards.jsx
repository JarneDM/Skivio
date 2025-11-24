import React, { useContext, useEffect, useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Trash, SquarePen } from "lucide-react";
import EditTask from "./EditTask.jsx";
import { useProject } from "../../contexts/ProjectContext.jsx";
import AuthContext from "../../contexts/AuthContext.jsx";

function TaskCards({ statusColor, status, search, setDueDate, dueDate }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tasks, setTasks] = useState([]);

  const { selectedProject } = useProject();
  const { user } = useContext(AuthContext);

  const today = new Date();

  const fetchTasks = async () => {
    const url = new URL("https://task-manager.ddev.site/api/tasks");

    if (selectedProject) {
      url.searchParams.append("project_id", String(selectedProject.id ?? selectedProject));
    }
    if (user) {
      url.searchParams.append("user_id", String(user.id));
    }

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return setTasks([]);
    }

    if (!Array.isArray(data)) return setTasks([]);

    const filtered = data.filter((task) => {
      const byStatus = task.status_id === (status?.id ?? status);
      const byProject = selectedProject ? String(task.project_id) === String(selectedProject.id ?? selectedProject) : true;
      return byStatus && byProject;
    });

    setTasks(filtered);
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject, status?.id]);

  useEffect(() => {
    const onTasksUpdated = async (ev) => {
      const detail = ev?.detail;

      if (!detail) return fetchTasks();

      const myStatusId = status?.id ?? status;

      if (detail.reorder) {
        if (String(detail.status_id) === String(myStatusId)) {
          setTasks((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((t) => t.id === detail.id);
            if (idx === -1) return copy;

            const [moved] = copy.splice(idx, 1);
            const to = Math.max(0, Math.min(detail.toIndex, copy.length));
            copy.splice(to, 0, moved);
            return copy;
          });
        }
        return;
      }

      if (detail.id && detail.title) {
        const task = detail;

        if (String(task.status_id) === String(myStatusId)) {
          setTasks((prev) => (prev.some((t) => t.id === task.id) ? prev : [...prev, task]));
        } else {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        }
        return;
      }

      if (detail.id && detail.status_id !== undefined) {
        const movedId = detail.id;
        const newStatus = detail.status_id;

        if (String(newStatus) === String(myStatusId)) {
          if (tasks.some((t) => t.id === movedId)) return;

          const res = await fetch(`https://task-manager.ddev.site/api/tasks/${movedId}`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          });

          if (!res.ok) return;
          const task = await res.json();

          if (selectedProject && String(task.project_id) !== String(selectedProject.id)) return;

          setTasks((prev) => [...prev, task]);
        } else {
          // moved out of this column
          setTasks((prev) => prev.filter((t) => t.id !== movedId));
        }
        return;
      }

      fetchTasks();
    };

    window.addEventListener("tasksUpdated", onTasksUpdated);
    return () => window.removeEventListener("tasksUpdated", onTasksUpdated);
  }, [selectedProject, status?.id, tasks]);

  const isSameDay = (d1, d2) => {
    if (!d1) return false;
    const a = new Date(d1);
    const b = new Date(d2);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const deleteTask = async () => {
    await fetch(`https://task-manager.ddev.site/api/tasks/${selectedTask.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    setShowDelete(false);
    fetchTasks();
  };

  const query = search?.toLowerCase().trim() ?? "";
  const filtered = query
    ? tasks.filter((t) => `${t.title} ${t.description} ${t.labels?.map((l) => l.name).join(" ")}`.toLowerCase().includes(query))
    : tasks;

  return (
    <div className="space-y-2 w-full">
      {filtered.length === 0 ? (
        <p className="text-center rounded-lg" style={{ backgroundColor: statusColor }}></p>
      ) : (
        filtered.map((task, index) => {
          const due = task.due_date ? new Date(task.due_date) : today;
          const isDueToday = isSameDay(due, today);

          return (
            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`relative p-2 bg-white hover:bg-gray-100 dark:hover:bg-[#03346E]/60 shadow-md rounded border transition-colors dark:bg-[#03346E] dark:text-[#dbeafe] ${
                    snapshot.isDragging ? "rotate-4" : ""
                  }`}
                >
                  <h4 className="font-semibold">{task.title?.length > 20 ? task.title.slice(0, 20) + "..." : task.title}</h4>

                  <p>
                    {task.description
                      ? task.description.length > 20
                        ? task.description.slice(0, 20) + "..."
                        : task.description
                      : "No description"}
                  </p>

                  {task.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 w-[60%]">
                      {task.labels.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {task.due_date && (
                    <p
                      className={`text-[0.6rem] absolute right-2 bottom-2 font-bold p-[0.2rem] rounded-sm ${
                        isDueToday ? "bg-red-500" : "bg-gray-200"
                      }`}
                    >
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}

                  <div className="absolute right-1 top-2 flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowEdit(true);
                      }}
                    >
                      <SquarePen className="h-[0.8rem] text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDelete(true);
                      }}
                    >
                      <Trash className="h-[0.8rem] text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </Draggable>
          );
        })
      )}

      {showEdit && (
        <EditTask
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          setShowEdit={setShowEdit}
          setDueDate={setDueDate}
          dueDate={dueDate}
        />
      )}

      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white shadow-md p-6 rounded-md w-96">
            <p className="text-lg text-center">
              Are you sure you want to delete <b>{selectedTask?.name}</b>?
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setShowDelete(false)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md w-full">
                Cancel
              </button>
              <button onClick={deleteTask} className="p-2 bg-red-500 hover:bg-red-700 text-white rounded-md w-full">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCards;
