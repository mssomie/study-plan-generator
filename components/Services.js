import { Box, Paper, Typography } from "@mui/material";

export const Services = () => {
  return (
    <Box
      sx={{
        padding: { md: "100px", xs: "30px" },
        display: "flex",
        background: "#7EA8F1",
        flexDirection: "column",
      }}
    >
      <Typography textAlign="center" variant="h3" fontWeight="900" mb={5}>
        Our Services
      </Typography>

      <Typography variant="h6" fontStyle="oblique" textAlign="center" mb={3}>
        Discover the Ideal workspace with AI-Powered Insights
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { md: "row", xs: "column" },
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            paddingX: { md: "50px", xs: "10px" },
            paddingY: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // width: { md: "45%", xs: "100%" },
          }}
        >
          <Typography variant="h6">AI Powered Recommendations</Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            paddingX: { md: "50px", xs: "10px" },
            paddingY: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // width: { md: "45%", xs: "100%" },
          }}
        >
          <Typography variant="h6">Effortless Experience</Typography>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            paddingX: { md: "50px", xs: "10px" },
            paddingY: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // width: { md: "45%", xs: "100%" },
          }}
        >
          <Typography variant="h6">Personalized Insights</Typography>
        </Paper>
      </Box>
    </Box>
  );
};
