import { auth, database } from '../firebase/firebase';
import { calculateCarbonReduction } from './carbonFootprint';

/**
 * Updates a user's donation points and carbon footprint in Firebase
 * @param {string} donationType - Type of donation (medicine, equipment, blood)
 * @param {string} userEmail - Email of the user making the donation
 * @param {number} quantity - Quantity of items donated
 * @returns {Promise<boolean>} - Success status of the update
 */
export const updateDonationPoints = async (donationType, userEmail, quantity = 1) => {
  try {
    // First, find the user by email
    const currentUser = auth.currentUser;
    
    // Calculate carbon footprint reduction
    const carbonData = calculateCarbonReduction(donationType, quantity);
    
    // If the user is logged in and the email matches
    if (currentUser && currentUser.email === userEmail) {
      // Use the current user's ID
      return await updatePointsById(currentUser.uid, donationType, carbonData);
    } else {
      // Find user by email
      const usersRef = database.ref('users');
      const snapshot = await usersRef.orderByChild('email').equalTo(userEmail).once('value');
      
      if (snapshot.exists()) {
        // Get the first matching user
        const userEntries = Object.entries(snapshot.val());
        if (userEntries.length > 0) {
          const [userId] = userEntries[0];
          return await updatePointsById(userId, donationType, carbonData);
        }
      }
      
      console.log(`No user found with email: ${userEmail}`);
      return false;
    }
  } catch (error) {
    console.error('Error updating donation points:', error);
    return false;
  }
};

/**
 * Updates points and carbon footprint for a user by their ID
 * @param {string} userId - Firebase user ID
 * @param {string} donationType - Type of donation
 * @param {Object} carbonData - Carbon footprint reduction data
 * @returns {Promise<boolean>} - Success status
 */
const updatePointsById = async (userId, donationType, carbonData) => {
  try {
    const userRef = database.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      
      // Calculate points based on donation type
      let pointsToAdd = 0;
      switch (donationType) {
        case 'medicine':
          pointsToAdd = 10;
          break;
        case 'equipment':
          pointsToAdd = 15;
          break;
        case 'blood':
          pointsToAdd = 20;
          break;
        default:
          pointsToAdd = 5;
      }
      
      // Update user's points and total donations
      const currentPoints = userData.points || 0;
      const totalDonations = userData.totalDonations || 0;
      const totalCarbonReduction = (userData.carbonFootprint || 0) + carbonData.totalReduction;
      
      // Track donation type counts
      const donationTypeField = `${donationType}Donations`;
      const typeDonations = userData[donationTypeField] || 0;
      
      // Update all user data
      const updates = {
        points: currentPoints + pointsToAdd,
        totalDonations: totalDonations + 1,
        carbonFootprint: totalCarbonReduction,
        [donationTypeField]: typeDonations + 1
      };
      
      // Store the donation in history if it doesn't exist
      if (!userData.donationHistory) {
        updates.donationHistory = [];
      }
      
      await userRef.update(updates);
      
      console.log(`Added ${pointsToAdd} points to user ${userId}`);
      console.log(`Added ${carbonData.totalReduction} kg CO2e to user carbon savings`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating points by ID:', error);
    return false;
  }
};