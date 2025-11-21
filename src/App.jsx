import "./App.css";
import Board from "./components/Status/Board.jsx";
import Nav from "./components/Header/Nav.jsx";
import { useState } from "react";
import { ProjectProvider } from "./contexts/ProjectContext.jsx";
// import Login from "./pages/Login.jsx";
import { useContext } from "react";
import AuthContext from "./contexts/AuthContext.jsx";
import { Navigate } from "react-router-dom";

function App() {
  const [search, setSearch] = useState("");
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="bg-[#FFF9D0] min-h-screen dark:bg-[#111827] transition-colors">
      {isLoggedIn ? (
        <ProjectProvider>
          <Nav search={search} setSearch={setSearch} />
          <Board search={search} />
        </ProjectProvider>
      ) : (
        <Navigate to="/login" />
      )}
    </div>
  );
}

export default App;
