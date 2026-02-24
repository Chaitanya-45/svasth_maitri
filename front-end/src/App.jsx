import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { database } from './firebase/firebase';

import BfrNavbar from "./components/BfrNavbar";
import BfrBody from "./components/BfrBody";
import Footer from "./components/Footer";
import Signup from "./components/Signup";
import Login from "./components/Login";
import AftrBody from "./components/AftrBody";
import AftrNavbar from "./components/AftrNavbar";
import Profile from "./components/Profile";
import MedForm from "./components/MedForm";
import MedEquipment from "./components/MedEquipment";
import Donations from "./components/Donations";
import Articlespage from "./components/Articlespage";
import Translate from "./components/Translate";
import Donate from "./components/Donate";
import CommunityPage from "./components/CommunityPage";
import ImpMedicineDon from "./components/ImpMedicineDon";
import Questionnaire from "./components/Questionnaire";
import Volform from "./components/Volform";
import Emergency from "./components/Emergency";
import Chatbot from "./components/Chatbot";
import Admin from "./components/Admin";
import AdminSetup from "./components/AdminSetup";
import EmergencyHome from './components/EmergencyHome';
import EmergencyDonate from './components/EmergencyDonate';
import EmergencyRequest from './components/EmergencyRequest';

// Emergency Banner Component
const EmergencyBanner = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  useEffect(() => {
    const checkEmergencyStatus = async () => {
      try {
        const disasterRef = database.ref('disasterMode');
        const snapshot = await disasterRef.once('value');
        const data = snapshot.val();
        
        if (data && data.active) {
          setEmergencyActive(true);
          setEmergencyData(data);
        } else {
          setEmergencyActive(false);
          setEmergencyData(null);
        }
      } catch (error) {
        console.error("Error checking emergency status:", error);
      }
    };
    
    checkEmergencyStatus();
    
    // Set up listener for real-time updates
    const disasterRef = database.ref('disasterMode');
    disasterRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data && data.active) {
        setEmergencyActive(true);
        setEmergencyData(data);
      } else {
        setEmergencyActive(false);
        setEmergencyData(null);
      }
    });
    
    return () => {
      disasterRef.off(); // Clean up listener on unmount
    };
  }, []);

  if (!emergencyActive || !emergencyData) {
    return null;
  }

  return (
    <div className="emergency-alert">
      <div className="emergency-alert-content">
        <div className="emergency-alert-icon">⚠️</div>
        <div className="emergency-alert-text">
          <strong>EMERGENCY:</strong> {emergencyData.description}
        </div>
        <a href="/emergency" className="emergency-alert-button">
          Help Now
        </a>
      </div>
    </div>
  );
};

// Navigation wrapper based on auth status
const Navigation = () => {
  const { currentUser } = useAuth();
  return currentUser ? <AftrNavbar /> : <BfrNavbar />;
};

function AppContent() {
  return (
    <div>
      <EmergencyBanner />
      <Navigation />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<BfrBody />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        
        {/* Emergency routes - these are accessible to anyone during a disaster */}
        <Route path="/emergency" element={<EmergencyHome />} />
        <Route path="/emergency/donate" element={<EmergencyDonate />} />
        <Route path="/emergency/request" element={<EmergencyRequest />} />
        
        {/* Protected user routes */}
        <Route path="/aftrbody" element={
          <ProtectedRoute>
            <AftrBody />
          </ProtectedRoute>
        } />
        <Route path="/Profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/MedForm" element={
          <ProtectedRoute>
            <MedForm />
          </ProtectedRoute>
        } />
        <Route path="/MedEquipment" element={
          <ProtectedRoute>
            <MedEquipment />
          </ProtectedRoute>
        } />
        <Route path="/Donations" element={
          <ProtectedRoute>
            <Donations />
          </ProtectedRoute>
        } />
        <Route path="/Articlespage" element={
          <ProtectedRoute>
            <Articlespage />
          </ProtectedRoute>
        } />
        <Route path="/CommunityPage" element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        <Route path="/Questionnaire" element={
          <ProtectedRoute>
            <Questionnaire />
          </ProtectedRoute>
        } />
        <Route path="/Donate" element={
          <ProtectedRoute>
            <Donate />
          </ProtectedRoute>
        } />
        <Route path="/ImpMedicineDon" element={
          <ProtectedRoute>
            <ImpMedicineDon />
          </ProtectedRoute>
        } />
        <Route path="/Volform" element={
          <ProtectedRoute>
            <Volform />
          </ProtectedRoute>
        } />
        <Route path="/volunteer-emergency" element={
          <ProtectedRoute>
            <Emergency />
          </ProtectedRoute>
        } />
        <Route path="/Chatbot" element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        } />
        
        {/* Admin protected route */}
        <Route path="/Admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
        <Route path="/admin-setup" element={
          <AdminRoute>
            <AdminSetup />
          </AdminRoute>
        } />
      </Routes>
      <Translate />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;