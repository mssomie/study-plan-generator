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
    
    if (!uid || typeof uid !== 'string') {
      return res.status(400).send('Invalid UID');
    }

    await admin.firestore().collection('sessions').doc(uid).update({
      submitted: true,
      submittedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).send('Submission recorded');
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});