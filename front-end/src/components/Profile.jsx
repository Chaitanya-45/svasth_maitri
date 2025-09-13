import React, { useEffect, useState } from 'react';

import { 
  Typography, 
  Paper, 
  Avatar, 
  Box, 
  Divider, 
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Button,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Person, 
  Email, 
  Phone, 
  CalendarToday, 
  EmojiEvents, 
  VolunteerActivism, 
  LocalHospital, 
  Favorite, 
  Inventory,
  Share,
  Instagram,
  Facebook,
  Twitter,
  WhatsApp,
  BarChart as BarChartIcon,
  ParkOutlined,
  NatureOutlined,
  LightbulbOutlined,
  DirectionsCarOutlined
} from '@mui/icons-material';
import { auth, database } from '../firebase/firebase';
// Note: You'll need to run npm install recharts
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from 'recharts';

// Helper function to format carbon footprint values
const formatCarbon = (value) => {
  return `${value.toFixed(1)} kg CO₂e`;
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = database.ref(`users/${user.uid}`);
          const snapshot = await userRef.once('value');
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            setError('User data not found.');
          }
        } catch (error) {
          setError(error.message);
        }
      } else {
        setError('User not authenticated.');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Function to get initials from username
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  // Function to get a random pastel color based on username
  const getAvatarColor = (username) => {
    if (!username) return "#3498db";
    const colors = [
      "#3498db", "#2ecc71", "#9b59b6", "#e74c3c", 
      "#f39c12", "#1abc9c", "#34495e", "#d35400"
    ];
    const index = username.length % colors.length;
    return colors[index];
  };

  // Function to determine user level based on points
  const getUserLevel = (points) => {
    if (!points) return { level: "Newcomer", nextLevel: 50, progress: 0 };
    
    if (points < 50) return { level: "Newcomer", nextLevel: 50, progress: (points / 50) * 100 };
    if (points < 150) return { level: "Helper", nextLevel: 150, progress: ((points - 50) / 100) * 100 };
    if (points < 300) return { level: "Supporter", nextLevel: 300, progress: ((points - 150) / 150) * 100 };
    if (points < 500) return { level: "Champion", nextLevel: 500, progress: ((points - 300) / 200) * 100 };
    return { level: "Lifesaver", nextLevel: null, progress: 100 };
  };

  // Function to handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to toggle share options
  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Function to share profile
  const shareProfile = (platform) => {
    const message = `Check out my healthcare contributions! I'm a ${userData?.points ? getUserLevel(userData.points).level : 'Newcomer'} with ${userData?.points || 0} points on MedDonate. I've saved ${formatCarbon(userData?.carbonFootprint || 0)} of carbon emissions!`;
    const url = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(message)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`);
        break;
      case 'instagram':
        // Instagram doesn't have a direct share link, this is just a placeholder
        alert('To share on Instagram, take a screenshot and upload it to your story or feed.');
        break;
      default:
        navigator.clipboard.writeText(message + ' ' + url);
        alert('Profile link copied to clipboard!');
    }
    setShowShareOptions(false);
  };

  // Achievement badges data
  const getAchievements = (userData) => {
    const points = userData?.points || 0;
    const totalDonations = userData?.totalDonations || 0;
    const carbonFootprint = userData?.carbonFootprint || 0;

    return [
      {
        id: 'first-donation',
        title: 'First Step',
        description: 'Made your first donation',
        icon: <VolunteerActivism fontSize="small" />,
        unlocked: totalDonations > 0
      },
      {
        id: 'medicine-5',
        title: 'Medicine Provider',
        description: 'Donated medicines 5+ times',
        icon: <LocalHospital fontSize="small" />,
        unlocked: (userData?.medicineDonations || 0) >= 5
      },
      {
        id: 'blood-3',
        title: 'Lifesaver',
        description: 'Donated blood 3+ times',
        icon: <Favorite fontSize="small" />,
        unlocked: (userData?.bloodDonations || 0) >= 3
      },
      {
        id: 'equipment-3',
        title: 'Equipment Supplier',
        description: 'Donated equipment 3+ times',
        icon: <Inventory fontSize="small" />,
        unlocked: (userData?.equipmentDonations || 0) >= 3
      },
      {
        id: 'points-100',
        title: 'Century Milestone',
        description: 'Earned 100+ points',
        icon: <EmojiEvents fontSize="small" />,
        unlocked: points >= 100
      },
      {
        id: 'helper-level',
        title: 'Dedicated Helper',
        description: 'Reached Helper level',
        icon: <EmojiEvents fontSize="small" />,
        unlocked: points >= 50
      },
      {
        id: 'supporter-level',
        title: 'Community Supporter',
        description: 'Reached Supporter level',
        icon: <EmojiEvents fontSize="small" />,
        unlocked: points >= 150
      },
      {
        id: 'champion-level',
        title: 'Healthcare Champion',
        description: 'Reached Champion level',
        icon: <EmojiEvents fontSize="small" />,
        unlocked: points >= 300
      },
      {
        id: 'carbon-10',
        title: 'Climate Hero',
        description: 'Reduced carbon emissions by 10+ kg',
        icon: <ParkOutlined fontSize="small" />,
        unlocked: carbonFootprint >= 10
      },
      {
        id: 'carbon-50',
        title: 'Earth Guardian',
        description: 'Reduced carbon emissions by 50+ kg',
        icon: <NatureOutlined fontSize="small" />,
        unlocked: carbonFootprint >= 50
      }
    ];
  };

  // Sample donation history data
  // In a real app, this would come from the database
  const getDonationHistory = () => {
    return [
      { id: 1, type: 'medicine', name: 'Paracetamol', date: '2023-10-15', points: 10, carbon: 2.3 },
      { id: 2, type: 'blood', name: 'Type O+', date: '2023-09-28', points: 20, carbon: 4.5 },
      { id: 3, type: 'equipment', name: 'Blood Pressure Monitor', date: '2023-08-05', points: 15, carbon: 8.7 },
      { id: 4, type: 'medicine', name: 'Antibiotics', date: '2023-07-22', points: 10, carbon: 2.3 },
      { id: 5, type: 'blood', name: 'Type O+', date: '2023-06-10', points: 20, carbon: 4.5 }
    ];
  };

  // Sample donation statistics for charts
  const getDonationStats = () => {
    // For pie chart
    const typeData = [
      { name: 'Medicine', value: userData?.medicineDonations || 2 },
      { name: 'Equipment', value: userData?.equipmentDonations || 1 },
      { name: 'Blood', value: userData?.bloodDonations || 2 }
    ];

    // For bar chart - points earned per month
    const monthlyPoints = [
      { name: 'Jun', points: 20 },
      { name: 'Jul', points: 10 },
      { name: 'Aug', points: 15 },
      { name: 'Sep', points: 20 },
      { name: 'Oct', points: 10 }
    ];

    // For carbon footprint data
    const carbonData = [
      { name: 'Medicine', reduction: (userData?.medicineDonations || 2) * 2.3 },
      { name: 'Equipment', reduction: (userData?.equipmentDonations || 1) * 8.7 },
      { name: 'Blood', reduction: (userData?.bloodDonations || 2) * 4.5 }
    ];

    return { typeData, monthlyPoints, carbonData };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      );
    }

    if (!userData) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No profile data available.</Typography>
        </Box>
      );
    }

    const joinDate = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown';
    const points = userData.points || 0;
    const { level, nextLevel, progress } = getUserLevel(points);
    const achievements = getAchievements(userData);
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const donationHistory = getDonationHistory();
    const { typeData, monthlyPoints, carbonData } = getDonationStats();
    const carbonFootprint = userData.carbonFootprint || 22.3; // Default value for demo

    return (
      <>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'center', md: 'flex-start' },
          mb: 4,
          gap: { xs: 3, md: 4 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            position: 'relative'
          }}>
            <Avatar 
              sx={{ 
                width: 150, 
                height: 150, 
                bgcolor: getAvatarColor(userData.username),
                fontSize: '3rem',
                fontWeight: 'bold',
                mb: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '4px solid white'
              }}
            >
              {getInitials(userData.username)}
            </Avatar>
            
            <Typography variant="h4" fontWeight="bold">
              {userData.username}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Member since {joinDate}
            </Typography>
            
            <Tooltip title="Share your profile">
              <IconButton 
                onClick={toggleShareOptions}
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  right: -20,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Share />
              </IconButton>
            </Tooltip>
            
            {showShareOptions && (
              <Box sx={{ 
                position: 'absolute',
                top: 50,
                right: -20,
                backgroundColor: 'white',
                borderRadius: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                p: 1,
                zIndex: 10
              }}>
                <IconButton color="primary" onClick={() => shareProfile('facebook')}>
                  <Facebook />
                </IconButton>
                <IconButton color="info" onClick={() => shareProfile('twitter')}>
                  <Twitter />
                </IconButton>
                <IconButton color="success" onClick={() => shareProfile('whatsapp')}>
                  <WhatsApp />
                </IconButton>
                <IconButton color="error" onClick={() => shareProfile('instagram')}>
                  <Instagram />
                </IconButton>
              </Box>
            )}
            
            {/* Points Badge */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1,
              bgcolor: '#f0f7ff',
              borderRadius: '50px',
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(49,130,206,0.15)'
            }}>
              <EmojiEvents sx={{ color: '#3182ce', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                {points} Points
              </Typography>
            </Box>
            
            {/* Carbon Footprint Badge */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 2,
              bgcolor: '#f0f9ee',
              borderRadius: '50px',
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(72,187,120,0.15)'
            }}>
              <ParkOutlined sx={{ color: '#48bb78', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {formatCarbon(carbonFootprint)} Saved
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            flex: 1,
            width: { xs: '100%', md: 'auto' }
          }}>
            {/* Donation Level Card */}
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ 
                bgcolor: '#3182ce', 
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
                <VolunteerActivism />
                <Typography variant="h6" fontWeight="bold">
                  Donation Level: {level}
                </Typography>
              </Box>
              <CardContent>
                {nextLevel ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress to next level
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {points}/{nextLevel} Points
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#3182ce'
                        }
                      }}
                    />
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Next milestone:</strong> {nextLevel - points} more points to reach {level === "Newcomer" ? "Helper" : level === "Helper" ? "Supporter" : level === "Supporter" ? "Champion" : "Lifesaver"} level
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Make more donations to earn points and reach higher levels!
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', my: 1 }}>
                    Congratulations! You've reached the highest donation level.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* Latest Achievements */}
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Latest Achievements
                  </Typography>
                  <Chip 
                    label={`${unlockedAchievements.length}/${achievements.length}`} 
                    color="primary" 
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {unlockedAchievements.slice(0, 4).map(achievement => (
                    <Tooltip title={achievement.description} key={achievement.id}>
                      <Chip
                        icon={achievement.icon}
                        label={achievement.title}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.8rem' }}
                      />
                    </Tooltip>
                  ))}
                  
                  {unlockedAchievements.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Make donations to unlock achievements!
                    </Typography>
                  )}
                  
                  {unlockedAchievements.length > 4 && (
                    <Tooltip title="View all achievements">
                      <Chip
                        label={`+${unlockedAchievements.length - 4} more`}
                        variant="outlined"
                        color="default"
                        size="small"
                        onClick={() => setTabValue(2)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ 
              mb: 2, 
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab icon={<Person />} iconPosition="start" label="Profile" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Donation Activity" />
            <Tab icon={<EmojiEvents />} iconPosition="start" label="Achievements" />
            <Tab icon={<ParkOutlined />} iconPosition="start" label="Environmental Impact" />
          </Tabs>
          
          {/* Profile Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                      Personal Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                      <Person color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Full Name</Typography>
                        <Typography variant="body1">{userData.username}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Email Address</Typography>
                        <Typography variant="body1">{userData.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body1">{userData.phoneNumber || 'Not provided'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                      Account Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                      <CalendarToday color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Join Date</Typography>
                        <Typography variant="body1">{joinDate}</Typography>
                      </Box>
                    </Box>
                    
                    {userData.role && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Role</Typography>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {userData.role}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEvents color="primary" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Donations</Typography>
                        <Typography variant="body1">
                          {userData.totalDonations || 0} donations made
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ParkOutlined color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Carbon Footprint Reduced</Typography>
                        <Typography variant="body1">
                          {formatCarbon(carbonFootprint)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Environmental Impact Summary Card */}
              <Grid item xs={12}>
                <Card elevation={2} sx={{ borderRadius: 3, mt: 3, bgcolor: '#f4fbf3' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                      <ParkOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Your Environmental Impact
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        Through your donations, you've reduced carbon emissions by <strong>{formatCarbon(carbonFootprint)}</strong>!
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          This is equivalent to:
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              bgcolor: 'white',
                              p: 2,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              <DirectionsCarOutlined color="primary" sx={{ fontSize: '2.5rem', mb: 1 }} />
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {Math.round(carbonFootprint * 2.5)} miles
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                of car travel avoided
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              bgcolor: 'white',
                              p: 2,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              <NatureOutlined color="success" sx={{ fontSize: '2.5rem', mb: 1 }} />
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                {Math.round(carbonFootprint / 21)} trees
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                worth of annual CO₂ absorption
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              bgcolor: 'white',
                              p: 2,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                              <LightbulbOutlined color="warning" sx={{ fontSize: '2.5rem', mb: 1 }} />
                              <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {Math.round(carbonFootprint * 33)} hours
                              </Typography>
                              <Typography variant="body2" color="text.secondary" align="center">
                                of LED bulb usage
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Donation Activity Tab */}
          {tabValue === 1 && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        Donation by Type
                      </Typography>
                      <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={typeData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {typeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        Points Earned by Month
                      </Typography>
                      <Box sx={{ height: 250, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyPoints}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="points" fill="#3182ce" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Donation History
                  </Typography>
                  
                  {donationHistory.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {donationHistory.map((donation) => (
                        <Box 
                          key={donation.id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            p: 2,
                            borderBottom: '1px solid #edf2f7',
                            '&:last-child': { borderBottom: 'none' }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {donation.type === 'medicine' && <LocalHospital color="primary" sx={{ mr: 2 }} />}
                            {donation.type === 'blood' && <Favorite color="error" sx={{ mr: 2 }} />}
                            {donation.type === 'equipment' && <Inventory color="success" sx={{ mr: 2 }} />}
                            
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {donation.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(donation.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Carbon footprint reduced">
                              <Chip 
                                icon={<ParkOutlined fontSize="small" />}
                                label={`${donation.carbon} kg CO₂e`} 
                                color="success" 
                                size="small" 
                                variant="outlined" 
                              />
                            </Tooltip>
                            <Chip 
                              label={`+${donation.points} points`} 
                              color="primary" 
                              size="small" 
                              variant="outlined" 
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No donation history available.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Achievements Tab */}
          {tabValue === 2 && (
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Your Achievements
                  </Typography>
                  <Chip 
                    label={`${unlockedAchievements.length}/${achievements.length} Unlocked`} 
                    color="primary" 
                    size="small"
                  />
                </Box>
                
                <Grid container spacing={2}>
                  {achievements.map((achievement) => (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                      <Card 
                        elevation={achievement.unlocked ? 1 : 0}
                        sx={{ 
                          p: 2, 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          opacity: achievement.unlocked ? 1 : 0.6,
                          bgcolor: achievement.unlocked ? 'white' : '#f5f5f5',
                          border: 1,
                          borderColor: achievement.unlocked ? 'primary.light' : 'grey.300',
                          borderRadius: 2
                        }}
                      >
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            color: achievement.unlocked ? 'primary.main' : 'grey.500'
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 1.5,
                              bgcolor: achievement.unlocked ? 'primary.light' : 'grey.200',
                              color: achievement.unlocked ? 'white' : 'grey.500'
                            }}
                          >
                            {achievement.icon}
                          </Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {achievement.title}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {achievement.description}
                        </Typography>
                        
                        <Box sx={{ 
                          mt: 'auto', 
                          display: 'flex',
                          justifyContent: 'flex-end'
                        }}>
                          <Chip 
                            label={achievement.unlocked ? "Unlocked" : "Locked"} 
                            size="small"
                            color={achievement.unlocked ? "success" : "default"}
                            variant={achievement.unlocked ? "filled" : "outlined"}
                          />
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
          
          {/* Environmental Impact Tab */}
          {tabValue === 3 && (
            <>
              <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                    Carbon Footprint Reduction
                  </Typography>
                  <Box sx={{ height: 250, width: '100%', mb: 3 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={carbonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip 
                          formatter={(value) => [`${value.toFixed(2)} kg CO₂e`, 'Carbon Reduction']} 
                        />
                        <Bar dataKey="reduction" fill="#4caf50" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    Your donations have saved a total of <strong>{formatCarbon(carbonFootprint)}</strong> of carbon emissions!
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Every donation helps reduce waste from medical products and contributes to a more sustainable healthcare system.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card elevation={2} sx={{ borderRadius: 3, mt: 3, bgcolor: '#f4fbf3' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                    Environmental Facts
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      Did you know?
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Medical waste impact
                            </Typography>
                            <Typography variant="body2">
                              Healthcare accounts for 4.4% of global net emissions, equivalent to the annual output of 514 coal-fired power plants.
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Medicine disposal
                            </Typography>
                            <Typography variant="body2">
                              Improper disposal of medications contributes to water pollution. Donating unused medicine reduces pharmaceutical waste.
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Card sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Equipment reuse
                            </Typography>
                            <Typography variant="body2">
                              Medical equipment reuse can reduce manufacturing emissions by up to 45% compared to producing new equipment.
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 3,
          background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)'
        }}
      >
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default Profile;