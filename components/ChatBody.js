import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Avatar, Box, ThemeProvider, Typography } from "@mui/material";
import theme from "@/app/theme";

export const ChatBody = ({ messages }) => {
  return (
    <ThemeProvider theme={theme}>
       <Box
      sx={{
        flex: "1",
        overflowY: "auto",
        paddingX: { md: "50px", xs: "10px" },
        // display: { md: "10px 70px", xs: "10px 30px" },
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent:
              message.role === "assistant" ? "flex-start" : "flex-end",
            padding: "12px 20px",
            gap: "20px",
            
          }}
        >
          {/* Message */}
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              justifyContent:
                message.role === "assistant" ? "flex-start" : "flex-end",
              
            }}
          >
           
            <Box
              sx={{
                minWidth: "7%",
                maxWidth: { md: "55%", xs: "80%" },
                borderRadius: "12px",
                padding: "12px",
                backgroundColor:
                  message.role === "assistant" ? "#203347" : "#0cf7b2",
                color:
                message.role === "assistant" ? "white" : "black",
                listStylePosition: "inside", 
                fontSize: '16px',
                fontWeight: 300
              }}
            >
              {/* <Typography variant="body1"> */}
              <ReactMarkdown variant="body1">{message.content}</ReactMarkdown>
              {/* </Typography> */}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  </ThemeProvider>
   
  );
};
