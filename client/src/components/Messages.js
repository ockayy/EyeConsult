// src/components/Messages.jsx
import React, { useState, useEffect } from "react";
import "./CSS/Messages.css";

function Messages({ appointmentId, token }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [appointmentId, token]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMsg }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="messages-container">
      <h4 className="messages-header">Messages</h4>
      <div className="messages-list">
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.message_id} className="single-message">
              <b>{m.sender_name} ({m.sender_type}):</b> {m.content}
            </div>
          ))
        )}
      </div>
      <textarea
        className="new-message-textarea"
        placeholder="Type a message..."
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        rows={2}
      />
      <br />
      <button 
        className="send-message-btn" 
        onClick={handleSend}
        disabled={!newMsg.trim()}
      >
        Send
      </button>
    </div>
  );
}

export default Messages;