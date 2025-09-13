import React, { useState, useEffect } from 'react';
import { database } from '../firebase/firebase';
import { Card, CardContent, Typography, TextField, Button, Box, List, ListItem } from '@mui/material';

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
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Admin User Management
          </Typography>
          
          <form onSubmit={addAdmin}>
            <TextField
              label="Admin Email"
              type="email"
              fullWidth
              margin="normal"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            
            <TextField
              label="Admin Name"
              fullWidth
              margin="normal"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
            
            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Add Admin
            </Button>
          </form>
          
          {message && (
            <Typography 
              color={message.includes('success') ? 'success.main' : 'error'}
              sx={{ mt: 2 }}
            >
              {message}
            </Typography>
          )}
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Current Admins
          </Typography>
          
          {admins.length === 0 ? (
            <Typography>No admins found</Typography>
          ) : (
            <List>
              {admins.map((admin) => (
                <ListItem 
                  key={admin.id}
                  secondaryAction={
                    <Button 
                      color="error" 
                      onClick={() => removeAdmin(admin.id)}
                      size="small"
                    >
                      Remove
                    </Button>
                  }
                  divider
                >
                  <Box>
                    <Typography variant="body1">{admin.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {admin.email}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminSetup;