import React, { useState } from "react";
import styles from "./loginer.module.css";

const Signup = ({ setPage }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    bio: "",
    image: null,  // ذخیره تصویر
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // بررسی اینکه تمام فیلدها پر شده باشند
    if (!formData.username.trim()) return setError("Username cannot be empty");
    if (!formData.password) return setError("Password cannot be empty");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters");
    if (!formData.bio.trim()) return setError("Bio cannot be empty");

    const form = new FormData();
    form.append('username', formData.username);
    form.append('password', formData.password);
    form.append('bio', formData.bio);
    form.append('image', formData.image);  // فایل تصویر

    setError("");
    setSuccess("");

    try {
      const response = await fetch("https://minimessage-egm3.onrender.com/api/signup", {
        method: "POST",
        body: form,  
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Sign Up successful!");
        console.log("New user created:", data);
        setPage("Login");  // صفحه لاگین بعد از موفقیت
      } else {
        setError(data.message || "Sign Up failed");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });  // ذخیره تصویر
  };

  return (
    <div className={styles.mainLog}>
      <h2 style={{ marginBottom: "20px" }}>Create Your Account</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.doublePUT}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className={styles.userpass}
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.userpass}
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            className={styles.userpass}
            value={formData.bio}
            onChange={handleChange}
          />
          <input
            type="file"
            name="image"
            className={styles.userpass}
            onChange={handleFileChange}  // انتخاب تصویر
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
