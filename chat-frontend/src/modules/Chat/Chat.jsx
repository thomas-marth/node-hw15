import { useState } from "react";
import { io } from "socket.io-client";

import styles from "./Chat.module.css";

const { VITE_CHAT_URL } = import.meta.env;

const Chat = () => {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const connectToChat = () => {
    const trimmed = tempName.trim();
    const name = trimmed || "Anonymous";

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

  const handleSend = (e) => {
    e?.preventDefault();
    if (!message.trim() || !socket) return;

    const payload = {
      username,
      message: message.trim(),
    };

    setMessages((prev) => [
      ...prev,
      {
        id: `my-${Date.now()}`,
        type: "my",
        text: `${username}: ${message.trim()}`,
      },
    ]);

    socket.emit("send_message", payload);

    setMessage("");
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
      {!username && (
        <div className={styles.usernameBlock}>
          <label className={styles.label} htmlFor="username">
            Your name:
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className={styles.input}
          />
          <button
            type="button"
            onClick={connectToChat}
            className={styles.primaryButton}
          >
            Join chat
          </button>
        </div>
      )}

      {username && (
        <>
          <div style={{ marginBottom: "8px" }}>
            <strong>Logged in as:</strong> {username}
          </div>

          <form onSubmit={handleSend} className={styles.controlsRow}>
            <label className={styles.label} htmlFor="message">
              Message:
            </label>
            <input
              id="message"
              type="text"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={!socket}
              className={`${styles.sendButton} ${
                !socket ? styles.sendButtonDisabled : ""
              }`}
            >
              Send
            </button>
            {socket && (
              <button
                type="button"
                onClick={handleDisconnect}
                className={styles.leaveButton}
              >
                Leave chat
              </button>
            )}
          </form>

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
