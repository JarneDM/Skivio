import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext.jsx";

function Register() {
  const { login, setUser } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://task-manager.ddev.site/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, username, email, password, password_confirmation: confirmPassword }),
    });
    const user = await res.json();
    localStorage.setItem("auth_token", user.token);
    setUser(user);
    login(user.user.username);
    navigate("/");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow-lg bg-white">
        <h2 className="text-xl font-semibold">Register</h2>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          className="border-1 border-black rounded-md p-1"
          placeholder="John Doe"
          onChange={(e) => setName(e.target.value)}
        />

        <label>Username</label>
        <input
          className="border-1 border-black rounded-md p-1"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Email</label>
        <input
          className="border-1 border-black rounded-md p-1"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          className="border-1 border-black rounded-md p-1"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirm">Confirm Password</label>
        <input
          className="border-1 border-black rounded-md p-1"
          type="password"
          placeholder="Confirm Password"
          id="confirm"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-1.5 px-2 w-32 rounded-md cursor-pointer hover:bg-blue-700 transition-colors m-auto"
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
