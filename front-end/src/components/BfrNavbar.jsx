import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import './BfrNavbar.css'; 
import { database } from '../firebase/firebase';

function BfrNavbar() {
    const [emergencyActive, setEmergencyActive] = useState(false);
    
    useEffect(() => {
        const checkEmergencyStatus = async () => {
            try {
                const disasterRef = database.ref('disasterMode');
                const snapshot = await disasterRef.once('value');
                const data = snapshot.val();
                
                setEmergencyActive(data && data.active);
            } catch (error) {
                console.error("Error checking emergency status:", error);
            }
        };
        
        checkEmergencyStatus();
        
        // Set up real-time listener for emergency status
        const disasterRef = database.ref('disasterMode');
        disasterRef.on('value', (snapshot) => {
            const data = snapshot.val();
            setEmergencyActive(data && data.active);
        });
        
        return () => {
            // Clean up listener
            disasterRef.off();
        };
    }, []);

    const showMenu = () => {
        document.getElementById("navLinks").style.right = "0";
    }

    const hideMenu = () => {
        document.getElementById("navLinks").style.right = "-200px";
    }

    return (
        <div>
            <nav style={{ paddingTop: '30px' }}>
                <img style={{ width: '150px', marginLeft: '85px' }} src="../imgs/logo.png" alt="Logo" />
                <a href="before.html"></a>
                <div className="nav-links" id="navLinks">
                    <i className="fa fa-times" onClick={hideMenu}></i>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        {emergencyActive && (
                            <li>
                                <Link to="/emergency" className="emergency-nav-link">
                                    ⚠️ Disaster Relief
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
                <i className="fa fa-bars" onClick={showMenu}></i>
            </nav>
        </div>
    );
}

export default BfrNavbar;