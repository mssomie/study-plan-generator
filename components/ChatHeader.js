import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import { ChevronLeft } from "lucide-react";

export const ChatHeader = () => {
  return (
    <Box
      sx={{
        // backgroundColor: "#061737",
        display: "flex",
        padding: "20px",
        paddingBottom: "0px",
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
          <Stack direction="column" gap="10px">
          <Typography variant="h4" fontWeight="600" color="white">
            {/* Athena✨ */}
            The Experiment
          </Typography>
          <Typography variant="body" fontWeight="600" color="white" sx={{fontWeight: 300}}>
            {/* Athena✨ */}
           Prompt the system to generate study plans. Once you are satisfied with the results, click on the continue button below to proceed to hte next page 
          </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
