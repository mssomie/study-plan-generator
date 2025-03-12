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
      console.log(uid)
      const baseUrl = 'https://forms.office.com/Pages/ResponsePage.aspx';
      const formId = 'id=8l9CbGVo30Kk245q9jSBPR8ttOl3SfNAgFqJZw9Uxd1UMVNMUkdIRVlRNlpFU0NET1pQOTNDSk43NS4u';
      const questionId = 'r9aebb45895824c64840335398b2b0f9b'; 
      const formUrl = `${baseUrl}?${formId}&${questionId}=${encodeURIComponent(uid)}&embed=true`;
      setFormUrl(formUrl);
    }
  }, [uid]);

  // Detect form submission
  useEffect(() => {
    console.log(1)
    if (!uid) return;
    console.log(2)

    const userRef = doc(db, 'users', uid);

    setDoc(userRef, {surveySubmitted: false}, {merge: true}).then(()=>{
      const unsubscribe = onSnapshot(userRef, (docSnap)=>{
        if (docSnap.exists() && docSnap.data().surveySubmitted){
          window.location.href= "/thanks";
          }
        });    
  
      return ()=> unsubscribe();
  
    }).catch((error)=> console.error("Session setup fail ", error))

    
      
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



const SurveyPage = () => {
  return(
    <Suspense fallback={<div>Loading form...</div>}>
      <FormContent/>

    </Suspense>
  )
  
}


export default SurveyPage;
