import React, { useState, useEffect } from "react";
import Chatroom from "./components/Chatroom";
import Search from "./components/Searchroom";
import Login from "./Login";
import Signup from "./Signup";
import "./App.css";

function App() {
  const [page, setPage] = useState("Login");
  const [rec, setRec] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setPage("Chat");
    } else {
      setPage("Login");
    }
  }, []);

  return (
    <>
      {page === "Login" && <Login setPage={setPage} />}
      {page === "Signup" && <Signup setPage={setPage} />}
      {page === "Chat" && <Chatroom setPage={setPage} rec={rec} />}
      {page === "Search" && <Search setPage={setPage} setRec={setRec} />}
    </>
  );
}

export default App;
