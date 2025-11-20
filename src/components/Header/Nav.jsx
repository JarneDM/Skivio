import React, { useContext } from "react";
import AddTask from "../Tasks/AddTask.jsx";
import Projects from "../Projects/Projects.jsx";
import ProjectOptions from "../Projects/ProjectOptions.jsx";
import AddLabel from "../Labels/AddLabel.jsx";
import ToggleDark from "./ToggleDark.jsx";
import Skivio from "../../assets/skivio-logo-nobg.png";
import AuthContext from "../../contexts/AuthContext.jsx";

function Nav({ selectedProject, setSelectedProject, search, setSearch }) {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    // await fetch("https://task-manager.ddev.site/api/logout", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
    logout();
  };
  return (
    <>
      <div className="w-full flex items-center justify-between p-4 bg-blue-600">
        <div className="flex items-center space-x-4">
          {/* <h1 className="text-white font-bold text-2xl mr-5">Skivio</h1> */}
          <img className="h-10" src={Skivio} alt="Skivio logo" />
          <Projects selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
          <ProjectOptions selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        </div>
        <div className="w-full max-w-md flex items-center">
          <input
            className="text-white w-full border-1 p-2 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            type="text"
          />
        </div>

        <button onClick={handleLogout}>Logout</button>

        <div className="flex items-center space-x-5">
          <AddLabel />
          <ToggleDark />
        </div>
      </div>
    </>
  );
}

export default Nav;
