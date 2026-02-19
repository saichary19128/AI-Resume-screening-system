import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function login() {
    try {
      const res = await API.post("/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userName", res.data.name);

      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1e3c72, #2a5298, #0f2027)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="card shadow-lg p-4" style={{ width: "420px" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">AI Resume Screener</h2>
          <p className="text-muted mb-0">Login to continue</p>
        </div>

        <input
          className="form-control mb-3"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={login}>
          Login
        </button>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/">Signup</Link>
        </p>
      </div>
    </div>
  );
}