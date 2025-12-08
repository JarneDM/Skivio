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

    // sort by position then id for deterministic ordering
    filtered.sort((a, b) => {
      const pa = a.position ?? 0;
      const pb = b.position ?? 0;
      if (pa !== pb) return pa - pb;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    setTasks(filtered);
  };

  const insertAtPosition = (list, task) => {
    const copy = list.filter((t) => t.id !== task.id);
    const pos = Math.max(0, Math.min(task.position ?? copy.length, copy.length));
    copy.splice(pos, 0, task);
    return copy;
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject, status?.id]);

  useEffect(() => {
    const onTasksUpdated = async (ev) => {
      const detail = ev?.detail;

      if (!detail) return fetchTasks();

      const myStatusId = status?.id ?? status;

      if (detail.move) {
        // remove from source column and capture the task
        if (String(detail.fromStatus) === String(myStatusId)) {
          setTasks((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((t) => t.id === detail.id);
            if (idx === -1) return copy;
            const [removed] = copy.splice(idx, 1);
            // mutate detail to share the removed task with destination handler
            detail.task = removed;
            return copy;
          });
        }

        // insert into destination column at correct position
        if (String(detail.toStatus) === String(myStatusId)) {
          let task = detail.task;
          if (!task) {
            // fetch task if we don't have it (cross-column move from different project/status)
            return fetchTasks();
          }

          if (task) {
            task.position = detail.toIndex;
            setTasks((prev) => {
              const copy = prev.filter((t) => t.id !== task.id);
              copy.splice(detail.toIndex, 0, task);
              return copy;
            });
          }
        }

        return;
      }
      if (detail.id && detail.title) {
        const task = detail;

        if (String(task.status_id) === String(myStatusId)) {
          setTasks((prev) => {
            const idx = prev.findIndex((t) => t.id === task.id);
            if (idx !== -1) {
              // update existing task, use server position
              const copy = [...prev];
              const updated = { ...copy[idx], ...task };
              copy.splice(idx, 1);
              const pos = Math.max(0, Math.min(updated.position ?? idx, copy.length));
              copy.splice(pos, 0, updated);
              return copy;
            }
            // insert new task at its position
            return insertAtPosition(prev, task);
          });
        } else {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        }
        return;
      }

      if (detail.id && detail.status_id !== undefined) {
        const movedId = detail.id;
        const newStatus = detail.status_id;

        if (String(newStatus) === String(myStatusId)) {
          // update task if already present
          setTasks((prev) => {
            const existing = prev.find((t) => t.id === movedId);
            if (existing) {
              existing.position = detail.position ?? existing.position;
              return insertAtPosition(prev, existing);
            }
            return prev;
          });

          // if not present fetch it then insert at position
          if (!tasks.some((t) => t.id === movedId)) {
            try {
              const res = await fetch(`https://task-manager.ddev.site/api/tasks/${movedId}`, {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
              });

              if (res.ok) {
                const task = await res.json();
                if (!selectedProject || String(task.project_id) === String(selectedProject.id ?? selectedProject)) {
                  task.position = detail.position ?? task.position ?? prev.length;
                  setTasks((p) => insertAtPosition(p, task));
                }
              }
            } catch (err) {
              console.error("Failed to fetch task on minimal move detail:", err);
            }
          }
        } else {
          setTasks((prev) => prev.filter((t) => t.id !== movedId));
        }
        return;
      }

      fetchTasks();
    };

    window.addEventListener("tasksUpdated", onTasksUpdated);
    return () => window.removeEventListener("tasksUpdated", onTasksUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, status?.id]);

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
