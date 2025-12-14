import React, { useContext } from "react";
import AddTask from "../Tasks/AddTask.jsx";
import Projects from "../Projects/Projects.jsx";
import ProjectOptions from "../Projects/ProjectOptions.jsx";
import AddLabel from "../Labels/AddLabel.jsx";
import ToggleDark from "./ToggleDark.jsx";
import Skivio from "../../assets/skivio-logo-nobg.png";
import AuthContext from "../../contexts/AuthContext.jsx";
import { User } from "lucide-react";
function Nav({ search, setSearch }) {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    logout();
  };
  return (
    <>
      <div className="w-full flex items-center justify-between p-4 bg-blue-600">
        <div className="flex items-center space-x-4">
          {/* <h1 className="text-white font-bold text-2xl mr-5">Skivio</h1> */}
          <img className="h-10" src={Skivio} alt="Skivio logo" />
          <Projects />
          <ProjectOptions />
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

        <div className="flex items-center space-x-2 py-2 justify-between">
          {/* <button>
            <User className="text-white cursor-pointer" />
          </button> */}
          <button className="bg-red-500 text-white p-1 rounded-md cursor-pointer" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="flex items-center space-x-5">
          <AddLabel />
          <ToggleDark />
        </div>
      </div>
    </>
  );
}

export default Nav;
