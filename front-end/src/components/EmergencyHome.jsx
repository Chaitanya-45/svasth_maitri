import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { database } from '../firebase/firebase';
import './disaster.css';

function EmergencyHome() {
  const navigate = useNavigate();
  const [disasterMode, setDisasterMode] = useState({
    active: false,
    location: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    donations: 0,
    requests: 0,
    matches: 0
  });
  
  useEffect(() => {
    const checkDisasterMode = async () => {
      try {
        setLoading(true);
        const disasterRef = database.ref('disasterMode');
        const snapshot = await disasterRef.once('value');
        const data = snapshot.val();
        
        if (data && data.active) {
          setDisasterMode(data);
          fetchEmergencyStats();
        } else {
          // Redirect if disaster mode is not active
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking disaster mode:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchEmergencyStats = async () => {
      try {
        // Get donations count
        const donationsRef = database.ref('emergencyDonations');
        const donationsSnapshot = await donationsRef.once('value');
        const donationsCount = donationsSnapshot.exists() ? Object.keys(donationsSnapshot.val()).length : 0;
        
        // Get requests count
        const requestsRef = database.ref('emergencyRequests');
        const requestsSnapshot = await requestsRef.once('value');
        const requestsCount = requestsSnapshot.exists() ? Object.keys(requestsSnapshot.val()).length : 0;
        
        // Get matches count
        const matchesRef = database.ref('emergencyMatches');
        const matchesSnapshot = await matchesRef.once('value');
        const matchesCount = matchesSnapshot.exists() ? Object.keys(matchesSnapshot.val() || {}).length : 0;
        
        setStats({
          donations: donationsCount,
          requests: requestsCount,
          matches: matchesCount
        });
      } catch (error) {
        console.error("Error fetching emergency stats:", error);
      }
    };
    
    checkDisasterMode();
  }, [navigate]);
  
  if (loading) {
    return <div className="loading-container">Loading emergency status...</div>;
  }
  
  return (
    <div className="emergency-home-container">
      <div className="emergency-hero">
        <div className="emergency-banner">
          <div className="emergency-icon">⚠️</div>
          <div className="emergency-details">
            <h1>Emergency Disaster Response</h1>
            <p>{disasterMode.description}</p>
            <p><strong>Location:</strong> {disasterMode.location}</p>
          </div>
        </div>
        
        <div className="emergency-actions">
          <Link to="/emergency/donate" className="emergency-button donate">
            I Want to Donate Supplies
          </Link>
          <Link to="/emergency/request" className="emergency-button request">
            I Need Emergency Supplies
          </Link>
        </div>
      </div>
      
      <div className="emergency-info-section">
        <h2>Current Status</h2>
        <div className="emergency-stats">
          <div className="stat-box">
            <div className="stat-number">{stats.donations}</div>
            <div className="stat-label">Donations</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.requests}</div>
            <div className="stat-label">Requests</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.matches}</div>
            <div className="stat-label">Matches Made</div>
          </div>
        </div>
      </div>
      
      <div className="emergency-info-cards">
        <div className="info-card">
          <h3>How to Donate</h3>
          <p>If you have essential supplies like food, water, medicine, or shelter items that could help those affected by this disaster, please donate them through our platform.</p>
          <ol>
            <li>Click "I Want to Donate Supplies" above</li>
            <li>Fill out the form with details about your donation</li>
            <li>Submit your donation information</li>
            <li>Wait for our team to match you with someone in need</li>
          </ol>
          <Link to="/emergency/donate" className="card-button">
            Donate Now
          </Link>
        </div>
        
        <div className="info-card">
          <h3>How to Request Help</h3>
          <p>If you or someone you know needs emergency supplies during this disaster, you can request them through our platform.</p>
          <ol>
            <li>Click "I Need Emergency Supplies" above</li>
            <li>Fill out the form with details about what you need</li>
            <li>Submit your request</li>
            <li>Our team will try to match you with available donations</li>
          </ol>
          <Link to="/emergency/request" className="card-button">
            Request Help
          </Link>
        </div>
        
        <div className="info-card process-card">
          <h3>How the Process Works</h3>
          <p>Our platform connects donors directly with those in need during emergencies:</p>
          <ol>
            <li><strong>Submit:</strong> Donors and requesters submit their information</li>
            <li><strong>Match:</strong> Our system identifies potential matches based on needs and offerings</li>
            <li><strong>Notify:</strong> Both parties are notified when a match is made</li>
            <li><strong>Connect:</strong> Donors and recipients coordinate directly for pickup/delivery</li>
          </ol>
          <div className="note-box">
            <p><strong>Note:</strong> Our platform facilitates connections between donors and recipients but does not handle the physical transportation of donations. Once matched, donors and recipients will need to arrange pickup/delivery directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyHome;