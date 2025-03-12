const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const functions = require('firebase-functions')
const admin = require('firebase-admin');

setGlobalOptions({ maxInstances: 10 });
admin.initializeApp();

exports.handleFormSubmit = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(403).send('Forbidden');
    }

    const { uid } = req.body;
    console.log("Received UID: ", uid);
    
    if (!uid || typeof uid !== 'string') {
        console.error("Invalid UID", uid);
        return res.status(400).send('Invalid UID');
    }

    await admin.firestore().collection('sessions').doc(uid).set({
        submitted: true,
        submittedAt: admin.firestore.FieldValue.serverTimestamp()
      }); 
      console.log("Document created for UID: ", uid)
      return res.status(200).send('Submission recorded');
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send('Internal Server Error');
    }
});

exports.handleSurveySubmit = functions.https.onRequest(async (req, res)=>{
      
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS'){
        res.status(204).send('');
        return;
    }

    try{
         const {uid }= req.body;

         if (!uid){
            throw new Error ('Missing UID parameter')

         }

         console.log(`Received survey request for UID: ${uid}`)

         const surveyRef = admin.firestore().collection('surveys').doc(uid);
         await surveyRef.set({
            uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
         });

         res.status(200).json({ 
            success: true,
            redirectUrl: `/survey?uid=${encodeURIComponent(uid)}`
          });
      
        } catch (error) {
          console.error('Error in handleSurveySubmit:', error);
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      });