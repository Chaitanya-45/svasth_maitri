import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase environment variables. Check front-end/.env');
}

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export const checkIsAdmin = async (email) => {
    if (!email) return false;
    
    try {
        const snapshot = await database.ref('adminUsers').orderByChild('email').equalTo(email.toLowerCase()).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

export const setupAdminUsers = async () => {
    try {
        const adminUsersRef = database.ref('adminUsers');
        
        // Add default admin users
        await adminUsersRef.push({
            email: 'admin@example.com',
            name: 'Admin User'
        });
        
        // Add your own email here
        await adminUsersRef.push({
            email: 'your-email@example.com',
            name: 'Your Name'
        });
        
        console.log('Admin users set up successfully');
        return true;
    } catch (error) {
        console.error('Error setting up admin users:', error);
        return false;
    }
};

window.setupAdminUsers = setupAdminUsers;

export { auth, database, storage, googleProvider };
