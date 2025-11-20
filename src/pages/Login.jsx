import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext.jsx";

function Login() {
  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // still need to send data to the backend nd validate credentials
    //this is just for demo purposes
    const demoUser = { username: "demo", email: "demo@example.com" };
    setUser(demoUser);
    login(demoUser);

    navigate("/");
  };
  return (
    <div className="flex flex-col max-w-sm mx-auto mt-[15%] p-6 border rounded-lg shadow-lg bg-white justify-center items-center">
      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        <label htmlFor="email">E-Mail</label>
        <input className="border-1 border-black rounded-md p-1" type="email" placeholder="Email" id="email" />

        <label htmlFor="password">Password</label>
        <input className="border-1 border-black rounded-md p-1" type="password" placeholder="Password" id="password" />

        <button
          className="bg-blue-500 text-white py-1.5 px-2 w-32 rounded-md cursor-pointer hover:bg-blue-700 transition-colors m-auto"
          type="submit"
        >
          Login
        </button>

        <p>
          Don't have an account?
          <Link className="hover:underline text-blue-500" to="/register">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
