import React, { useContext, useState } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import AuthContext from "../../contexts/AuthContext.jsx";

function AddTask({ statusColor, dueDate, setDueDate, chosenStatus, selectedProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(selectedProject ?? null);
  const [status, setStatus] = useState(chosenStatus ?? null);
  const [labels, setLabels] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [labelsArr, setLabelsArr] = useState([]);

  const { user } = useContext(AuthContext);
  // const [dueDate, setDueDate] = useState("");

  // const defaultLabels = ["Urgent", "Low Priority", "Bug", "Feature", "School", "Personal"];
  const fetchStatuses = async () => {
    try {
      const response = await fetch("https://task-manager.ddev.site/api/statuses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const data = await response.json();
      setStatuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      setStatuses([]);
    }
  };

  const fetchLabels = async () => {
    await fetch("https://task-manager.ddev.site/api/labels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLabelsArr(data);
      })
      .catch((error) => {
        console.error("Error fetching labels:", error);
        return ["Urgent", "Low Priority", "Bug", "Feature", "School", "Personal"];
      });
  };

  const fetchProjects = async () => {
    await fetch("https://task-manager.ddev.site/api/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        return [];
      });
  };

  React.useEffect(() => {
    fetchProjects();
    fetchStatuses();
    fetchLabels();
  }, []);

  const handleAddTask = async () => {
    try {
      if (!title || !status || !status.id) {
        console.warn("Missing required fields: title or status");
        alert("Please provide a title and select a status before adding a task.");
        return;
      }
      if (!user || !user.id) {
        console.warn("No assigned user available");
        alert("You must be logged in to create a task.");
        return;
      }

      // Normalize payload: send IDs for labels and ensure due_date is ISO string if provided
      const payload = {
        title,
        description,
        status_id: status.id,
        labels: Array.isArray(labels) ? labels.map((l) => l && (l.id ?? l)) : [],
        project_id: projectId ?? null,
        // send the date input's YYYY-MM-DD string (no timezone) to avoid DB datetime format issues
        due_date: dueDate ? dueDate : null,
        assigned_to: user.id,
      };

      // Remove null/undefined fields that the API may not expect
      Object.keys(payload).forEach((k) => {
        if (payload[k] === null || payload[k] === undefined) delete payload[k];
      });

      console.info("Creating task with payload:", payload);

      const resp = await fetch("https://task-manager.ddev.site/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // Read the response body once (text), then try to parse JSON from it.
        let errBody = null;
        const raw = await resp.text();
        try {
          errBody = JSON.parse(raw);
        } catch {
          errBody = raw;
        }
        console.error("Server returned error when creating task:", resp.status, errBody);
        alert(`Failed to create task: ${resp.status} ${typeof errBody === "string" ? errBody : JSON.stringify(errBody)}`);
        return;
      }

      // Success
      setTitle("");
      setDescription("");
      setProjectId(null);
      setStatus(chosenStatus ?? null);
      setLabels([]);
      setDueDate("");
      setShowOverlay(false);
    } catch (err) {
      console.error("Failed to add task (network/error):", err);
      alert("Failed to add task — see console for details.");
    }
  };

  // When opening the overlay, ensure we have a sensible default status selected
  React.useEffect(() => {
    if (showOverlay && (status === null || status === undefined)) {
      // Prefer chosenStatus (try to normalize to a status object), otherwise first fetched status
      if (chosenStatus) {
        // If chosenStatus is an object with id, use it. If it's a string, try to find matching status by name or id.
        if (typeof chosenStatus === "object" && chosenStatus !== null && (chosenStatus.id || chosenStatus.name)) {
          setStatus(chosenStatus);
        } else if (typeof chosenStatus === "string") {
          const match = statuses.find((s) => s.name === chosenStatus || String(s.id) === chosenStatus);
          if (match) setStatus(match);
          else if (statuses && statuses.length > 0) setStatus(statuses[0]);
          else setStatus(null);
        } else {
          setStatus(chosenStatus);
        }
      } else if (statuses && statuses.length > 0) {
        setStatus(statuses[0]);
      }
    }
    // Intentionally exclude `status` from deps so effect runs when overlay opens or statuses/chosenStatus change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOverlay, chosenStatus, statuses]);

  return (
    <>
      <button
        onClick={() => setShowOverlay(true)}
        className={`cursor-pointer w-full mt-4 p-1 dark:text-white shadow-md border-[1px] border-blue-600 text-blue-800 rounded-md hover:bg-white hover:text-blue-700 hover:p-0.5 hover:text-lg transition-colors`}
        style={{ backgroundColor: statusColor }}
      >
        +
      </button>

      {showOverlay && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 ">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative dark:bg-[#003161] dark:text-white">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="border p-2 rounded w-full dark:text-white"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="border p-2 rounded w-full"
            />

            {/* <select onChange={(e) => setProjectId(e.target.value)} name="projects" id="projects" className="border p-2 rounded w-full">
              <option className="dark:text-black" value="select-project">Select a project</option>
              {projects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.name}
                </option>
              ))}
            </select> */}

            <Listbox value={projectId} onChange={setProjectId}>
              <Listbox.Button className="flex w-full items-center justify-between rounded-xl border-none bg-white dark:bg-blue-900 px-3 py-2 text-blue-500 shadow-sm focus:outline-none focus:ring focus:ring-blue-500/50 transition">
                {projectId ? projects?.find((p) => p.id === projectId)?.name : "Select a project"}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Listbox.Button>

              <Listbox.Options className="absolute z-10 mt-2 w-full rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none">
                <Listbox.Option
                  key="no-project"
                  value={null}
                  className={({ active }) =>
                    `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>No Project</span>
                      {selected && <Check className="h-4 w-4 text-green-400" />}
                    </div>
                  )}
                </Listbox.Option>
                {projects?.map((project) => (
                  <Listbox.Option
                    key={project.id}
                    value={project.id}
                    className={({ active }) =>
                      `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span>{project.name}</span>
                        {selected && <Check className="h-4 w-4 text-green-400" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>

            <Listbox value={status} onChange={setStatus}>
              <Listbox.Button className="flex w-full items-center justify-between rounded-xl border-none bg-white dark:bg-blue-900 px-3 py-2 text-blue-500 shadow-sm focus:outline-none focus:ring focus:ring-blue-500/50 transition">
                {status ? status.name ?? String(status) : chosenStatus?.name ?? String(chosenStatus ?? "")}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 w-full rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none">
                {statuses.map((s) => (
                  <Listbox.Option
                    className={({ active }) =>
                      `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                    }
                    key={s.id ?? s.name}
                    value={s}
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span>{s.name ?? String(s)}</span>
                        {selected && <Check className="h-4 w-4 text-green-400" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>

            <Listbox value={labels} onChange={setLabels} multiple>
              <Listbox.Button className="flex w-full items-center justify-between rounded-xl border-none bg-white dark:bg-blue-900 px-3 py-2 text-blue-500 shadow-sm focus:outline-none focus:ring focus:ring-blue-500/50 transition">
                {labels.length > 0 ? labels.map((l) => l.name).join(", ") : "Add a label"}
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Listbox.Button>

              <Listbox.Options
                anchor="right bottom"
                className="absolute z-1000 mt-2 w-40 rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none"
              >
                {labelsArr?.map((label) => (
                  <Listbox.Option
                    key={label.id}
                    value={label}
                    className={({ active }) =>
                      `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span>{label.name}</span>
                        {selected && <Check className="h-4 w-4 text-green-400" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>

            {/* Render selected labels as tags */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((l) => (
                  <span key={l.id} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                    {l.name}
                  </span>
                ))}
              </div>
            )}

            <input
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-none shadow-md text-blue-500 p-2 rounded-lg w-full dark:text-white"
            />
            <button onClick={() => setShowOverlay(false)} className="absolute top-1 right-2 text-gray-500 hover:text-gray-700">
              x
            </button>
            <button
              onClick={handleAddTask}
              disabled={!title || !status || !status.id || !user}
              className={`cursor-pointer p-2 w-full rounded-md ${
                !title || !status || !status.id || !user
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Add Task
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AddTask;
