import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Avatar, Box } from "@mui/material";

export const ChatBody = ({ messages }) => {
  return (
    <Box
      sx={{
        flex: "1",
        overflowY: "auto",
        paddingX: { md: "50px", xs: "10px" },
        display: { md: "10px 70px", xs: "10px 30px" },
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
            <Avatar
              sx={{
                backgroundColor: "#6C95EF",
                border: "2px solid pink",
                order: message.role === "assistant" ? 0 : 2,
              }}
            >
              {message.role === "assistant" ? <Bot /> : <User />}
            </Avatar>

            <Box
              sx={{
                minWidth: "7%",
                maxWidth: { md: "55%", xs: "80%" },
                borderRadius: "12px",
                padding: "12px",
                backgroundColor: "#071536",
                listStylePosition: "inside", 
              }}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
