import React from 'react';
import { Link } from 'react-router-dom'; 
import './BfrNavbar.css'; 
import { auth } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';

function AftrNavbar() {
    const { isAdmin } = useAuth();
    
    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    
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
                        <li><Link to="/aftrbody">Home</Link></li>
                        <li><Link to="/Donate">Donate</Link></li>
                        <li><Link to="/Donations">Donations</Link></li>
                        <li><Link to="/Emergency">Emergency</Link></li>
                        <li><Link to="/CommunityPage">Community</Link></li>
                        <li><Link to="/Articlespage">Articles</Link></li>
                        <li><Link to="/Profile">Profile</Link></li>
                        
                        {/* Only show Admin link if user is an admin */}
                        {isAdmin && (
                            <li><Link to="/Admin">Admin Dashboard</Link></li>
                        )}
                        
                        <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
                    </ul>
                </div>
                <i className="fa fa-bars" onClick={showMenu}></i>
            </nav>
        </div>
    );
}

export default AftrNavbar;