import React, { useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import TaskCards from "../Tasks/TaskCards.jsx";
import { useProject } from "../../contexts/ProjectContext.jsx";

function Projects() {
  const { selectedProject, setSelectedProject } = useProject();
  const [projects, setProjects] = React.useState([]);
  const fetchProjects = async () => {
    await fetch("https://task-manager.ddev.site/api/projects", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const updated = projects?.find((p) => p.id === selectedProject.id);
      if (updated && updated.name !== selectedProject.name) {
        setSelectedProject(updated);
      }
    }
    if (!selectedProject && projects?.length) setSelectedProject(projects[0]);
    window.addEventListener("projectsUpdated", fetchProjects);
    return () => {
      window.removeEventListener("projectsUpdated", fetchProjects);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, selectedProject]);

  if (!projects) return <div>Loading projects...</div>;

  return (
    <div className="w-50 max-w-sm">
      <Listbox value={selectedProject} onChange={setSelectedProject}>
        <div className="relative">
          {/* so this is the deafult value (placeholder) or selected project, also the select element in html */}
          <Listbox.Button className="flex w-full items-center justify-between rounded-xl border-none bg-white px-3 py-2 text-blue-500 shadow-sm focus:outline-none focus:ring focus:ring-blue-500/50 transition">
            {selectedProject ? selectedProject.name : "Select a project"}
            <ChevronDown className="h-4 w-4 opacity-70" /> {/* this is the down arrow icon */}
          </Listbox.Button>

          {/* then this is the list with the options to choose from */}
          {/* Listbox.Option is the option element of just plain html yk, that goes inside of Listbox.Options */}
          {projects && (
            <Listbox.Options className="absolute z-10 mt-2 w-full rounded-xl bg-blue-900 shadow-lg ring-1 ring-black/10 focus:outline-none">
              {projects.map((project) => (
                <Listbox.Option
                  key={project.id}
                  value={project}
                  className={({ active }) =>
                    `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-600 text-white" : "text-gray-200"}`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>{project.name}</span>
                      {selected && <Check className="h-4 w-4 text-green-400" />}{" "}
                      {/* Check is an icon that appears to see wich one is selected*/}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </div>
      </Listbox>
    </div>
  );
}

export default Projects;
