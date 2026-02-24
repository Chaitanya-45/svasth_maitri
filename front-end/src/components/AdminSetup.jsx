import React, { useState, useEffect } from 'react';
import { database } from '../firebase/firebase';
import './AdminSetup.css';

function AdminSetup() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [message, setMessage] = useState('');
  const [admins, setAdmins] = useState([]);

  // Fetch current admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const snapshot = await database.ref('adminUsers').once('value');
        const adminData = snapshot.val();
        
        if (adminData) {
          const adminList = Object.entries(adminData).map(([id, data]) => ({
            id,
            email: data.email,
            name: data.name
          }));
          setAdmins(adminList);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        setMessage('Failed to fetch admin list');
      }
    };
    
    fetchAdmins();
  }, []);

  const addAdmin = async (e) => {
    e.preventDefault();
    
    if (!adminEmail || !adminName) {
      setMessage('Please provide both email and name');
      return;
    }
    
    try {
      const adminRef = database.ref('adminUsers');
      await adminRef.push({
        email: adminEmail.toLowerCase(),
        name: adminName
      });
      
      setMessage(`Admin ${adminEmail} added successfully!`);
      setAdminEmail('');
      setAdminName('');
      
      // Refresh admin list
      const snapshot = await database.ref('adminUsers').once('value');
      const adminData = snapshot.val();
      
      if (adminData) {
        const adminList = Object.entries(adminData).map(([id, data]) => ({
          id,
          email: data.email,
          name: data.name
        }));
        setAdmins(adminList);
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      setMessage('Failed to add admin');
    }
  };

  const removeAdmin = async (id) => {
    try {
      await database.ref(`adminUsers/${id}`).remove();
      setMessage('Admin removed successfully');
      
      // Update admin list
      setAdmins(admins.filter(admin => admin.id !== id));
    } catch (error) {
      console.error('Error removing admin:', error);
      setMessage('Failed to remove admin');
    }
  };

  return (
    <div className="admin-setup-container">
      <div className="navbar-spacer"></div>
      <div className="admin-setup-content">
        <h2>Admin User Management</h2>
        
        <div className="admin-form-card">
          <h3>Add New Admin</h3>
          <form onSubmit={addAdmin}>
            <div className="input-group">
              <label htmlFor="adminEmail">Admin Email</label>
              <input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="adminName">Admin Name</label>
              <input
                id="adminName"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter admin name"
                required
              />
            </div>
            
            <button type="submit" className="add-admin-btn">
              Add Admin
            </button>
          </form>
          
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
        
        <div className="admin-list-card">
          <h3>Current Admins</h3>
          
          {admins.length === 0 ? (
            <p className="no-admins">No admins found</p>
          ) : (
            <ul className="admin-list">
              {admins.map((admin) => (
                <li key={admin.id} className="admin-item">
                  <div className="admin-info">
                    <span className="admin-name">{admin.name}</span>
                    <span className="admin-email">{admin.email}</span>
                  </div>
                  <button 
                    className="remove-admin-btn"
                    onClick={() => removeAdmin(admin.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSetup;