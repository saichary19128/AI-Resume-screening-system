import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function signup() {
    try {
      await API.post("/signup", {
        name,
        email,
        password,
        role: "hr",
      });

      alert("Account created. Please login.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed");
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
          <p className="text-muted mb-0">Create your account</p>
        </div>

        <input
          className="form-control mb-3"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

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

        <button className="btn btn-success w-100" onClick={signup}>
          Create Account
        </button>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}