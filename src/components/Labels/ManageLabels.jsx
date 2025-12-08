// import { useLiveQuery } from "dexie-react-hooks";
import { Trash, SquarePen } from "lucide-react";
import React, { useState } from "react";
// import { db } from "../../db.js";

function ManageLabels({ labelName, setLabelName, setShowManage }) {
  // const labels = useLiveQuery(() => db.labels.toArray(), []);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [labels, setLabels] = useState([]);

  const fetchLabels = async () => {
    const res = await fetch("https://task-manager.ddev.site/api/labels", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    const data = await res.json();
    setLabels(data);
  };

  React.useEffect(() => {
    fetchLabels();
  }, []);

  const openDelete = (label) => {
    try {
      setSelectedLabel(label);
      setShowDelete(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (label) => {
    try {
      setSelectedLabel(label);
      setShowEdit(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditLabel = async () => {
    try {
      await fetch(`https://task-manager.ddev.site/api/labels/${selectedLabel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: labelName }),
      });
      setLabelName("");
      setShowEdit(false);
      setShowManage(false);
      fetchLabels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLabel = async () => {
    try {
      await fetch(`https://task-manager.ddev.site/api/labels/${selectedLabel.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      setShowDelete(false);
      setShowManage(false);
      fetchLabels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="">
      <div className="fixed grid inset-0 items-center justify-center bg-opacity-50 z-50">
        <div className="bg-white p-10 space-y-4 rounded-lg w-70 shadow-lg">
          <h2 className="font-bold text-lg flex justify-center items-center">Manage labels</h2>
          <hr />
          <div className="bg-gray-200 shadow-md p-2 rounded-md space-y-2 ">
            {labels?.map((label) => (
              <div key={label.id} className="flex space-x-2">
                <p key={label.id} className="flex justify-start text-base items-center bg-blue-100 text-blue-700 rounded-md p-1 shadow-md">
                  {label.name}
                </p>

                <div className="space-x-1 flex items-center justify-center">
                  <button onClick={() => openEdit(label)}>
                    <SquarePen className="h-4 w-4" />
                  </button>
                  <button onClick={() => openDelete(label)}>
                    <Trash className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowManage(false)}
            className="cursor-pointer p-2 bg-gray-200 text-black rounded-md hover:bg-blue-700 w-full"
          >
            Close
          </button>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Task title"
              className="border p-2 rounded w-full"
            />
            <button onClick={() => setShowEdit(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              x
            </button>
            <button onClick={handleEditLabel} className="cursor-pointer p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
              Edit Label
            </button>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
            <p className="text-lg text-center">
              Are you sure you want to delete <b>{selectedLabel.name}</b>
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setShowDelete(false)}
                className="cursor-pointer p-2 bg-gray-200 text-black rounded-md hover:bg-blue-700 w-full"
              >
                Cancel
              </button>
              <button onClick={handleDeleteLabel} className="cursor-pointer p-2 bg-red-500 text-white rounded-md hover:bg-red-700 w-full">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageLabels;
