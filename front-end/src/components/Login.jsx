import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, TextField, Button, Typography, Box } from '@mui/material';
import { auth, googleProvider, checkIsAdmin } from '../firebase/firebase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  
  const { currentUser, isAdmin } = useAuth();

  // If already logged in, redirect to appropriate page
  useEffect(() => {
    if (currentUser) {
      setRedirectPath(isAdmin ? '/Admin' : '/aftrbody');
    }
  }, [currentUser, isAdmin]);

  const handleLoginClick = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      await auth.signInWithEmailAndPassword(email, password);
      // Redirection will happen automatically via useEffect
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await auth.signInWithPopup(googleProvider);
      // Redirection will happen automatically via useEffect
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
    }
  };

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Grid item xs={12} sm={8} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom>
              Login
            </Typography>
            <TextField
              id="email"
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            <Box mt={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                  },
                }}
                fullWidth
                onClick={handleLoginClick}
              >
                Login
              </Button>
            </Box>
            <Box mt={2}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#4285F4',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#357AE8',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '0',
                }}
                fullWidth
                onClick={handleGoogleLogin}
                startIcon={
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google logo"
                    style={{
                      height: '35px',
                      width: '35px',
                      marginRight: '8px',
                    }}
                  />
                }
              >
                Sign in with Google
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;