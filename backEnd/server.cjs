// server.js
const express = require("express");
const http = require("http");
const db = require("./dataBase/db.cjs"); 
const cors = require("cors");
const { Server } = require("socket.io");
const crypto = require("crypto")
const dotenv = require("dotenv").config()
const secret_key = Buffer.from(process.env.SECRET_KEY, 'utf8').slice(0, 32);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const users = {}; 

function getLastMessages(sender, receiver, limit = 100) {
  const stmt = db.prepare(`
    SELECT * FROM (
      SELECT * FROM messages
      WHERE (sender=? AND receiver=?) OR (sender=? AND receiver=?)
      ORDER BY date DESC
      LIMIT ?
    ) sub ORDER BY date ASC
  `);
  return stmt.all(sender, receiver, receiver, sender, limit);
}



const ALGORITHM = "aes-256-gcm";

function encrypt(text) {
  const iv = crypto.randomBytes(16); // initialization vector تصادفی
  const cipher = crypto.createCipheriv(ALGORITHM, secret_key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex"); // بررسی integrity

  return {
    iv: iv.toString("hex"),
    data: encrypted,
    tag: authTag,
  };
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    secret_key,
    Buffer.from(encrypted.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex")); // بررسی integrity

  let decrypted = decipher.update(encrypted.data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}





io.on("connection", (socket) => {
  socket.on("register", (username) => {
    socket.username = username;
    users[username] = socket.id;
    io.emit("onlineUsers", Object.keys(users));
    socket.emit("registered", socket.id);
    console.log(`${username} registered with id ${socket.id}`);
  });

  socket.on("privateMessage", ({ sender, receiver, message }) => {
    if (!sender || !receiver || !message) return;
    const timestamp = Date.now();

    
    db.prepare(
      "INSERT INTO messages (sender, receiver, message, date) VALUES (?, ?, ?, ?)"
    ).run(sender, receiver, message, timestamp);

    const recId = users[receiver];
    if (recId) {
      io.to(recId).emit("privateMessage", { sender, message, timestamp });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) delete users[socket.username];
    io.emit("onlineUsers", Object.keys(users));
  });
});


app.post("/api/signup", (req, res) => {
  const { username, password, bio, profilePictureUrl } = req.body;
  const encryptedUser = JSON.stringify(encrypt(username))
  try {
    db.prepare(
      "INSERT INTO users (username, password , bio,encryptedUser, ppURL) VALUES (?, ?, ? ,?, ?)"
    ).run(username, password , bio, encryptedUser ,  profilePictureUrl);
    res.json("Accepted");
  } catch (err) {
    res.status(400).json({ message: err});
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  const user = db.prepare(
    "SELECT username , bio, ppURL , encryptedUser FROM users WHERE username=? AND password=?"
  ).get(username, password);
  if (user) res.json(user);
  else res.status(401).json({ message: "Invalid credentials" });
});
app.get("/" , (req,res)=>{
  res.json({hey : "wwassup"})
})

app.get("/api/users", (req, res) => {
  const users = db.prepare("SELECT username, bio, ppURL FROM users").all();
  res.json(users);
});

app.post("/api/getdata", (req, res) => {
  const { receiver } = req.body;
  const user = db.prepare("SELECT username, bio, ppURL FROM users WHERE username=?").get(receiver);
  if (user) res.json(user);
  else res.status(404).json({ message: "User not found" });
});
app.post("/api/verify" , (req,res)=>{
  const { encryptedUser } = req.body;
  if (!encryptedUser) return res.status(400).json({ message: "No encryptedUser provided" });

  try {
    const parsed = JSON.parse(encryptedUser);
    const decrypted = decrypt(parsed); // username
    const stmt = db.prepare("SELECT encryptedUser FROM users WHERE username = ?").get(decrypted);

    if (stmt && stmt.encryptedUser === encryptedUser) {
      res.json({ message: "accepted" });
    } else {
      res.json({ message: "denied" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/api/messages", (req, res) => {
  const { sender, receiver } = req.body;
  const msgs = getLastMessages(sender, receiver);
  res.json(msgs);
});
app.delete("/api/delete" , (req,res)=>{
  const {username} = req.body;
  try {
    const stmt = db.prepare("DELETE FROM users WHERE username = ?")
  const result = stmt.run(username)
  res.json("ok user deleted")
  } catch (error) {
    res.json({message : error})
  }
  
})
server.listen(5000, () => console.log("Server running on port 5000"));
