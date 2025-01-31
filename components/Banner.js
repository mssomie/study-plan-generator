"use client";

import Image from "next/image";
import {
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Button,
  Stack
} from "@mui/material";
import Link from "next/link";

export const Banner = () => {
  const theme = useTheme();
  const isMediumScreen = useMediaQuery("(min-width:960px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        color: "white",
        background: "#041025",
        // padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        overflow: "hidden",
      }}
    >
      <Box sx={{ paddingX: { xs: "50px" } }}>
        <Typography
          variant={isSmallScreen ? "h5" : "h2"}
          fontWeight="900"
          gutterBottom
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Rate My Professor
        </Typography>

        <Typography
          variant={isSmallScreen ? "body1" : "h5"}
          fontStyle="oblique"
          mb={5}
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Your AI-powered assistant for personalized professor ratings and
          reviews, retrieving insights
        </Typography>


       

        <Stack 
        spacing={2}
        direction="row">
           <Link href="/chat">
          <Button
            variant="contained"
            sx={{
              background: "#236AE7",
              textTransform: "capitalize",
              borderRadius: "12px",
              padding: { md: "15px 25px", xs: "10px 10px" },
            }}
          >
            Find A Professor
          </Button>
        </Link>
           <Link href="/add_professor">
          <Button
            variant="contained"
            sx={{
              background: "#236AE7",
              textTransform: "capitalize",
              borderRadius: "12px",
              padding: { md: "15px 25px", xs: "10px 10px" },
            }}
          >
            Add A Professor
          </Button>
        </Link>

        </Stack>
       
      </Box>

      {/* Image */}
      <Box>
        {isMediumScreen && (
          <Image
            src="/banner.svg"
            alt=""
            width={isMediumScreen ? "550" : null}
            height={350}
          />
        )}
      </Box>
    </Box>
  );
};
