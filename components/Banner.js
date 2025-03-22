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
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Image from 'next/image';
import theme from '@/app/theme';


export const Banner = () => {
  // const theme = useTheme();
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
   
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: { xs: '20px', md: '50px' },
          position: 'relative',
        }}
      >
        {/* Text Section */}
        <Box
          sx={{
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: { md: '50px' },
            marginLeft: { md: '5%' },
            marginRight: { md: '5%' },
            width: { md: '66.66%' },
            zIndex: 1,
          }}
        >
          <Typography
            variant="title"
            component="div"
            gutterBottom
            sx={{
              textAlign: 'center',
              // marginBottom: '40px',
              paddingBottom: '0px',
              marginBottom: '0px',
            }}
          >
            Athena
          </Typography>
          <Typography
            variant="body2"
            component="div"
            gutterBottom
            sx={{
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Thanks for participating in this study!  It involves 3 steps that you can complete in 7 minutes.          </Typography>
            <Stack direction="row" spacing={4} justifyContent="space-between" sx={{marginBottom: '40px',
}}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" component="div" sx={{color: "#fb449c", textShadow: '2px 2px 4px #fb449c'}} gutterBottom>
                1
              </Typography>
              <Typography variant="h6" component="div" gutterBottom>
                Consent
              </Typography>
              <Typography variant="body1" component="div" gutterBottom>
                Fill the consent form
              </Typography>
              <Typography variant="body1">
                (est. time: 2 minutes)
              </Typography>
            </Box>


            <Box sx={{ textAlign: 'center', paddingTop: '20px' }}>
              <Typography variant="h1" component="div" sx={{color: "#fff4b6", textShadow: '2px 2px 4px #fff4b6'}} gutterBottom>
                2
              </Typography>
              <Typography variant="h6" component="div" gutterBottom>
                Experiment
              </Typography>
              <Typography variant="body1" component="div" gutterBottom>
              Prompt the system and 
              </Typography>
              <Typography variant="body1">
              view the study plans
              </Typography>
            </Box>


            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" component="div" sx={{color: "#0cf7b2", textShadow: '2px 2px 4px #0cf7b2'}}  gutterBottom>
                3
              </Typography>
              <Typography variant="h6" component="div" gutterBottom>
                Survey
              </Typography>
              <Typography variant="body1" component="div" gutterBottom>
                Answer questions about 
              </Typography>
              <Typography variant="body1">
                the study plans 
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGetStarted}
            sx={{
              marginTop: '40px',
              alignSelf: 'center',
              textTransform: 'capitalize',
              borderRadius: '20px',
              width: { md: '200px', xs: '200px' },
              padding: { md: '11px 25px', xs: '10px 10px' },
            }}
          >
            Get Started
          </Button>

          
          <Box 
            sx={{ 
              position: "relative",
              bottom: 0,    
              color: "#0cf7b2",
              paddingTop: "50px",
              cursor: "pointer", // indicates it's clickable,
              textDecoration: "underline", // 
              "&:hover": { color: "white" } // changes color on hover
            }}
            
          >
            <Typography variant="body1" onClick={() => {
              const link = document.createElement("a");
              link.href = "/details.pdf"; // Replace with the actual path
              link.download = "experiment.pdf"; // Desired file name on download
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              Read about the experiment
            </Typography>
        </Box>
        </Box>

        {/* Image Section */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            width: { md: '33.33%' },
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {isMediumScreen && (
            <Image
              src="/athena-blank.png"
              alt="Athena"
              layout="fill"
              objectFit="cover"
              objectPosition="top"
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
   
  );
};
