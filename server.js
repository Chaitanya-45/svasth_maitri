const express = require('express');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const cron = require('node-cron');

const app = express();

const serviceAccount = require('./svasthmaitri-firebase-adminsdk.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://svasthmaitri-default-rtdb.firebaseio.com/',
});

app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/submit-volunteer', upload.single('medicalId'), async (req, res) => {
  const { name, medicalRegistrationNumber, contact, acceptPhone, location } = req.body;
  const medicalId = req.file;

  if (!medicalId) {
    return res.status(400).json({ error: 'Medical ID file is required.' });
  }

  try {
    const data = fs.readFileSync(medicalId.path);
    const result = await pdfParse(data);

    if (result.text.includes('mbbs')) {
      const db = firebaseAdmin.database();
      const volunteersRef = db.ref('volunteers');

      volunteersRef
        .push({
          name,
          medicalRegistrationNumber,
          contact,
          acceptPhone,
          location,
        })
        .then(() => {
          fs.unlinkSync(medicalId.path);
          res.status(201).json({ message: 'Volunteer submitted successfully.' });
        })
        .catch((error) => {
          console.error('Error submitting volunteer:', error);
          fs.unlinkSync(medicalId.path);
          res.status(500).json({ error: 'Failed to submit volunteer.' });
        });
    } else {
      fs.unlinkSync(medicalId.path);
      res
        .status(400)
        .json({ error: "Medical Registration Number isn't available in the Indian Medical Registry." });
    }
  } catch (error) {
    fs.unlinkSync(medicalId.path);
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Error processing document.' });
  }
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

async function isValidNpi(npiNumber) {
  const url = `https://npiregistry.cms.hhs.gov/api/?number=${npiNumber}&format=json`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      
      return data.results && data.results.length > 0;
    } else {
      console.log("Failed to fetch data. Status Code:", response.status);
      return false; 
    }
  } catch (error) {
    console.log("Error occurred:", error);
    return false; 
  }
}

const npiNumber = '1234567890'; 
isValidNpi(npiNumber)
  .then(isValid => {
    if (isValid) {
      console.log("The NPI number is valid.");
    } else {
      console.log("The NPI number is invalid.");
    }
  });


