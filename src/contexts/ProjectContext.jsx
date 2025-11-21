import React, { createContext, useContext, useState } from "react";

const ProjectContext = createContext(null);

export function ProjectProvider({ children, initialProject = null }) {
  const [selectedProject, setSelectedProject] = useState(initialProject);

  return <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider");
  return ctx;
}
