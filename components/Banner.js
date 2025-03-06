"use client";


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
        backgroundImage: "url('/athena.png')",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        // justifyContent: "space-evenly",
        overflow: "hidden",
      }}
    >
      <Box sx={{ paddingX: { xs: "50px" } ,  paddingLeft: {xs:"20px", md:"250px"}}}>
        <Typography
          // variant={isSmallScreen ? "h5" : "h2"}
          variant="h1"
          fontWeight="900"
          gutterBottom
          sx={{
            textAlign: { xs: "center", md: "left" },
           
          }}
        >
          Athena
        </Typography>

        <Typography
          variant={isSmallScreen ? "body1" : "h5"}
          fontStyle="oblique"
          mb={5}
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Here to help you study better✨
        </Typography>


       

        <Stack 
        spacing={2}
        direction="row">
           <Link href="/chat">
          <Button
            variant="contained"
            sx={{
              background: "#0cf7b2",
              color:"black",
              fontWeight: "bold",
              textTransform: "capitalize",
              borderRadius: "12px",
              padding: { md: "15px 25px", xs: "10px 10px" },
            }}
          >
            Get Started
          </Button>
        </Link>
          

        </Stack>
       
      </Box>

      {/* Image */}
      {/* <Box sx={{paddingTop: "300px"}}>
        {isMediumScreen && (
          <Image
            src={athena}
            alt=""
            
            // width={isMediumScreen ? "550" : null}
            // height={350}
          />
        )}
      </Box> */}
    </Box>

  
   
  );
};
