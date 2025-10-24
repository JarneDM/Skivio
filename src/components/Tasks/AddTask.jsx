import React, { useState } from "react";
import { db } from "../../db.js";
import { useLiveQuery } from "dexie-react-hooks";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

function AddTask({ statusClasses, dueDate, setDueDate, chosenStatus, selectedProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(selectedProject);
  const [status, setStatus] = useState(chosenStatus);
  const [labels, setLabels] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  // const [dueDate, setDueDate] = useState("");

  // const defaultLabels = ["Urgent", "Low Priority", "Bug", "Feature", "School", "Personal"];
  const defaultStatuses = ["Backlog", "Todo", "In Progress", "Testing", "Done"];

  const labelsArr = useLiveQuery(() => db.labels.toArray(), []);

  const projects = useLiveQuery(() => db.projects.toArray(), []);

  const handleAddTask = async () => {
    try {
      await db.tasks.add({
        title,
        description,
        status,
        labels,
        projectId,
        duedate: dueDate,
        createdAt: new Date(),
      });

      setTitle("");
      setDescription("");
      setProjectId(null);
      setStatus(chosenStatus);
      setLabels([]);
      setDueDate("");
      setShowOverlay(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowOverlay(true)}
        className={`cursor-pointer w-full mt-4 p-1 ${statusClasses} dark:bg-blue-900 dark:text-white shadow-md border-[1px] border-blue-600 text-blue-800 rounded-md hover:bg-white hover:text-blue-700 hover:p-0.5 hover:text-lg transition-colors`}
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
                {status ? status : chosenStatus}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 w-full rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none">
                {defaultStatuses.map((status) => (
                  <Listbox.Option
                    className={({ active }) =>
                      `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                    }
                    key={status}
                    value={status}
                  >
                    {({ selected }) => (
                      <div className="flex items-center justify-between">
                        <span>{status}</span>
                        {selected && <Check className="h-4 w-4 text-green-400" />}{" "}
                        {/* Check is an icon that appears to see wich one is selected*/}
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
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-none shadow-md text-blue-500 p-2 rounded-lg w-full dark:text-white"
            />
            <button onClick={() => setShowOverlay(false)} className="absolute top-1 right-2 text-gray-500 hover:text-gray-700">
              x
            </button>
            <button onClick={handleAddTask} className="cursor-pointer p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
              Add Task
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AddTask;
