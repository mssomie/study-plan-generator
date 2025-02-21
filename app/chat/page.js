"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import { ChatHeader } from "@/components/ChatHeader";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm Athena and I'm here to help you come up with an optimal study plan. What do you need?",
    },
  ]);

  const [workflowResults, setWorkflowResults] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null); // tracks which card is expanded

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    setMessage("");

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      setWorkflowResults(data);

      const assistantMessage = {
        role: "assistant",
        content: "Your study plan has been generated.",
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, an error occurred. Please try again!" },
      ]);
    }
  };

  // Mapping for card titles
  const cardTitles = {
    zeroShot: "🎯 Zero-shot",
    pddlPlanner: "📝 PDDL Planner",
    promptEngineering: "🔍 Prompt Engineering",
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#0D2F6D",
        display: "flex",
        flexDirection: "column",
        color: "#EDF6F9",
        p: 2, // overall page margin
      }}
    >
      <ChatHeader />
      <ChatBody messages={messages} sx={{ flex: 1, overflowY: "auto", mb: 2 }} />
      <ChatForm message={message} setMessage={setMessage} sendMessage={sendMessage} />

      {workflowResults && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#EDF6F9",
            color: "#0D2F6D",
            borderRadius: 2,
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Generated Study Plan
          </Typography>

          <Grid container spacing={2}>
            {Object.keys(cardTitles).map((key) => (
              <Grid item xs={12} sm={4} key={key}>
                <Card sx={{ height: "100%", borderRadius: "12px" }}>
                  <CardHeader
                    title={cardTitles[key]}
                    action={
                      <IconButton onClick={() => setExpandedCard(key)}>
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ maxHeight: 150, overflow: "hidden", p: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                      {workflowResults[key]}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Modal for the expanded view */}
          <Dialog
            open={Boolean(expandedCard)}
            onClose={() => setExpandedCard(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              {expandedCard ? cardTitles[expandedCard] : ""}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {expandedCard ? workflowResults[expandedCard] : ""}
              </Typography>
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

export default ChatPage;
