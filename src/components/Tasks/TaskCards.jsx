import React, { useContext, useEffect, useState } from "react";
import { db } from "../../db.js";
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
    if (selectedProject) url.searchParams.append("project_id", String(selectedProject.id ?? selectedProject));
    if (user) url.searchParams.append("user_id", String(user.id));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    // read body as text first so we can handle HTML error pages or non-JSON responses
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    if (!res.ok) {
      console.error("Tasks API returned error:", res.status, data);
      setTasks([]);
      return;
    }

    if (!Array.isArray(data)) {
      console.warn("Tasks API returned non-array response; expected array.", data);
      setTasks([]);
      return;
    }

    // filter client-side as a fallback in case API doesnt filter
    const filteredData = data.filter((task) => {
      const byStatus = task.status_id === (status?.id ?? status);
      const byProject = selectedProject ? String(task.project_id) === String(selectedProject.id ?? selectedProject) : true;
      return byStatus && byProject;
    });
    setTasks(filteredData);
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject, status?.id]);

  const openDeleteTask = (task) => {
    try {
      setSelectedTask(task);
      setShowDelete(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditTask = (task) => {
    try {
      setSelectedTask(task);
      setShowEdit(true);
    } catch (err) {
      console.error(err);
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  };

  const deleteTask = async () => {
    try {
      await db.tasks.delete(selectedTask.id);
      console.log(`Deleted task with Task ID: ${selectedTask.id}`);
      setShowDelete(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!tasks) return <p>Loading...</p>;

  const q = (search || "").toLowerCase().trim();
  const filtered = q
    ? tasks.filter((t) => {
        const hay = `${t.title ?? ""} ${t.description ?? ""} ${(t.labels ?? []).map((l) => l.name).join(" ")} ${
          t.status ?? ""
        }`.toLowerCase();
        return hay.includes(q);
      })
    : tasks;

  return (
    <div className="space-y-2 w-full">
      {filtered.length === 0 ? (
        <p className="text-center rounded-lg" style={{ backgroundColor: statusColor }}></p>
      ) : (
        filtered.map((task, index) => {
          const taskDate = task.due_date ? new Date(task.due_date) : today;
          const isDueToday = isSameDay(taskDate, today);

          return (
            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`relative p-2 bg-white hover:bg-gray-100 dark:hover:bg-[#03346E]/60 hover:shadow-blue-400/50 shadow-md rounded border transition-colors dark:bg-[#03346E] dark:text-[#dbeafe] ${
                    snapshot.isDragging ? "rotate-4" : ""
                  }`}
                >
                  <h4 className="font-semibold flex-auto">
                    {task.title ? (task.title.length < 20 ? task.title : `${task.title.slice(0, 20)}...`) : task.title}
                  </h4>
                  <p>
                    {task.description
                      ? task.description.length < 20
                        ? task.description
                        : `${task.description.slice(0, 20)}...`
                      : "No description"}
                  </p>
                  {task.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 w-[60%]">
                      {task.labels.map((l, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-[0.6rem] absolute right-2 bottom-2 font-bold shadow-sm dark:text-black ${
                        isDueToday ? "bg-red-500" : "bg-gray-200"
                      } ${task.due_date ? "" : "hidden"} shadow-black p-[0.2rem] rounded-sm`}
                    >
                      {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : null}
                    </p>
                  </div>

                  <div className="absolute right-1 top-2">
                    <button onClick={() => openEditTask(task)}>
                      <SquarePen className="h-[0.8rem] text-blue-600" />
                    </button>
                    <button onClick={() => openDeleteTask(task)}>
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
          <div className="space-y-2 bg-white shadow-md p-6 rounded-md w-96 relative">
            <p className="text-lg text-center">
              Are you sure you want to delete <b>{selectedTask.name}</b>
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setShowDelete(false)}
                className="cursor-pointer p-2 bg-gray-200 hover:bg-gray-300 text-black rounded-md w-full"
              >
                Cancel
              </button>
              <button onClick={deleteTask} className="cursor-pointer p-2 bg-red-500 hover:bg-red-700 text-white rounded-md w-full">
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
