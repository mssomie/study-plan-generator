'use client'
import {useState, useEffect} from 'react';
import { Box, Stack, Button, TextField } from '@mui/material';
import { CssBaseline, Typography } from "@mui/material";
import { Banner } from "@/components/Banner";
import { Services } from "@/components/Services";
import Alert from '@mui/material/Alert';
import {ChatHeader} from "@/components/ChatHeader"



export default function ScrapeForm(){
    const[url, setUrl]= useState('');
    const[result, setResult]= useState(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async(e)=>{
        e.preventDefault()

        const response = await fetch('/api/new_professor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url})
        })

        const data = await response.json();
        console.log('after adding',  data)
        console.log(response.status)
        if (response.status==200){
            setSuccess(true);
            setUrl('')
            console.log('success: ', success)
        }
        
    }

    useEffect(()=>{
        if (success){
            const timer = setTimeout(()=>{
                setSuccess(false)
            }, 3000)

            return ()=> clearTimeout(timer)
        }
    }, [success])

    return(
    <>
    
      <CssBaseline />
      <ChatHeader/>
      {success && <Alert severity="success">Professor added successfully</Alert>}
      
     
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            backgroundColor="#041025"
            >
               
               <Box
    //    display="flex" 
       justifyContent="center"
       alignItems="center"
       backgroundColor="#041025"
       paddingTop="20px"
       >
        
        <Typography
          variant="h3"
          fontWeight="900"
          gutterBottom
          sx={{
            textAlign: { xs: "center", md: "left" },
            color: "white"
          }}
        >
          Add A Professor
        </Typography>
        </Box>
            <Stack
                spacing={2}
                width="300px">
                    
                    
                <TextField
                label="Enter professor's Rate My Professor profile"
                variant="outlined"
                fullWidth
                value={url}
                onChange={(e)=> setUrl(e.target.value)}
                sx={{
                    flex: 1,
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.3)",
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
                      background: "#071536",
                    },
                  }}/>
                    
                <Button
                    variant = "contained"
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor:"#236ae7"
                    }

                    }
                    fullWidth>
                        Submit

                </Button>
            </Stack>
        </Box>
        </>
    )
}