import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BfrBody.css';
import { database } from '../firebase/firebase';

const AftrBody = () => {
  // Add state for emergency status
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);

  // Check emergency status on component mount
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
    
    // Set up real-time listener for emergency status updates
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
    
    // Clean up the listener when component unmounts
    return () => {
      disasterRef.off();
    };
  }, []);

  return (
    <div>
      
      
      <section className="header">
        <div className="text-box">
            <h2 style={{ fontSize: '50px', marginLeft: '190px' }}>Building Bridges to Health</h2>
            <p style={{ fontSize: '30px', marginLeft: '150px' }}>Donate for a Brighter Future</p>
        </div>
      </section>
    </div>
  );
};

export default AftrBody;