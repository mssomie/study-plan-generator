"use client";


import {
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
} from "@mui/material";
import Link from "next/link";
import {useRouter } from "next/navigation"
import {auth} from '@/app/lib/firebase';
import { signInAnonymously } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from '@/app/lib/firebase';


export const Banner = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMediumScreen = useMediaQuery("(min-width:960px)");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleGetStarted = async () =>{
    try{
      console.log('got here')
      // anonymous sign in flow
      const userCredential = await signInAnonymously(auth); 
      const user = userCredential.user;
      console.log("Anonymous user ID: ", userCredential.user.uid);

      // Initialize session
      await setDoc(doc(db, 'sessions', user.uid), {
        created: new Date(),
        submitted: false,
        active: true
      })
      

      // redirect to consent form
      window.location.href = `/form?uid=${user.uid}`;
      
    }catch(error){
      console.error("Anonymous sign-in failed: ", error);
      alert('sign in failed: ', error.message);
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
      <Box sx={{ paddingTop:"85vh", paddingX: { xs: "50px" } ,  paddingLeft: {xs:"20px", md:"250px"}}}>
        {/* <Typography
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
        </Typography> */}


       

        {/* <Stack 
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
          

        </Stack> */}
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
      <Typography>Same</Typography>

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
