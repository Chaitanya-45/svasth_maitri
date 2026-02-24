import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AftrNavbar.css';
import { auth, database } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';

function AftrNavbar() {
    const { isAdmin } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [emergencyActive, setEmergencyActive] = useState(false);
    
    // Check emergency status
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
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    // Handle outside click to close the menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            const navMenu = document.querySelector('.navbar-nav');
            const hamburger = document.querySelector('.navbar-menu-toggle');
            
            if (menuOpen && navMenu && hamburger && 
                !navMenu.contains(event.target) && 
                !hamburger.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Check if a link is active
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/aftrbody">
                        <img src="../imgs/logo.png" alt="MedDonate Logo" />
                    </Link>
                </div>
                
                <div className={`navbar-menu-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                
                <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-header">
                        <span>Menu</span>
                        <button className="close-menu-btn" onClick={closeMenu}>✕</button>
                    </div>
                    
                    <ul className="navbar-links">
                        <li><Link className={isActive('/aftrbody')} to="/aftrbody" onClick={closeMenu}>Home</Link></li>
                        <li><Link className={isActive('/Donate')} to="/Donate" onClick={closeMenu}>Donate</Link></li>
                        <li><Link className={isActive('/Donations')} to="/Donations" onClick={closeMenu}>Donations</Link></li>
                        <li><Link className={isActive('/Emergency')} to="/volunteer-emergency" onClick={closeMenu}>Emergency</Link></li>
                        <li><Link className={isActive('/CommunityPage')} to="/CommunityPage" onClick={closeMenu}>Community</Link></li>
                        <li><Link className={isActive('/Articlespage')} to="/Articlespage" onClick={closeMenu}>Articles</Link></li>
                        
                        {emergencyActive && (
                            <li>
                                <Link to="/emergency" className="emergency-nav-link" onClick={closeMenu}>
                                    ⚠️ Disaster Relief
                                </Link>
                            </li>
                        )}
                        
                        <li className="dropdown">
                            <Link className={isActive('/Profile')} to="/Profile" onClick={closeMenu}>
                                <div className="user-avatar">
                                    <i className="fa fa-user"></i>
                                </div>
                                <span>Profile</span>
                            </Link>
                            <ul className="dropdown-menu">
                                {isAdmin && (
                                    <>
                                        <Link to="/Admin" onClick={closeMenu}>Admin Dashboard</Link>
                                        <Link to="/admin-setup" onClick={closeMenu}>Admin Setup</Link>
                                    </>
                                )}
                                <Link to="/" onClick={() => {closeMenu(); handleLogout();}}>Logout</Link>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default AftrNavbar;