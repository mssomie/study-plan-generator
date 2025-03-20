"use client";

import { useMemo, useState } from "react";
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
  ThemeProvider,
  Stack,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  DialogActions
} from "@mui/material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import  CustomCard  from "@/components/CustomCard";
import { ChatHeader } from "@/components/ChatHeader";
import theme from "../theme";
import ReactMarkdown from "react-markdown";
import {auth} from '@/app/lib/firebase';
import {doc, getDoc} from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import {useEffect} from 'react';


const ChatPage = () => {
  
  const [globalUser, setGlobalUser] = useState(null);
  // Access verification
  useEffect(()=> {
    const verifyAccess = async () => {
      try{
        await auth.authStateReady();
        const user = auth.currentUser;
        setGlobalUser(user);
  
        
        if(!user){
          window.location = '/'
          console.log("e be like say e no user");
          return
        }
  
        const docSnap = await getDoc(doc(db, 'sessions', user.uid))
  
        if(!docSnap.exists() || !docSnap.data().submitted){
          window.location = 'form?uid=' + user.uid
          console.log('couldnt find you')
        }

      }catch(error){
        console.log("Access check failed: ", error);
        // window.location ='/';
      }

     
    }

    verifyAccess()
  }, []);


  


// Chat Management
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

  // Survey Popup 
  const [open, setOpen] = useState(false);
  const [downloadChecked, setDownloadChecked] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleContinue = () => {  
    if (downloadChecked) {
      downloadAnswersAsPDF();
    }
  
    goToSurvey();
  }


  const downloadAnswersAsPDF = () => {
    console.log("Downloading answers as PDF");
  }
  const handleClose = () => {
    setOpen(false);
  }



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
      if (!response.ok){
        const errorData = await response.text();
        throw new Error(`API Error ${response.status} : ${errorData}`)
      }
  
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

  // Shuffle order of cards
  const shuffledCardKeys = useMemo(() => {
    const keys = Object.keys(cardTitles);
  
    for (let i = keys.length - 1; i > 0; i--) {   
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
  }, []);

  
  const goToSurvey = async () =>{
    try{
      if (!globalUser){
        console.log("No user found... redirecting to home page");
        window.location.href="/";
        return
      }
  
      const uid = encodeURIComponent(globalUser.uid);
    
    // Call Cloud Function
    // const response = await fetch('https://us-central1-athena-8749c.cloudfunctions.net/handleSurveySubmit', {
    //   method: 'POST',
    //   headers: {'Content-Type': 'application/json'},
    //   body: JSON.stringify({ uid: globalUser.uid })
    // });

    // if (!response.ok) throw new Error('Survey setup failed');
    
    // Redirect after successful call
    window.location.href = `/survey?uid=${uid}`;

      
    }catch(error){
      console.error('Survey error', error);
      setMessages(prev=> [...prev, {
        role:"error",
        content: "Failed to start survey. Please try again"
      }])
    }
   
  }

  return (
    
    <ThemeProvider theme={theme}>
     
      <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
        
      }}
    >
       <ChatHeader />
        <Container sx={{
          flex: 1, 
          // padding: 2,
        }}>
          <Grid container spacing ={3} sx ={{marginTop: '20px'}}>
          <Grid item xs = {12} md ={3} sx={{p:0}}>
                <CustomCard sx={{ 
                  minHeight: '90vh',
                  maxHeight: '90vh',
                  backgroundColor: "#071b33",

                  overflow: 'scroll'}}>
                  <CardContent>
                    <Box p={1}>
                      <Typography variant="h3" textAlign={"center"}>
                        Study Plans✨
                      </Typography>
                      <Typography variant="body" textAlign={"center"}>
                    Click on the expand icon to view the details.
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
                          {shuffledCardKeys.map((key) => (
                            <Grid item xs={12} sm={12} key={key}>
                              <CustomCard sx={{ height: "100%", borderRadius: "12px", backgroundColor: "#03111a", borderColor: "#fff4b6", padding: "4px" }}>
                                <CardHeader
                                  title={cardTitles[key]}
                                  action={
                                    
                                    <IconButton size ="small" sx={{color: "#fff4b6", fontSize: "small", padding: "4px"}} onClick={() => setExpandedCard(key)}>
                                      <OpenInFullIcon />
                                    </IconButton>
                                  }
                                  sx={{ pb: 0 }}
                                />
                                <CardContent sx={{ maxHeight: 150, overflow: "hidden", p: 2,}}>
                                  {workflowResults[key].error ? (
                                    <Typography variant="body1" color="error">
                                      Error: {workflowResults[key].error}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
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
                            margin: "40px"
                          }}
                        >
                          <DialogTitle sx={{ backgroundColor: "#03111a" }}>
                            {expandedCard ? cardTitles[expandedCard] : ""}
                          </DialogTitle>
                          <DialogContent dividers sx={{ backgroundColor: "#03111a", padding:"5%" }}>
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
              <Grid item xs = {12} md ={9} >
              <CustomCard
                sx={{
                  minHeight: "90vh",
                  maxHeight: "90vh",
                  width: "100%",
                  backgroundColor: "#071b33",
                  display: "flex",
                  flexDirection: "column",
                  color: "#EDF6F9",
                  p: 2, 
                }}
              >
                {/* <ChatHeader /> */}
                <ChatBody messages={messages} sx={{ flex: 1, overflowY: "auto", mb: 2 }} />
                <ChatForm message={message} setMessage={setMessage} sendMessage={sendMessage} />


              </CustomCard>
            </Grid>
          </Grid>
        </Container>
        <Stack 
        spacing={2}
        direction="row"
        sx={{
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}>
          <Button
            onClick = {handleClickOpen}
            variant="contained"
            sx={{
              background: "#0cf7b2",
              color:"black",
              fontWeight: "normal",
              textTransform: "capitalize",
              borderRadius: "40px",
              width: {md:"200px", xs: "100px"},
              height: {md:"50px", xs: "40px"},
              padding: { md: "15px 25px", xs: "10px 10px" },
            }}
          >
            Continue
          </Button>

        </Stack>
        
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Download Answers</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to download your answers for reference during the survey?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox
                checked={downloadChecked}
                onChange={(e) => setDownloadChecked(e.target.checked)}
              />
            }
            label="Download PDF with answers"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleContinue} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ChatPage;
