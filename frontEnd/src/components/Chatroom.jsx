import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import styles from "/src/styled.module.css";
import testPicture from "/src/assets/test.png";

const socket = io("https://minimessage-egm3.onrender.com");

const Chatroom = ({ rec, setPage }) => {
  const [username, setUsername] = useState("");
  const [chat, setChat] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [img, setImg] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const chatBoxRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const jsonized = storedUser ? JSON.parse(storedUser) : null;
const verifyUser = async () => {
  try {
    const response = await fetch("https://minimessage-egm3.onrender.com/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptedUser: jsonized.encryptedUser }),
    });

    if (!response.ok) {
      alert("Request failed");
      return;
    }

    const jj = await response.json();
    if (jj.message === "accepted") {
      setPage("See");
    } else {
      alert("You're not allowed");
    }
  } catch (err) {
    console.error(err);
    alert("Error occurred");
  }
};

  
  useEffect(() => {
    if (rec) setReceiver(rec);
  }, [rec]);

  
  useEffect(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chat]);

  
  useEffect(() => {
    socket.on("onlineUsers", (users) => setOnlineUsers(users));
    return () => socket.off("onlineUsers");
    
  }, []);

 
  useEffect(() => {
    if (!jsonized) return;
    
    setUsername(jsonized.username);
    socket.emit("register", jsonized.username);

    socket.on("registered", (id) =>
      console.log("Registered with socket id:", id)
    );

    socket.on("privateMessage", ({ sender, message, timestamp }) => {
      const date = new Date(timestamp);
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      setChat((prev) => [...prev, { sender, message, hour, minute }]);
    });

    return () => {
      socket.off("registered");
      socket.off("privateMessage");
    };
  }, []);

  
  useEffect(() => {
    if (!receiver) return;

    const receiverTr = receiver.trim().toLowerCase();

    const fetchReceiverData = async () => {
      try {
        const res = await fetch("https://minimessage-egm3.onrender.com/api/getdata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiver: receiverTr }),
        });
        if (!res.ok) {
          setImg("https://cdn-icons-png.flaticon.com/512/5519/5519632.png");
          setIsValid(false);
          return;
        }
        const data = await res.json();
        setImg(data.ppURL);
        setIsValid(true);
        // ذخیره receiver در localStorage
        localStorage.setItem("receiver", receiverTr);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch("https://minimessage-egm3.onrender.com/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: username, receiver: receiverTr }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const formatted = data.map((c) => {
          const d = new Date(c.date);
          return {
            sender: c.sender,
            message: c.message,
            hour: String(d.getHours()).padStart(2, "0"),
            minute: String(d.getMinutes()).padStart(2, "0"),
          };
        });
        setChat(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReceiverData();
    fetchMessages();
  }, [receiver, username]);

  const sendMessage = () => {
    if (!receiver || !message) return;
    const rec = receiver.trim().toLowerCase();
    socket.emit("privateMessage", { sender: username, receiver: rec, message });

    const d = new Date();
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");

    setChat((prev) => [...prev, { sender: username, message, hour, minute }]);
    setMessage("");
  };

  const isReceiverOnline = onlineUsers.includes(receiver.trim().toLowerCase());

  return (
    <main className={styles.main}>
      <nav className={styles.bar} style={{ position: "relative" }}>
        <h2 className={styles.logoName}>💬 MiniMessage</h2>

        <div
  onClick={verifyUser()}
  style={{
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    
    justifyContent: "center",
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    style={{ color: "#f8fafc" }}
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
      1.79-4 4 1.79 4 4 4zm0 2c-2.67 
      0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
</div>
        
      </nav>

      <div className={styles.downSection}>
        <div className={styles.chatView}>
          <div className={styles.upperNav}>
            <div style={{ position: "relative" }}>
              <img
                src={img || testPicture}
                className={styles.profilesPicture}
                alt="profile"
              />
              {isReceiverOnline && receiver !== username && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "limegreen",
                    border: "2px solid white",
                  }}
                />
              )}
              {!isReceiverOnline && isValid && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: "red",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>
            <div className={styles.receiverInput}>
              {receiver || "نام دریافت کننده..."}
            </div>
            <div
          onClick={() => setPage("Search")}
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
  onClick={() => setPage("Search")}
  style={{
    position: "absolute",
    right: "0", 
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    width: "24px",
    
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    style={{ color: "#f8fafc" }}
  >
    <path d="M10 2a8 8 0 105.292 14.708l5.147 5.146a1 1 0 001.415-1.414l-5.146-5.147A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
  </svg>
</div>



        </div>
          </div>

          <div className={styles.chatBox} ref={chatBoxRef}>
            {chat.map((c, i) =>
              c.sender === username ? (
                 
                  
                  <div key={i}  className={styles.you}>
                    <div className={styles.namor}>
                    <h6>
                      You
                    </h6>
                  </div>
                    <h3>{c.message}</h3>
                    <div className={styles.dator}>
                      <h6 >
                      {c.hour}:{c.minute}
                    </h6>
                    </div>
                  </div>
                  
              ) : (
                
                  
                  <div key={i} className={styles.them}>
                    <div className={styles.namorr}>
                    <h6>
                      {receiver}
                    </h6>
                  </div>
                    <h3>{c.message}</h3>
                    <div className={styles.datorr}>
                      <h6 >
                      {c.hour}:{c.minute}
                    </h6>
                    </div>
                  </div>
                
              )
              
            )}
            
          </div>
          
          <div className={styles.messageSend}>
            <input
              type="text"
              value={message}
              maxLength={400}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.senter}
              placeholder="پیام خود را بنویسید..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage();
                else if (e.key === "Enter" && e.shiftKey)
                  setMessage((prev) => prev + "\n");
              }}
            />
            <button className={styles.sentBTN} onClick={sendMessage}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Chatroom;
