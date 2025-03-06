"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  ThemeProvider
} from "@mui/material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import  CustomCard  from "@/components/CustomCard";
import { ChatHeader } from "@/components/ChatHeader";
import theme from "../theme";
import ReactMarkdown from "react-markdown";


const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
      "Hi, I'm Athena! I'm here to craft the perfect study plan for you. Just tell me what you're studying, and if you’d like, share any details—like topics, your comfort level, or how much time you have. Let’s make a plan that works for you!"


    },
  ]);

  const [workflowResults, setWorkflowResults] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // Maintain separate histories for each workflow
  const [zeroShotHistory, setZeroShotHistory] = useState([
    {
      role: "assistant",
      content: "Initial system message",
    }
  ]);
  const [promptEngineeringHistory, setPromptEngineeringHistory] = useState([
    {
      role: "assistant",
      content: "Initial system message",
    }
  ]);
  const [pddlPlannerHistory, setPddlPlannerHistory] = useState([ {
    role: "assistant",
    content: "Initial system message",
  }]);



  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const userMessage = { role: "user", content: message };
    setMessage("");
  
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    //Add user's message to each workflow's history
    setZeroShotHistory((prev)=>[...prev, userMessage]);
    setPromptEngineeringHistory((prev)=>[...prev, userMessage]);
    setPddlPlannerHistory((prev)=>[...prev, userMessage]);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zeroShotHistory: [...zeroShotHistory, userMessage],
          promptEngineeringHistory: [...promptEngineeringHistory, userMessage],
          pddlPlannerHistory: [...pddlPlannerHistory, userMessage],
        }),
      });
  
      const data = await response.json();
      setWorkflowResults(data);
  
      const assistantMessage = {
        role: "assistant",
        content: "Your study plan has been generated.",
      };
  
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Add assistant message to each of the workflow's history
      setZeroShotHistory((prev)=> [...prev, assistantMessage]);
      setPromptEngineeringHistory((prev)=>[...prev, assistantMessage]);
      setPddlPlannerHistory((prev)=>[...prev, assistantMessage]);

    } catch (errorMessage) {
      console.error("Error in sendMessage:", errorMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "Sorry, an error occurred. Please try again!" },
      ]);

      const errorMessageObj ={role: "error", content: errorMessage}
      setMessages((prevMessages) => [...prevMessages, errorMessageObj]);
      setZeroShotHistory((prev)=>[...prev, errorMessageObj]);;
      setPromptEngineeringHistory((prev)=>[...prev, errorMessageObj]);
      setPddlPlannerHistory((prev)=>[...prev, errorMessageObj]);
    }
  };

  // Mapping for card titles
  const cardTitles = {
    zeroShot: " 🎠 Troy",
    pddlPlanner: "🔱 Ithica",
    promptEngineering: "🌿 Myrmidon",
  };

  return (
    
    <ThemeProvider theme={theme}>
      <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default, // Apply background color from the theme
        color: theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
        <Container sx={{
          flex: 1, // Allow the container to grow and fill the available space
          padding: 2,
        }}>
          <Grid container spacing ={3} style ={{marginTop: '20px'}}>
          <Grid item xs = {12} md ={3}>
                <CustomCard sx={{ 
                  minHeight: '100vh',
                  maxHeight: '100vh',
                  backgroundColor: "#071b33",

                  overflow: 'scroll'}}>
                  <CardContent>
                    <Box p={1}>
                      <Typography variant="h2" textAlign={"center"}>
                        Study Plans✨
                      </Typography>
                      <Typography variant="body2" textAlign={"center"}>
                      Generate recipes with our talented chef AI
                      </Typography>
                     
                  
                    </Box>

                    {workflowResults && (
                      <CustomCard
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 2,
                          maxHeight: "100vh",
                          overflowY: "auto",
                        }}
                      >
                        <Grid container spacing={2}>
                          {Object.keys(cardTitles).map((key) => (
                            <Grid item xs={12} sm={12} key={key}>
                              <CustomCard sx={{ height: "100%", borderRadius: "12px", backgroundColor: "#03111a", borderColor: "#fff4b6" }}>
                                <CardHeader
                                  title={cardTitles[key]}
                                  action={
                                    <IconButton size ="small" sx={{color: "#fff4b6"}} onClick={() => setExpandedCard(key)}>
                                      <OpenInFullIcon />
                                    </IconButton>
                                  }
                                  sx={{ pb: 0 }}
                                />
                                <CardContent sx={{ maxHeight: 150, overflow: "hidden", p: 2 }}>
                                  {workflowResults[key].error ? (
                                    <Typography variant="body2" color="error">
                                      Error: {workflowResults[key].error}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                      <ReactMarkdown>{workflowResults[key].result}</ReactMarkdown>
                                    </Typography>
                                  )}
                                </CardContent>
                              </CustomCard>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Modal for the expanded view */}
                        <Dialog
                          open={Boolean(expandedCard)}
                          onClose={() => setExpandedCard(null)}
                          fullWidth
                          maxWidth="md"
                          sx={{
                            backgroundColor: "#03111a",
                          }}
                        >
                          <DialogTitle sx={{ backgroundColor: "#03111a" }}>
                            {expandedCard ? cardTitles[expandedCard] : ""}
                          </DialogTitle>
                          <DialogContent dividers sx={{ backgroundColor: "#03111a" }}>
                            {workflowResults[expandedCard]?.error ? (
                              <Typography variant="body1" color="error">
                                <ReactMarkdown>Error: {workflowResults[expandedCard].error}</ReactMarkdown>
                              </Typography>
                            ) : (
                              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                                <ReactMarkdown>{workflowResults[expandedCard]?.result}</ReactMarkdown>
                              </Typography>
                            )}
                          </DialogContent>
                        </Dialog>
                      </CustomCard>
                    )}
                            
                  </CardContent>
                </CustomCard>
              </Grid>
              <Grid item xs = {12} md ={9}>
              <CustomCard
                sx={{
                  height: "100vh",
                  width: "100%",
                  backgroundColor: "#071b33",
                  display: "flex",
                  flexDirection: "column",
                  color: "#EDF6F9",
                  p: 2, // overall page margin
                }}
              >
                <ChatHeader />
                <ChatBody messages={messages} sx={{ flex: 1, overflowY: "auto", mb: 2 }} />
                <ChatForm message={message} setMessage={setMessage} sendMessage={sendMessage} />


              </CustomCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChatPage;
