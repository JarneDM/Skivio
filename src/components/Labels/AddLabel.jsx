import React, { useState } from "react";
import AddTask from "../Tasks/AddTask.jsx";
import ManageLabels from "./ManageLabels.jsx";
import { Menu, MenuButton, MenuItems, MenuItem, MenuSeparator } from "@headlessui/react";
import { ChevronDown, Tags } from "lucide-react";

function AddLabel() {
  const [labelName, setLabelName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const handleAddLabel = async () => {
    try {
      await fetch("https://task-manager.ddev.site/api/labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: labelName }),
      });
      setLabelName("");
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  // const handleEditLabel
  return (
    <>
      <div>
        <Menu>
          <MenuButton className={"flex justify-center items-center bg-white p-1 rounded-md"}>
            <Tags /> <ChevronDown className="h-4 w-4 opacity-70 ml-2" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            transition
            className="bg-white rounded-md p-2 mt-2 shadow-xl origin-top transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 w-36"
          >
            <MenuItem className="p-1 rounded-md">
              <button className="block w-full text-left data-focus:bg-blue-100" onClick={() => setShowAdd(true)}>
                Add Label
              </button>
            </MenuItem>

            <MenuSeparator className="my-1 h-px bg-black" />

            <MenuItem className="p-1 rounded-md">
              <button className="block w-full text-left data-focus:bg-blue-100" onClick={() => setShowManage(true)}>
                Manage Labels
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>

        {showAdd && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
            <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                placeholder="Label title"
                className="border p-2 rounded w-full"
              />
              <button onClick={() => setShowAdd(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                x
              </button>
              <button onClick={handleAddLabel} className="cursor-pointer p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
                Add Label
              </button>
            </div>
          </div>
        )}

        {showManage && <ManageLabels setShowManage={setShowManage} setLabelName={setLabelName} labelName={labelName} />}
      </div>
    </>
  );
}

export default AddLabel;
