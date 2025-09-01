import React, { useState } from "react";
import styles from "./loginer.module.css";
import Signup from "./Signup";

const Login = ({ setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setError("Username cannot be empty");
    if (!password) return setError("Password cannot be empty");
    if (password.length < 6)
      return setError("Password must be at least 6 characters");

    setError("");
    setSuccess("");

    try {
      const response = await fetch("https://minimessage-egm3.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { username, ppURL, bio } = data;

        localStorage.setItem("user", JSON.stringify({ username, ppURL, bio }));

        setSuccess("Login successful!");
        console.log("User data stored in localStorage:", data);
        setPage("Chat");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit} className={styles.mainLog}>
          <div className={styles.doublePUT}>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter your name"
              className={styles.userpass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              className={styles.userpass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p
              style={{
                color: "darkred",
                filter: "drop-shadow(0 0 10px red)",
                marginTop: "10px",
              }}
            >
              {error}
            </p>
          )}
          {success && (
            <p
              style={{
                color: "green",
                filter: "drop-shadow(0 0 10px green)",
                marginTop: "10px",
              }}
            >
              {success}
            </p>
          )}

          <span className={styles.textor}>
            Dont have account? Click{" "}
            <a
              onClick={() => {
                setPage("Signup");
              }}
              className={styles.edgeblur}
            >
              here
            </a>{" "}
            to sign up
          </span>

          <div className={styles.diverBTN}>
            <input type="submit" value="Login" className={styles.submitBTN} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
