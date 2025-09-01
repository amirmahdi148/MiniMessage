import React, { useState } from "react";
import styles from "./loginer.module.css";

const Signup = ({ setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setError("Username cannot be empty");
    if (!password) return setError("Password cannot be empty");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (!bio.trim()) return setError("Bio cannot be empty");
    if (!profilePictureUrl.trim()) return setError("Profile picture URL cannot be empty");

    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://10.72.194.238:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, bio, profilePictureUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Sign Up successful!");
        console.log("New user created:", data);
        setPage("Login");
      } else {
        setError(data.message || "Sign Up failed");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <div className={styles.mainLog}>
      <h2 style={{ marginBottom: "20px" }}>Create Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.doublePUT}>
          <input
            type="text"
            placeholder="Username"
            className={styles.userpass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.userpass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Bio"
            className={styles.userpass}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <input
            type="text"
            placeholder="Profile Picture URL"
            className={styles.userpass}
            value={profilePictureUrl}
            onChange={(e) => setProfilePictureUrl(e.target.value)}
          />
        </div>

        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <input type="submit" value="Sign Up" className={styles.submitBTN} />

        <p className={styles.textor} style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span className={styles.edgeblur} onClick={() => setPage("Login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
