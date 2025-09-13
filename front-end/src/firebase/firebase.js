import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAUnIFb5kBNmneXIxfGsy4eSpOSJwSzlW0",
    authDomain: "svasthmaitri.firebaseapp.com",
    databaseURL: "https://svasthmaitri-default-rtdb.firebaseio.com",
    projectId: "svasthmaitri",
    storageBucket: "svasthmaitri.appspot.com",
    messagingSenderId: "740156489180",
    appId: "1:740156489180:web:90584ca68310c539b2e319"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();
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

export { auth, database, googleProvider };
