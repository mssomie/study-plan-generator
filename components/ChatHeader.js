import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";

export const ChatHeader = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#061737",
        display: "flex",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <Link href="/">
            <ChevronLeft color="white" size={32} />
          </Link>

          <Typography variant="h4" fontWeight="600" color="white">
            🤖 Prof Buddy
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
