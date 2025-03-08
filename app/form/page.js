"use client";

import {Box} from "@mui/material";
import { useSearchParams } from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export const dynamic = 'force-dynamic';

function FormContent(){
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const [formUrl, setFormUrl ] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Set up form URL with UID
  useEffect(() => {
    if (uid){
      const baseUrl = 'https://forms.office.com/Pages/ResponsePage.aspx';
      const formId = 'id=8l9CbGVo30Kk245q9jSBPR8ttOl3SfNAgFqJZw9Uxd1UOVRKUEJPNk00SjczSk5RR0NVTjlIS04zWC4u';
      const formUrl = `${baseUrl}?${formId}&embed=true&userId=${uid}`;
      setFormUrl(formUrl)
      setIsLoading(false)
    }
  }, [uid])

  // Detect form submission
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "form-submitted"){
        handleFormCompletion();

      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [uid]);

  const handleFormCompletion = async () =>{
    try{
      await setDoc(doc(db, 'users', uid), {
        formSubmitted: true,
        submittedAt: new Date()
      });
      window.location.href= '/chat';
    }
    catch(error){
      console.error('Firestore update failed: ', error);
    }
  };

  if (isLoading){
    return <div>Loading... </div>
  }

  return (
      <Box sx={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <iframe 
        src={formUrl}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%'
        }}
        allowFullScreen
      />
    </Box>


    
  );
};



const FormPage = () => {
  return(
    <Suspense fallback={<div>Loading form...</div>}>
      <FormContent/>

    </Suspense>
  )
  
}


export default FormPage;
