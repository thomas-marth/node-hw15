import { useState } from "react";
import { io } from "socket.io-client";

import styles from "./Chat.module.css";
import UserConnectForm from "./UserConnectForm/UserConnectForm.jsx";
import ChatMessageForm from "./ChatMessageForm/ChatMessageForm.jsx";

const { VITE_CHAT_URL } = import.meta.env;

const Chat = () => {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleConnect = ({ username: rawName }) => {
    const name = rawName.trim() || "Anonymous";

    setUsername(name);

    const s = io(VITE_CHAT_URL);
    setSocket(s);

    s.on("connect", () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          text: `Connected to server as "${name}"`,
        },
      ]);
    });

    s.on("receive_message", (data) => {
      if (data.username === name) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${data.username}-${data.message}-${Math.random()}`,
          type: "other",
          text: `${data.username}: ${data.message}`,
        },
      ]);
    });

    s.on("disconnect", () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-disc-${Date.now()}`,
          type: "system",
          text: "Disconnected from server",
        },
      ]);
    });
  };

  const handleSendMessage = ({ message }) => {
    if (!socket) return;

    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `my-${Date.now()}`,
        type: "my",
        text: `${username}: ${trimmed}`,
      },
    ]);

    socket.emit("send_message", {
      username,
      message: trimmed,
    });
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setUsername("");
    setMessages([]);
  };

  return (
    <div className={styles.wrapper}>
      {!username && <UserConnectForm onSubmit={handleConnect} />}

      {username && (
        <>
          <div style={{ marginBottom: "8px" }}>
            <strong>Logged in as:</strong> {username}
          </div>

          <ChatMessageForm
            onSubmit={handleSendMessage}
            socketExists={!!socket}
            onDisconnect={handleDisconnect}
          />

          <div className={styles.messages}>
            {messages.map((msg) => {
              let className = styles.messageSystem;
              if (msg.type === "my") className = styles.messageMy;
              if (msg.type === "other") className = styles.messageOther;

              return (
                <div key={msg.id} className={`${styles.message} ${className}`}>
                  {msg.text}
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className={`${styles.message} ${styles.empty}`}>
                No messages yet
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
