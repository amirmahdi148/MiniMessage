import React, { useEffect, useState } from "react";
import axios from "axios";
import "../searchor.css";
import def from "../assets/test.png";

export default function Search({ setPage, setRec }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true); // اضافه کردن حالت بارگذاری
  const storedUser = localStorage.getItem("user");
  const jsonized = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    
    axios
      .get("https://minimessage-egm3.onrender.com/api/users")
      .then((res) => {
        setUsers(res.data);
        setLoading(false); 
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); 
      });
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  
  const getProfileImageURL = (ppURL) => {
    if (!ppURL) return def; 
    const fixedURL = ppURL.replace(/\\/g, '/'); 
    return `https://minimessage-egm3.onrender.com/uploads/${fixedURL.split('/').pop()}`;
  };

  return (
    <div className="main">
      <div className="bar">
        <div className="logoName">Search</div>
      </div>

      <div className="chatView">
        <div className="upperNav" style={{ position: "relative", marginTop: 0 }}>
          <input
            type="text"
            placeholder="Search user..."
            className="receiverInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="chatBox" style={{ marginTop: "70px" }}>
          {loading ? (
            <div className="loadingMessage">Loading users...</div> // نمایش پیام بارگذاری
          ) : (
            filtered.map((u, i) => {
              const isMe = u.username === jsonized?.username;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px",
                    background: "#1e293b",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    cursor: isMe ? "default" : "pointer",
                    transition: "background .2s",
                  }}
                  onClick={() => {
                    if (!isMe) {
                      setRec(u.username);
                      localStorage.setItem("receiver", u.username);
                      setPage("Chat");
                    }
                  }}
                  className={isMe ? "default" : "userItem"}
                >
                  <img
                    src={getProfileImageURL(u.ppURL)}
                    alt="pp"
                    className="profilesPicture"
                    onClick={() => {
                      console.log(u.ppURL);
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ fontWeight: "600" }}>{u.username}</div>
                      {isMe && (
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 4px",
                            border: "1px solid limegreen",
                            borderRadius: "4px",
                            color: "limegreen",
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                      {u.bio || "No bio"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
