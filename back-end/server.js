const express = require('express');
require('dotenv').config();
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const cron = require('node-cron');
const path = require('path');

const app = express();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
}

const serviceAccount = require(serviceAccountPath);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://svasthmaitri-default-rtdb.firebaseio.com/',
});

app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

// Add this volunteer submission endpoint 
// Add to your server.js endpoint
app.post('/submit-volunteer', upload.single('medicalId'), (req, res) => {
  // Get registration number
  const medRegNumber = req.body.medicalRegistrationNumber;
  
  // Demo verification logic - whitelist specific test numbers
  const verifiedTestNumbers = ['MD123456', 'RN789012', 'DR456789'];
  
  // Check if registration number follows a valid pattern
  const validFormat = /^[A-Z]{2}\d{6}$/.test(medRegNumber);
  
  // Determine verification status
  let status;
  if (verifiedTestNumbers.includes(medRegNumber)) {
    status = 'verified';
  } else if (validFormat) {
    status = 'pending';
  } else {
    status = 'rejected';
  }
  
  // Store in Firebase with appropriate status
  const volunteerRef = firebaseAdmin.database().ref('volunteers').push();
  
  volunteerRef.set({
    name: req.body.name,
    medicalRegistrationNumber: medRegNumber,
    contact: req.body.contact,
    location: req.body.location,
    acceptPhone: req.body.acceptPhone === 'true',
    medicalIdPath: req.file ? req.file.path : null,
    status: status,
    verificationTimestamp: status === 'verified' ? Date.now() : null,
    createdAt: Date.now()
  });
  
  // Return appropriate response based on status
  if (status === 'rejected') {
    return res.status(400).json({ 
      error: 'Invalid medical registration number format' 
    });
  }
  
  res.status(201).json({ 
    message: status === 'verified' 
      ? 'Volunteer verified successfully!' 
      : 'Registration submitted and pending verification.',
    status: status
  });
});

const createDonationHandler = (refPath) => (req, res) => {
  const db = firebaseAdmin.database();
  const ref = db.ref(refPath);
  const donationData = { ...req.body, status: req.body.status || 'pending', createdAt: Date.now() };

  ref
    .push(donationData)
    .then(() => res.status(201).json({ message: 'Donation submitted successfully.' }))
    .catch((error) => {
      console.error(`Error submitting donation to ${refPath}:`, error);
      res.status(500).json({ error: 'Failed to submit donation.' });
    });
};

app.post('/submit-medicine', createDonationHandler('medicineDonations'));
app.post('/submit-blood', createDonationHandler('bloodDonations'));
app.post('/submit-equipment', createDonationHandler('equipmentDonations'));

// Cron Job to Remove Outdated Donations
const removeOutdatedDonations = async () => {
  try {
    const db = firebaseAdmin.database();
    const donationTypes = ['medicineDonations', 'equipmentDonations', 'bloodDonations'];
    const cutoffTime = Date.now() -  30 * 1000; // 2 minutes ago

    for (const type of donationTypes) {
      const snapshot = await db.ref(type).once('value');
      const donations = snapshot.val();

      if (donations) {
        for (const [id, donation] of Object.entries(donations)) {
          const donationTime = donation.donationTime || 0;
          const createdAt = donation.createdAt || 0;
          if (donation.status === 'pending' && createdAt < cutoffTime) {
            await db.ref(`${type}/${id}`).remove();
            console.log(`Removed outdated donation: ${id} from ${type}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error removing outdated donations:', error);
  }
};

// Run cleanup job every minute (for testing)
cron.schedule('* * * * *', () => {
  console.log('Running cleanup job...');
  removeOutdatedDonations();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


