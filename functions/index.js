const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
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