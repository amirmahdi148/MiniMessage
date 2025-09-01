import React, { useEffect, useState } from "react";
import styles from "../See.module.css";

const See = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // گرفتن همه کاربران
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://minimessage-egm3.onrender.com/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // حذف کاربر
  const deleteUser = async (username) => {
    try {
      const res = await fetch("https://minimessage-egm3.onrender.com/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      // بروزرسانی لیست کاربران بعد از حذف
      setUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className={styles.loading}>در حال بارگذاری...</div>;

  return (
    <main className={styles.main}>
      <h2 className={styles.title}>مدیریت کاربران</h2>
      <div className={styles.usersContainer}>
        {users.length === 0 && <p>هیچ کاربری وجود ندارد</p>}
        {users.map((user, i) => (
          <div key={i} className={styles.userCard}>
            <img
              src={user.ppURL || "/default-avatar.png"}
              alt={user.username}
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <div className={styles.username}><b>نام کاربری:</b> {user.username}</div>
              <div className={styles.bio}><b>بیو:</b> {user.bio || "—"}</div>
              
            </div>
            <button
              className={styles.deleteBtn}
              onClick={() => deleteUser(user.username)}
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default See;
