"use client";

import {Box, CircularProgress} from "@mui/material";
import { useSearchParams } from 'next/navigation';
import {Suspense, useEffect, useState} from 'react';
import { doc,setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export const dynamic = 'force-dynamic';

function FormContent(){
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const [formUrl, setFormUrl ] = useState('');

  
  // Set up form URL with UID
  useEffect(() => {
    if (uid) {
      const baseUrl = 'https://forms.office.com/Pages/ResponsePage.aspx';
      const formId = 'id=8l9CbGVo30Kk245q9jSBPR8ttOl3SfNAgFqJZw9Uxd1UOVRKUEJPNk00SjczSk5RR0NVTjlIS04zWC4u';
      const questionId = 'rdc95bcffc45e450d86d6fcbfd4e2a965'; 
      const formUrl = `${baseUrl}?${formId}&${questionId}=${encodeURIComponent(uid)}&embed=true`;
      setFormUrl(formUrl);
    }
  }, [uid]);

  // Detect form submission
  useEffect(() => {
    if (!uid) return;

    const sessionRef = doc(db, 'sessions', uid);

    setDoc(sessionRef, {submitted: false}, {merge: true}).then(()=>{
      const unsubscribe = onSnapshot(doc(db, 'sessions', uid), (docSnap)=>{
        if (docSnap.exists() && docSnap.data().submitted){
          setDoc(doc(db, 'users', uid), {
            formSubmitted: true,
            createdAt: new Date()
          }).then(()=>{
            window.location.href= "/chat";
          })
        }
      });    
  
      return ()=> unsubscribe();
  
    }).catch((error)=> console.error("Session setup fail "))

    
      
    }, [uid]);


  if (!formUrl){
    return (
      <Box sx ={{
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress/>

      </Box>
    );
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
