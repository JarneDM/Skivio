import React, { useState } from "react";
import { db } from "../../db.js";
import { Trash } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";

function EditTask({ selectedTask, setSelectedTask, setShowEdit, dueDate, setDueDate }) {
  const [newName, setNewName] = useState(selectedTask.title);
  const [newDescription, setNewDescription] = useState(selectedTask.description);
  const [newLabels, setNewLabels] = useState([]);
  // const [taskLabels, setTaskLabels] = useState([]);

  const labelsArr = useLiveQuery(() => db.labels.toArray(), []);
  const taskLabels = labelsArr?.filter((l) => !selectedTask.labels.some((sl) => sl.id === l.id)) || [];

  const handleAddLabels = async () => {
    try {
      const updatedLabels = [...selectedTask.labels, ...newLabels];

      await db.tasks.update(selectedTask.id, { labels: updatedLabels });

      setSelectedTask({
        ...selectedTask,
        labels: updatedLabels,
      });

      setNewLabels([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskEdit = async () => {
    try {
      const updates = {};

      if (newName && newName !== selectedTask.title) updates.title = newName;
      if (dueDate && dueDate !== selectedTask.duedate) updates.duedate = new Date(dueDate);
      if (newDescription !== selectedTask.description) updates.description = newDescription;

      if (Object.keys(updates).length > 0) {
        await db.tasks.update(selectedTask.id, updates);
        setSelectedTask({ ...selectedTask, ...updates });
      }

      if (newLabels.length > 0) {
        await handleAddLabels();
      }

      setShowEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTaskLabel = async (label) => {
    try {
      // filter out by id (safe since labels are objects)
      const updatedLabels = selectedTask.labels.filter((l) => l.id !== label.id);

      await db.tasks.update(selectedTask.id, { labels: updatedLabels });

      setSelectedTask({
        ...selectedTask,
        labels: updatedLabels,
      });
    } catch (err) {
      console.error("Failed to delete task label:", err);
    }
  };
  return (
    <div>
      <div className="fixed grid inset-0 items-center justify-center bg-opacity-50 z-50">
        <div className="bg-white p-10 space-y-4 rounded-lg w-100 shadow-lg">
          <h2 className="flex justify-center items-center text-lg">
            Task: <b className="ml-1">{selectedTask.title}</b>
          </h2>
          <hr className="border-[0.5]" />
          {/* name */}
          <div className="bg-gray-200 p-2.5 rounded-md">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Task title"
              className="border p-2 rounded w-full bg-white shadow-md"
            />
          </div>

          <div className="bg-gray-200 p-2.5 rounded-md h-min-30">
            <textarea
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Task description"
              className="border p-2 rounded w-full bg-white h-30 shadow-md"
            />
          </div>

          <div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-none shadow-md text-blue-500 p-2 rounded-lg w-full dark:text-white"
            />
          </div>

          <div>
            <Listbox value={newLabels} onChange={setNewLabels} multiple>
              <Listbox.Button className="flex w-full items-center justify-between rounded-xl border-none bg-white dark:bg-blue-900 px-3 py-2 text-blue-500 shadow-sm focus:outline-none focus:ring focus:ring-blue-500/50 transition">
                {newLabels.length > 0 ? newLabels.map((l) => l.name).join(", ") : "Add a label"}
                <ChevronRight className="h-4 w-4 opacity-70" />
              </Listbox.Button>

              <Listbox.Options
                anchor="right bottom"
                className="absolute z-1000 mt-2 w-40 rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none"
              >
                {taskLabels?.map((label) => (
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
          </div>
          {/* labels */}
          <div className="bg-gray-200 flex-auto h-auto text-center shadow-md p-2 w-auto min-h-10 rounded-md space-y-2 ">
            {selectedTask.labels?.map((label) => (
              <div key={label.id} className="flex-auto space-x-2 h-auto w-max ">
                <div className="flex justify-start text-base w-auto items-center bg-blue-200 text-blue-700 rounded-md p-1 shadow-md space-x-2">
                  <p className="">{label.name}</p>
                  <button onClick={() => deleteTaskLabel(label)}>
                    <Trash className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setShowEdit(false)}
              className="cursor-pointer p-2 bg-gray-200 text-black rounded-md hover:bg-blue-700 w-full"
            >
              Close
            </button>
            <button onClick={handleTaskEdit} className="cursor-pointer p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 w-full">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditTask;
