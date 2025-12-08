import React, { useEffect, useState, useContext } from "react";
// import { db } from "../../db.js";
import { Menu, MenuButton, MenuItems, MenuItem, MenuSeparator } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
// import { useLiveQuery } from "dexie-react-hooks";
import { useProject } from "../../contexts/ProjectContext.jsx";
// import { useContext } from "react";
import AuthContext from "../../contexts/AuthContext.jsx";

function ProjectOptions() {
  const { selectedProject, setSelectedProject } = useProject();
  const [name, setName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [projects, setProjects] = useState([]);

  const { user } = useContext(AuthContext);

  const fetchProjects = async () => {
    const res = await fetch("https://task-manager.ddev.site/api/projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    const data = await res.json();
    setProjects(data);
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    try {
      await fetch("https://task-manager.ddev.site/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name, user_id: user.id }),
      });
      setName("");
      setShowAdd(false);
      fetchProjects();
      window.dispatchEvent(new CustomEvent("projectsUpdated", { detail: { projectAdded: true } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProject = async () => {
    try {
      await fetch(`https://task-manager.ddev.site/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name }),
      });
      setName("");
      setShowEdit(false);
      fetchProjects();
      window.dispatchEvent(new CustomEvent("projectsUpdated", { detail: { projectEdited: true } }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await fetch(`https://task-manager.ddev.site/api/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      setSelectedProject(projects[0]);
      setShowDelete(false);
      fetchProjects();
      window.dispatchEvent(new CustomEvent("projectsUpdated", { detail: { projectDeleted: true } }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Menu>
        <MenuButton className={"bg-white rounded-md p-2 flex items-center"}>
          <i className="fa fa-gear"></i> <ChevronDown className="h-4 w-4 opacity-70 ml-2" />
        </MenuButton>
        <MenuItems
          anchor="bottom start"
          transition
          className="bg-white rounded-md p-2 mt-2 shadow-xl origin-top transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 w-32"
        >
          <MenuItem className="p-1 rounded-md">
            <button className="block w-full text-left data-focus:bg-blue-100" onClick={() => setShowAdd(true)}>
              Add Project
            </button>
          </MenuItem>
          <MenuSeparator className="my-1 h-px bg-black" />
          <MenuItem className="p-1 rounded-md">
            <button onClick={() => setShowEdit(true)} className="block w-full text-left data-focus:bg-blue-100">
              Edit Project
            </button>
          </MenuItem>
          <MenuSeparator className="my-1 h-[0.5px] bg-black" />
          <MenuItem className="bg-red-400 p-1 rounded-md">
            <button onClick={() => setShowDelete(true)} className="block w-full text-left data-focus:bg-red-600">
              Delete Project
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>

      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task title"
              className="border p-2 rounded w-full"
            />
            <button onClick={() => setShowAdd(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              x
            </button>
            <button onClick={handleAddProject} className="cursor-pointer p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
              Add Project
            </button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Task title"
              className="border p-2 rounded w-full"
            />
            <button onClick={() => setShowEdit(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
              x
            </button>
            <button onClick={handleEditProject} className="cursor-pointer p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
              Edit Project
            </button>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="space-y-2 bg-white p-6 rounded-md shadow-md w-96 relative">
            <p className="text-lg text-center">
              Are you sure you want to delete <b>{selectedProject.name}</b>
            </p>
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setShowDelete(false)}
                className="cursor-pointer p-2 bg-gray-200 text-black rounded-md hover:bg-blue-700 w-full"
              >
                Cancel
              </button>
              <button onClick={handleDeleteProject} className="cursor-pointer p-2 bg-red-500 text-white rounded-md hover:bg-red-700 w-full">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectOptions;
