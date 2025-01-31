"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import { ChatHeader } from "@/components/ChatHeader";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm the Rate My Professor Assistant, how can I help you today?",
    },
  ]);

  const sendMessage = async (e) => {
    e.preventDefault();
    // Prevent sending empty messages
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };

    setMessage("");

    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: message }],
        }),
      });

      // Read and decode the message gotten from the server-side
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }

        const text = decoder.decode(value || new unit8Array(), {
          stream: true,
        });
        result += text;

        console.log("received text chunk:", text);
        result += text;
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (!lastMessage.content.includes(text)) {
            lastMessage.content += text;
          }
          return updatedMessages;
        });

        return reader.read().then(processText);
      });

      setMessage("");
    } catch (error) {
      console.error("Error in sendMessage:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#0D2F6D",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        color: "#EDF6F9",
      }}
    >
      <ChatHeader />
      <ChatBody messages={messages} />
      <ChatForm
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </Box>
  );
};

export default ChatPage;
