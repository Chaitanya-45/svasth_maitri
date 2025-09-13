import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

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

// Navigation wrapper based on auth status
const Navigation = () => {
  const { currentUser } = useAuth();
  return currentUser ? <AftrNavbar /> : <BfrNavbar />;
};

function AppContent() {
  return (
    <div>
      <Navigation />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<BfrBody />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Login" element={<Login />} />
        
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
        <Route path="/Emergency" element={
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