"use client";

import { Send } from "lucide-react";
import { Box, Button, TextField } from "@mui/material";

export const ChatForm = ({ message, setMessage, sendMessage }) => {
  return (
    <Box
      sx={{
        padding: "15px 65px",
        borderTop: "2px solid #071536",
        display: "flex",
        alignItems: "center",
      }}
    >
      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <TextField
            label="Message"
            variant="outlined"
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
          
            }}
            sx={{
              flex: 1,
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "#5d7080",
                borderRadius: "8px",
              },
            }}
            InputLabelProps={{
              style: { color: "rgba(255,255,255,0.3)" },
            }}
            inputProps={{
              style: {
                color: "#FFFFFF",
              },
            }}
            InputProps={{
              style: {
                background: "#03111a",
              },
            }}
            multiline
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          onClick={sendMessage}
          sx={{
            borderRadius: "12px",
            padding: { md: "15px 20px", xs: "10px 10px" },
            background: "#0cf7b2",
            color: "black",
          }}
        >
          <Send />
        </Button>
      </form>
    </Box>
  );
};
