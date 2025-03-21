"use client";

import { useMemo, useState, useEffect } from "react";
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
  DialogActions,
  Slide,
  CircularProgress
} from "@mui/material";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import CustomCard from "@/components/CustomCard";
import { ChatHeader } from "@/components/ChatHeader";
import theme from "../theme";
import ReactMarkdown from "react-markdown";
import { auth } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { marked } from 'marked';

// Import libraries for PDF generation
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const ChatPage = () => {
  const [globalUser, setGlobalUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm Athena! I'm here to craft the perfect study plan for you. Just tell me what you're studying, and if you’d like, share any details—like topics, your comfort level, or how much time you have. Let’s make a plan that works for you!"
    },
  ]);
  
  // Histories for different workflows
  const [zeroShotHistory, setZeroShotHistory] = useState([
    { role: "assistant", content: "Initial system message" }
  ]);
  const [promptEngineeringHistory, setPromptEngineeringHistory] = useState([
    { role: "assistant", content: "Initial system message" }
  ]);
  const [pddlPlannerHistory, setPddlPlannerHistory] = useState([
    { role: "assistant", content: "Initial system message" }
  ]);
  
  // Survey Popup state
  const [open, setOpen] = useState(false);
  const [downloadChecked, setDownloadChecked] = useState(true);

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
  }, [cardTitles]);

  // Access verification
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        await auth.authStateReady();
        const user = auth.currentUser;
        setGlobalUser(user);
        if (!user) {
          window.location = '/';
          return;
        }
        const docSnap = await getDoc(doc(db, 'sessions', user.uid));
        if (!docSnap.exists() || !docSnap.data().submitted) {
          window.location = 'form?uid=' + user.uid;
        }
      } catch (error) {
        console.log("Access check failed: ", error);
      }
    };
    verifyAccess();
  }, []);

  const downloadPDF = () => {
    return new Promise((resolve, reject) => {
      if (!workflowResults) {
        reject("No workflowResults");
        return;
      }

      const pdfContent = document.createElement("div");
      pdfContent.style.position = "absolute";
      pdfContent.style.left = "-9999px";
      
      // Enhanced PDF styling
      pdfContent.style.backgroundColor = "#03111a";
      pdfContent.style.color = "#ffffff";
      pdfContent.style.fontFamily = "'Signika', sans-serif";
      pdfContent.style.padding = "40px";
      pdfContent.style.maxWidth = "1200px";
      pdfContent.style.lineHeight = "1.8";
      pdfContent.style.fontSize = "16px";

      // Add print-specific styles
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body {
            font-size: 14pt !important;
            line-height: 1.8 !important;
          }
          h1 { 
            font-size: 24pt !important; 
            margin: 20px 0 30px 0 !important;
            border-bottom: 2px solid #fff !important;
            padding-bottom: 15px !important;
          }
          h2 {
            font-size: 20pt !important;
            margin: 30px 0 15px 0 !important;
            color: #0cf7b2 !important;
          }
          p {
            margin: 0 0 20px 0 !important;
            text-align: justify;
          }
          ul, ol {
            margin: 15px 0 25px 30px !important;
          }
          li {
            margin-bottom: 12px !important;
          }
          .page-break {
            page-break-before: always;
            padding-top: 40px;
          }
        }
      `;
      pdfContent.appendChild(style);

      const header = document.createElement("h1");
      header.textContent = "Study Plan";
      header.style.textAlign = "center";
      header.style.marginBottom = "30px";
      pdfContent.appendChild(header);

      let isFirst = true;
      for (const key in workflowResults) {
        if (!isFirst) {
          const pageBreak = document.createElement("div");
          pageBreak.className = "page-break";
          pdfContent.appendChild(pageBreak);
        }
        isFirst = false;

        const section = document.createElement("div");
        
        const title = document.createElement("h2");
        title.textContent = cardTitles[key] || key;
        title.style.marginBottom = "25px";
        section.appendChild(title);
        
        const content = document.createElement("div");
        const text = workflowResults[key]?.result || "No result";
        content.innerHTML = marked(text);
        content.style.marginTop = "15px";
        
        // Add styling to markdown elements
        content.querySelectorAll('p').forEach(p => {
          p.style.margin = "0 0 20px 0";
          p.style.lineHeight = "1.8";
        });
        
        content.querySelectorAll('li').forEach(li => {
          li.style.marginBottom = "12px";
        });

        section.appendChild(content);
        pdfContent.appendChild(section);
      }

      document.body.appendChild(pdfContent);

      setTimeout(async () => {
        try {
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
  
          // Calculate content height in pixels
          const contentHeight = pdfContent.scrollHeight;
          
          // Convert page height to pixels (1mm ≈ 3.78px)
          const pageHeightPx = pageHeight * 3.78;
          
          // Calculate number of needed pages
          const pageCount = Math.ceil(contentHeight / pageHeightPx);
          
          // Create a canvas for each page
          for (let i = 0; i < pageCount; i++) {
            const canvas = await html2canvas(pdfContent, {
              scale: 1.2,
              useCORS: true,
              letterRendering: true,
              windowHeight: pageHeightPx,
              y: i * pageHeightPx,
              backgroundColor: "#03111a"
            });
  
            if (i > 0) pdf.addPage();
            
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, imgHeight);
          }
  
          pdf.save('study_plan.pdf');

          await new Promise(resolve => setTimeout(resolve, 1000));

          document.body.removeChild(pdfContent);
          resolve();
        } catch (error) {
          document.body.removeChild(pdfContent);
          reject(error);
        }
      }, 1500);
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleContinue = async () => {  
    try {
      if (downloadChecked) {
        await downloadPDF(); // Wait for PDF to complete
      }
      goToSurvey();
    } catch (error) {
      console.error('PDF download failed:', error);
      // Optional: Show error message to user
      setMessages(prev => [...prev, { 
        role: "error", 
        content: "Failed to download PDF. Please try again." 
      }]);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const userMessage = { role: "user", content: message };
    setMessage("");
    setMessages(prev => [...prev, userMessage]);
    setZeroShotHistory(prev => [...prev, userMessage]);
    setPromptEngineeringHistory(prev => [...prev, userMessage]);
    setPddlPlannerHistory(prev => [...prev, userMessage]);
  
    // Show side card with loader immediately
    setLoading(true);
  
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
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status} : ${errorData}`);
      }
  
      const data = await response.json();
      setWorkflowResults(data);
  
      const assistantMessage = {
        role: "assistant",
        content: "Your study plan has been generated.",
      };
      setMessages(prev => [...prev, assistantMessage]);
      setZeroShotHistory(prev => [...prev, assistantMessage]);
      setPromptEngineeringHistory(prev => [...prev, assistantMessage]);
      setPddlPlannerHistory(prev => [...prev, assistantMessage]);
  
      setLoading(false);
    } catch (errorMessage) {
      console.error("Error in sendMessage:", errorMessage);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred. Please try again!" },
        { role: "error", content: errorMessage }
      ]);
      setZeroShotHistory(prev => [...prev, { role: "error", content: errorMessage }]);
      setPromptEngineeringHistory(prev => [...prev, { role: "error", content: errorMessage }]);
      setPddlPlannerHistory(prev => [...prev, { role: "error", content: errorMessage }]);
      setLoading(false);
    }
  };

  // Redirect to survey page
  const goToSurvey = async () => { 
    try {
      if (!globalUser) {
        window.location.href = "/";
        return;
      }
      const uid = encodeURIComponent(globalUser.uid);
      window.location.href = `/survey?uid=${uid}`;
    } catch (error) {
      console.error('Survey error', error);
      setMessages(prev => [...prev, { role: "error", content: "Failed to start survey. Please try again" }]);
    }
  };

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
        <Container sx={{ flex: 1 }}>
          <Grid container spacing={3} sx={{ marginTop: '20px' }}>
            {/* Side Card Grid Item: Render when loading or workflowResults exist */}
            {(loading || workflowResults) && (
              <Grid item xs={12} md={3} sx={{ p: 0 }}>
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "90vh",
                      backgroundColor: "#071b33"
                    }}
                  >
                    <CircularProgress color="secondary" />
                  </Box>
                ) : (
                  <Slide direction="right" in={!!workflowResults} mountOnEnter unmountOnExit>
                    <CustomCard
                      sx={{ 
                        minHeight: "90vh",
                        maxHeight: "90vh",
                        backgroundColor: "#071b33",
                        overflow: "scroll"
                      }}
                    >
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
                                  <CustomCard
                                    sx={{
                                      height: "100%",
                                      borderRadius: "12px",
                                      backgroundColor: "#03111a",
                                      borderColor: "#fff4b6",
                                      padding: "4px",
                                    }}
                                  >
                                    <CardHeader
                                      title={cardTitles[key]}
                                      action={
                                        <IconButton
                                          size="small"
                                          sx={{ color: "#fff4b6", fontSize: "small", padding: "4px" }}
                                          onClick={() => setExpandedCard(key)}
                                        >
                                          <OpenInFullIcon />
                                        </IconButton>
                                      }
                                      sx={{ pb: 0 }}
                                    />
                                    <CardContent sx={{ maxHeight: 150, overflow: "hidden", p: 2 }}>
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
                              sx={{ backgroundColor: "#03111a", margin: "40px" }}
                            >
                              <DialogTitle sx={{ backgroundColor: "#03111a" }}>
                                {expandedCard ? cardTitles[expandedCard] : ""}
                              </DialogTitle>
                              <DialogContent dividers sx={{ backgroundColor: "#03111a", padding: "5%" }}>
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
                  </Slide>
                )}
              </Grid>
            )}
  
            {/* Chat Box Grid Item: Full width if no side card, or 9/12 if side card exists */}
            <Grid item xs={12} md={(loading || workflowResults) ? 9 : 12}>
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
          }}
        >
          <Button
            onClick={handleClickOpen}
            variant="contained"
            sx={{
              background: "#0cf7b2",
              color: "black",
              fontWeight: "normal",
              textTransform: "capitalize",
              borderRadius: "40px",
              width: { md: "200px", xs: "100px" },
              height: { md: "50px", xs: "40px" },
              padding: { md: "15px 25px", xs: "10px 10px" },
            }}
          >
            Continue
          </Button>
        </Stack>
      </Box>
      <Dialog open={open} onClose={handleClose} sx={{backgroundColor: '#03111a'}}>
        <DialogTitle sx={{backgroundColor: "#03111a"}}>Download Answers</DialogTitle>
        <DialogContent sx={{backgroundColor: "#03111a", p: 2}}>
          <DialogContentText>
            <Typography variant="body" sx={{color: "white"}}>
            Do you want to download your answers for reference during the survey?

            </Typography>
            
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
        <DialogActions sx={{backgroundColor: "#03111a"}}>
          <Button onClick={handleClose} sx={{backgroundColor: "#203347", color: "white"}}>
         
            Cancel
       
            
          </Button>
          <Button onClick={handleContinue} color="primary" disabled={loading}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ChatPage;
