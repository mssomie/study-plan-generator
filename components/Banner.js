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
import {useRouter } from "next/navigation"
import {auth} from '@/app/lib/firebase';
import { signInAnonymously } from "firebase/auth";

export const Banner = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMediumScreen = useMediaQuery("(min-width:960px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGetStarted = async () =>{
    try{
      // anonymous sign in flow
      const userCredential = await signInAnonymously(auth); 
      console.log("Anonymous user ID: ", userCredential.user.uid);

      // redirect to consent form
      router.push(`/form?uid=${userCredential.user.uid}`);
    }catch{
      console.error("Anonymous sign-in failed: ", error);
    }
  }

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
        <Stack 
        spacing={2}
        direction="row">
          <Button
            onClick = {handleGetStarted}
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
            Form
          </Button>
     
          

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
