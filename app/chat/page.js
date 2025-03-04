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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChatBody } from "@/components/ChatBody";
import { ChatForm } from "@/components/ChatForm";
import  CustomCard  from "@/components/CustomCard";
import { ChatHeader } from "@/components/ChatHeader";
import theme from "../theme";


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
                          <CustomCard sx={{ height: "100%", borderRadius: "12px", backgroundColor: "#03111a" , borderColor:"#fff4b6"}}>
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
                        backgroundColor: "#03111a"
                      }}
                    >
                      <DialogTitle  sx={{
                        backgroundColor: "#03111a"
                      }}>
                        {expandedCard ? cardTitles[expandedCard] : ""}
                      </DialogTitle>
                      <DialogContent dividers sx={{ backgroundColor: "#03111a"}}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                          {expandedCard ? workflowResults[expandedCard] : ""}
                        </Typography>
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



//   // return(
//   //   <ThemeProvider theme = {theme}>
//   //      <Box
//   //     sx={{
//   //       minHeight: '100vh',
//   //       backgroundColor: theme.palette.background.default, // Apply background color from the theme
//   //       color: theme.palette.text.primary,
//   //       display: 'flex',
//   //       flexDirection: 'column',
//   //     }}
//   //   >
//   //      <Modal open ={open} onClose ={handleClose}>
//   //     <Box 
//   //       component="form" onSubmit={handleSubmit} 
//   //       position ="absolute" 
//   //       top="50%" 
//   //       left="50%" 
//   //       width={700}  
//   //       border= "2px solid #000"  
//   //       boxshadow={24} 
//   //       p={4} 
//   //       gap={2}
//   //       spacing={2}
//   //       sx={{mt: 4, transform: "translate(-50%, -50%)", backgroundColor: theme.palette.background.default}}>
        
       
//   //       <Typography variant="h3" sx={{color: 'white', alignItems: 'center', textAlign:"center", p: 4 }} gutterBottom>
//   //         Add New Item
//   //       </Typography>
//   //       <CustomTextField
//   //         variant="outlined"
//   //         placeholder="Name"
//   //         name="name"
//   //         value={formValues.name}
//   //         onChange={handleChange}
//   //         fullWidth
//   //         sx={{ mb: 2 }}
//   //         required
//   //       />
//   //       <CustomSelect
//   //         name="category"
//   //         value={formValues.category}
//   //         onChange={handleChange}
//   //         label="Category" 
//   //         fullWidth
//   //         required
//   //         placeholder="Category"
//   //         variant="outlined"
//   //         sx={
//   //           {
//   //             borderRadius: '16px',
//   //             backgroundColor: '#0f171A',
              

//   //           }
//   //         }
//   //         displayEmpty
//   //         renderValue={(selected) => {
//   //         if (selected.length === 0) {
//   //           return <p>Category</p>;  // Placeholder text
//   //         }
//   //       return selected;
//   // }}
//   //       >
          
//   //         <MenuItem value="food">Food</MenuItem>
//   //         <MenuItem value="utensils">Utensils</MenuItem>
//   //         <MenuItem value="other">Other</MenuItem>
//   //         {/* Add more MenuItem components as needed */}
//   //       </CustomSelect>
//   //       <CustomTextField
//   //         variant="outlined"
//   //         placeholder="quantity"
//   //         name="quantity"
//   //         type="number"
//   //         value={formValues.quantity}
//   //         onChange={handleChange}
//   //         fullWidth
//   //         sx={{ mb: 2, marginTop: '15px'}}
//   //         required
//   //       />
//   //       <Box sx={{ mb: 2 }}>
//   //         <Typography variant="body1" gutterBottom sx={{color:'white'}}>
//   //           Upload Image
//   //         </Typography>
//   //         <Input
//   //           type="file"
//   //           inputProps={{ accept: 'image/*' }}
//   //           onChange={handleImageChange}
//   //           fullWidth
            
//   //           endAdornment={
//   //             <InputAdornment position="end">
//   //               <Divider orientation="vertical" flexItem sx={{ mx: 1 , color:'white'}} />
//   //               <IconButton sx={{color: theme.palette.primary.main}} onClick={handleCameraInput}>
//   //                 <CameraAltIcon />
//   //                 <Typography sx={{color: 'white', padding:'8px'}}>
//   //                   Use Camera
//   //                 </Typography>
//   //               </IconButton>
//   //             </InputAdornment>
//   //           }
//   //           sx={{
//   //             backgroundColor: "#0f171A",
//   //             borderRadius: '16px',
//   //             padding: '1px 1px',
//   //             '& input': {
//   //               padding: '0.8rem 0.8rem', // Adjust padding to fit height
//   //             },
//   //             '& .MuiOutlinedInput-root': {
//   //               '& fieldset': {
//   //                 borderColor: '#4c5e63',
//   //                 borderRadius: '16px',
//   //                 borderWidth: '1px',
//   //               },
//   //               '&:hover fieldset': {
//   //                 borderColor: '#02E6A2',
//   //                 borderWidth: '1px',
//   //               },
//   //               '&.Mui-focused fieldset': {
//   //                 borderColor: '#02E6A2',
//   //                 borderWidth: '1px',
//   //               },
//   //             },
//   //           }}
//   //         />
//   //       </Box>
//   //       <Button variant="contained" color="primary" type="submit" onSubmit={handleSubmit} >
        
              
//   //         Submit
//   //       </Button>
//   //     </Box>
          

//   //   </Modal>
//   //      <Container sx={{
//   //         flex: 1, // Allow the container to grow and fill the available space
//   //         padding: 2,
//   //       }}
//   //     >
//   //       <Typography variant = "h1"> Stockify </Typography>

//   //       <Grid container spacing ={3} style ={{marginTop: '20px'}}>
//   //         <Grid item xs = {12} md ={3}>
//   //           <CustomCard sx={{ 
//   //             minHeight: '40vh',
//   //             maxHeight: '100vh',
//   //             overflow: 'scroll'}}>
//   //             <CardContent>
//   //               <Box p={1}>
//   //                 <Typography variant="h2" textAlign={"center"}>
//   //                   Culina👩🏾‍🍳✨
//   //                 </Typography>
//   //                 <Typography variant="body2" textAlign={"center"}>
//   //                  Generate recipes with our talented chef AI
//   //                 </Typography>
//   //                 <Box textAlign={"center"}>
//   //                   <Button sx={{
//   //                       padding: '0.65em 1rem',
//   //                   }}

//   //                   variant = "contained" onClick={()=>{generateRecipe(inventory)}} startIcon ={<SmartToyIcon />}>
//   //                     Generate Recipe
//   //                   </Button>

//   //                 </Box>
               

//   //                 <Typography variant="body2">
//   //                   <ReactMarkdown>{recipe}</ReactMarkdown>

//   //                 </Typography>
//   //               </Box>
    
//   //             </CardContent>
//   //           </CustomCard>
//   //         </Grid>
//   //         <Grid item xs ={12} md={9}>
//   //           <Box sx={{ 
//   //             minHeight: '100vh'}}>
//   //             <Typography variant="h2">
//   //               {/* Everyone has the right to freedom of thought */}
//   //             </Typography>
//   //             <Box width="100%" sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
//   //               <Grid container spacing ={2}>
//   //                 <Grid item xs={9} md={10}> 
                  
//   //                 <TextField
//   //                   variant="outlined"
//   //                   placeholder="Start typing to filter.."
//   //                   value={searchQuery}
//   //                   onChange={handleSearchChange}
//   //                   fullWidth
                    
//   //                   sx={{backgroundColor: "#0f171A",
                    
//   //                   borderRadius: '16px', 

//   //                   '& .MuiInputBase-input': {
//   //                     padding: '0.8rem 0.8rem', // Adjust padding to fit height
//   //                   },
                   
                    
//   //                   padding: '1px 1px', 
//   //                   '& .MuiOutlinedInput-root': {
//   //                     '& fieldset': {
//   //                       borderColor: '#4c5e63',
//   //                       borderRadius: '16px', 
//   //                       borderWidth: '1px',
//   //                     },
//   //                     '&:hover fieldset': {
//   //                       borderColor: '#02E6A2',
//   //                       borderWidth: '1px',
//   //                     },
//   //                     '&.Mui-focused fieldset': {
//   //                       borderColor: '#02E6A2',
//   //                       borderWidth: '1px',
//   //                     },
//   //                   },}}
//   //                   InputProps={{
//   //                     endAdornment: (
//   //                       <InputAdornment position="end" spacing={2}>
//   //                         <IconButton onClick={handleSearchChange}>
//   //                           <SearchIcon sx={{ color: theme.palette.primary.main}}/>
//   //                           <Typography variant ="body1" sx={{color: 'white', padding: '8px'}}>
//   //                             Search
//   //                             </Typography>
//   //                         </IconButton>
//   //                       </InputAdornment>
//   //                     ),
                     
//   //                   }}
//   //                 />
          

//   //                 </Grid>
//   //                 <Grid item xs={3} md={2}>
//   //                 <Button sx={{
//   //                      padding: '0.65em 1rem',
//   //                 }}
//   //                 variant = "contained" onClick={()=>{handleOpen()}} startIcon ={<AddIcon />}>
//   //                    New Item
//   //                 </Button>

//   //                 </Grid>
//   //               </Grid>
                
//   //             </Box>
//   //             {               
//   //                 <Grid>
//   //                   <ItemList 
//   //                   items={filteredItems}
//   //                   addItem={addItem}
//   //                   removeItem={removeItem}
//   //                   />               
//   //                 </Grid>
                
//   //             }
              


            

//   //           </Box>
//   //         </Grid>

//   //       </Grid>
      

//   //   </Container>
//   //   </Box>

//   //   </ThemeProvider>
   
  
//   )
// }