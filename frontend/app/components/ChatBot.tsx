"use client";
import { useState } from "react";
import API from "@/services/api";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const token = localStorage.getItem("token");

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await API.post(
      "/chat",
      {
        message: input,
        location: "Udaipur", // dynamic later
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const botMsg = { role: "bot", text: res.data.reply };

    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="h-[400px] overflow-y-auto border p-4 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          className="border p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4">
          Send
        </button>
      </div>
    </div>
  );
}
