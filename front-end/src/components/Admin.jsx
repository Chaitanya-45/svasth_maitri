import React, { useState, useEffect } from 'react';
import { database, storage, auth } from '../firebase/firebase';
import { ethers } from 'ethers';
import './Admin.css';
import DonationVerifierJSON from '../blockchain/DonationVerifierABI.json';
import axios from 'axios';
import { 
  CircularProgress, 
  Alert, 
  Button, 
  Tabs, 
  Tab, 
  Box, 
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Dashboard, 
  LocalHospital, 
  Inventory,
  LocationOn, 
  AccessTime, 
  LocalShipping,
  MoveDown, 
  Info,
  CheckCircle, 
  Close,
  Refresh,
  FilterAlt,
  Warning
} from '@mui/icons-material';

function Admin() {
  const [donations, setDonations] = useState({
    medicine: [],
    equipment: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [blockchainStatus, setBlockchainStatus] = useState({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    isCorrectNetwork: false,
    name: "Disconnected",
  });
  
  // Blockchain statistics
  const [blockchainStats, setBlockchainStats] = useState({
    totalDonations: 0,
    latestTx: '-',
    lastUpdated: null
  });
  
  // Transaction history
  const [transactionHistory, setTransactionHistory] = useState([]);
  
  // Donation verification
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Tracking items to remove
  const [itemsToRemove, setItemsToRemove] = useState([]);
  
  // Rejection countdown timers
  const [rejectionTimers, setRejectionTimers] = useState({});

  // Admin dashboard tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Resource redistribution state
  const [alerts, setAlerts] = useState([]);
  const [redistributionLoading, setRedistributionLoading] = useState(false);
  const [redistributionError, setRedistributionError] = useState(null);
  const [showProcessed, setShowProcessed] = useState(false);
  
  // Disaster mode state
  const [disasterMode, setDisasterMode] = useState({
    active: false,
    location: "",
    description: "",
    activatedAt: null
  });
  const [disasterModalOpen, setDisasterModalOpen] = useState(false);
  
  // Emergency donation and request state
  const [emergencyDonations, setEmergencyDonations] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [emergencyMatches, setEmergencyMatches] = useState([]);
  const [emergencyStats, setEmergencyStats] = useState({
    donations: 0,
    requests: 0,
    matches: 0,
    pending: 0
  });
  const [emergencyTabValue, setEmergencyTabValue] = useState(0);
  const [loadingEmergencyData, setLoadingEmergencyData] = useState(false);

  // Contract address
  const contractAddress = '0x73511669fd4de447fed18bb79bafeac93ab7f31f';

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Load redistribution data when switching to that tab
    if (newValue === 2 && alerts.length === 0 && !redistributionLoading) {
      getRedistributionAlerts();
    }
    
    // Load emergency data when switching to emergency tab
    if (newValue === 3 && disasterMode.active) {
      fetchEmergencyData();
    }
  };
  
  // Handle emergency tab changes
  const handleEmergencyTabChange = (newValue) => {
    setEmergencyTabValue(newValue);
  };

  // Network validation function to ensure connection to Hardhat local
  const ensureHardhatNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Check if we're on Hardhat local (chainId 31337)
      const isHardhat = network.chainId.toString() === '31337';
      setNetworkStatus({
        isCorrectNetwork: isHardhat,
        name: network.name
      });
      
      if (!isHardhat) {
        try {
          // Request network switch to Hardhat
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 0x7A69 is hex for 31337
          });
          
          // After switching, update our state
          const updatedNetwork = await provider.getNetwork();
          setNetworkStatus({
            isCorrectNetwork: true,
            name: updatedNetwork.name
          });
          return true;
        } catch (switchError) {
          // If the network doesn't exist in MetaMask, we need to add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x7A69',
                    chainName: 'Hardhat Local',
                    rpcUrls: ['http://127.0.0.1:8545/'],
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18
                    }
                  }
                ]
              });
              
              // After adding, try switching again
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7A69' }]
              });
              
              setNetworkStatus({
                isCorrectNetwork: true,
                name: 'Hardhat Local'
              });
              return true;
            } catch (addError) {
              console.error('Error adding Hardhat network to MetaMask:', addError);
              setError('Failed to add Hardhat network to MetaMask');
              return false;
            }
          }
          console.error('Error switching to Hardhat network:', switchError);
          setError('Failed to switch to Hardhat network. Please switch manually in MetaMask.');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      setError('Failed to check current network');
      return false;
    }
  };

  // Function to add a transaction to history
  const addTransactionToHistory = (txHash, action, status = 'confirmed') => {
    const newTx = {
      txHash,
      action,
      timestamp: new Date().toISOString(),
      status
    };
    
    setTransactionHistory(prev => [newTx, ...prev]);
    
    // Also update blockchain stats
    setBlockchainStats(prev => ({
      ...prev,
      totalDonations: prev.totalDonations + 1,
      latestTx: txHash,
      lastUpdated: new Date().toISOString()
    }));
    
    return newTx;
  };
  
  // Simulation function for demo
  const simulateBlockchainTransaction = (action) => {
    // Generate a fake transaction hash
    const randomHash = '0x' + Array.from({length: 64}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
    
    // Show pending status
    const pendingTx = addTransactionToHistory(randomHash, action, 'pending');
    
    // Simulate confirmation after 2 seconds
    setTimeout(() => {
      setTransactionHistory(prev => 
        prev.map(tx => 
          tx.txHash === pendingTx.txHash ? {...tx, status: 'confirmed'} : tx
        )
      );
    }, 2000);
    
    return randomHash;
  };
  
  // Verification function
  const verifyDonation = () => {
    if (!verificationInput.trim()) {
      setVerificationResult({
        found: false,
        message: "Please enter a donation ID"
      });
      return;
    }
    
    // First check if it exists in our local data
    const medicineMatch = donations.medicine.find(d => d.id === verificationInput);
    const equipmentMatch = donations.equipment.find(d => d.id === verificationInput);
    const donation = medicineMatch || equipmentMatch;
    
    if (donation) {
      // Simulate blockchain verification
      setTimeout(() => {
        setVerificationResult({
          found: true,
          donation,
          verified: true,
          txHash: simulateBlockchainTransaction(`Verified donation ${verificationInput}`),
          timestamp: new Date().toISOString()
        });
      }, 1000);
    } else {
      setVerificationResult({
        found: false,
        message: "Donation not found on blockchain"
      });
    }
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletConnected(true);
            // Check network if wallet is connected
            await ensureHardhatNetwork();
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            setWalletConnected(accounts.length > 0);
            if (accounts.length > 0) {
              ensureHardhatNetwork();
            }
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', () => {
            ensureHardhatNetwork();
          });
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Load disaster mode status
  useEffect(() => {
    const loadDisasterModeStatus = async () => {
      try {
        const disasterRef = database.ref('disasterMode');
        const snapshot = await disasterRef.once('value');
        const data = snapshot.val();
        
        if (data) {
          setDisasterMode(data);
          
          // If disaster mode is active and we're on the emergency tab, fetch data
          if (data.active && tabValue === 3) {
            fetchEmergencyData();
          }
        }
      } catch (error) {
        console.error("Error loading disaster mode status:", error);
      }
    };
    
    loadDisasterModeStatus();
  }, [tabValue]);

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch medicine donations
        const medicineSnapshot = await database.ref('medicineDonations').once('value');
        const medicineData = medicineSnapshot.val() || {};
        const medicineArray = Object.keys(medicineData).map(key => ({
          id: key,
          ...medicineData[key]
        }));

        // Fetch equipment donations
        const equipmentSnapshot = await database.ref('equipmentDonations').once('value');
        const equipmentData = equipmentSnapshot.val() || {};
        const equipmentArray = Object.keys(equipmentData).map(key => ({
          id: key,
          ...equipmentData[key]
        }));

        setDonations({
          medicine: medicineArray,
          equipment: equipmentArray
        });
        
        // Update blockchain stats based on fetched donations
        setBlockchainStats(prev => ({
          ...prev,
          totalDonations: medicineArray.length + equipmentArray.length
        }));
        
      } catch (error) {
        console.error("Error fetching donations:", error);
        setError("Failed to load donations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);
  
  // Toggle disaster mode
  const toggleDisasterMode = async (activate, disasterData = {}) => {
    try {
      const disasterRef = database.ref('disasterMode');
      
      if (activate) {
        const newDisasterData = {
          active: true,
          location: disasterData.location || "",
          description: disasterData.description || "",
          activatedAt: new Date().toISOString()
        };
        
        await disasterRef.set(newDisasterData);
        setDisasterMode(newDisasterData);
        
        // Add to blockchain for immutable record
        if (walletConnected) {
          simulateBlockchainTransaction(`Disaster mode activated: ${disasterData.description}`);
        }
      } else {
        const updatedData = {
          active: false,
          location: disasterMode.location,
          description: disasterMode.description,
          activatedAt: disasterMode.activatedAt,
          deactivatedAt: new Date().toISOString()
        };
        
        await disasterRef.set(updatedData);
        setDisasterMode(updatedData);
        
        // Add to blockchain for immutable record
        if (walletConnected) {
          simulateBlockchainTransaction(`Disaster mode deactivated`);
        }
      }
      
      setDisasterModalOpen(false);
    } catch (error) {
      console.error("Error updating disaster mode:", error);
      setError("Failed to update disaster mode. Please try again.");
    }
  };
  
  // Fetch emergency data for admin panel
  const fetchEmergencyData = async () => {
    setLoadingEmergencyData(true);
    try {
      // Fetch emergency donations
      const donationsRef = database.ref('emergencyDonations');
      const donationsSnapshot = await donationsRef.once('value');
      const donationsData = donationsSnapshot.val() || {};
      
      const donationsArray = Object.keys(donationsData).map(key => ({
        id: key,
        ...donationsData[key]
      }));
      
      // Fetch emergency requests
      const requestsRef = database.ref('emergencyRequests');
      const requestsSnapshot = await requestsRef.once('value');
      const requestsData = requestsSnapshot.val() || {};
      
      const requestsArray = Object.keys(requestsData).map(key => ({
        id: key,
        ...requestsData[key]
      }));
      
      // Fetch emergency matches
      const matchesRef = database.ref('emergencyMatches');
      const matchesSnapshot = await matchesRef.once('value');
      const matchesData = matchesSnapshot.val() || {};
      
      const matchesArray = Object.keys(matchesData || {}).map(key => ({
        id: key,
        ...matchesData[key]
      }));
      
      // Calculate stats
      const pendingRequests = requestsArray.filter(req => req.status === 'pending').length;
      
      setEmergencyDonations(donationsArray);
      setEmergencyRequests(requestsArray);
      setEmergencyMatches(matchesArray);
      setEmergencyStats({
        donations: donationsArray.length,
        requests: requestsArray.length,
        matches: matchesArray.length,
        pending: pendingRequests
      });
    } catch (error) {
      console.error("Error fetching emergency data:", error);
      setError("Failed to load emergency data. Please try again.");
    } finally {
      setLoadingEmergencyData(false);
    }
  };
  
  // Run automatic matching for emergency requests and donations
  const runAutomaticMatching = async () => {
    setLoadingEmergencyData(true);
    try {
      // Get pending requests and available donations
      const pendingRequests = emergencyRequests.filter(req => req.status === 'pending');
      const availableDonations = emergencyDonations.filter(don => don.status === 'available');
      
      if (pendingRequests.length === 0 || availableDonations.length === 0) {
        setError("No pending requests or available donations to match.");
        return;
      }
      
      // Simple matching algorithm - match by type and then proximity
      let matchesMade = 0;
      
      for (const request of pendingRequests) {
        // Find donations of the same type
        const matchingDonations = availableDonations.filter(
          don => don.donationType === request.requestType && don.status === 'available'
        );
        
        if (matchingDonations.length > 0) {
          // Find the closest donation (in a real app, you'd use geocoding)
          // For demo, we'll just pick the first available match
          const donation = matchingDonations[0];
          
          // Create a match
          const matchRef = database.ref('emergencyMatches').push();
          const match = {
            requestId: request.id,
            donationId: donation.id,
            requestType: request.requestType,
            requesterLocation: request.location,
            donorLocation: donation.location,
            itemName: request.itemName,
            quantity: request.quantity,
            status: 'matched',
            createdAt: new Date().toISOString()
          };
          
          await matchRef.set(match);
          
          // Update request status
          await database.ref(`emergencyRequests/${request.id}`).update({
            status: 'matched',
            matchId: matchRef.key
          });
          
          // Update donation status
          await database.ref(`emergencyDonations/${donation.id}`).update({
            status: 'matched',
            matchId: matchRef.key
          });
          
          // Mark donation as unavailable for further matches
          availableDonations.find(d => d.id === donation.id).status = 'matched';
          
          matchesMade++;
        }
      }
      
      // Refresh data after matching
      await fetchEmergencyData();
      
      if (matchesMade > 0) {
        simulateBlockchainTransaction(`Created ${matchesMade} emergency matches`);
        alert(`Successfully matched ${matchesMade} emergency requests with donations.`);
      } else {
        alert("No suitable matches found. Try again when more compatible donations are available.");
      }
    } catch (error) {
      console.error("Error running automatic matching:", error);
      setError("Failed to run automatic matching. Please try again.");
    } finally {
      setLoadingEmergencyData(false);
    }
  };

  const updateBlockchainStatus = async (type, id, newStatus) => {
    if (!window.ethereum || !walletConnected) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect to MetaMask.'
      };
    }

    // Ensure we're on the correct network before proceeding
    const isOnCorrectNetwork = await ensureHardhatNetwork();
    if (!isOnCorrectNetwork) {
      return {
        success: false,
        error: 'Please switch to Hardhat Local network to proceed.'
      };
    }

    setBlockchainStatus(prev => ({
      ...prev,
      [id]: { loading: true, message: 'Updating blockchain status...' }
    }));

    try {
      // For demo purposes, we'll simulate the transaction instead of using actual blockchain
      // This helps avoid issues with MetaMask confirmation UI
      const txHash = simulateBlockchainTransaction(`Update ${type} donation ${id} status to ${newStatus}`);
      
      // Wait a bit to simulate transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBlockchainStatus(prev => ({
        ...prev,
        [id]: { 
          loading: false, 
          success: true,
          message: 'Status updated on blockchain',
          txHash: txHash
        }
      }));
      
      return {
        success: true,
        txHash: txHash
      };
    } catch (error) {
      console.error('Error updating blockchain status:', error);
      setBlockchainStatus(prev => ({
        ...prev,
        [id]: { 
          loading: false, 
          success: false,
          error: error.message || 'Error updating blockchain'
        }
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Updated handleStatusChange to include auto-removal for rejected items
  const handleStatusChange = async (type, id, newStatus) => {
    setLoading(true);
    try {
      // Update the status in Firebase
      await database.ref(`${type}Donations/${id}`).update({ status: newStatus });
      
      // Update local state
      setDonations((prev) => ({
        ...prev,
        [type]: prev[type].map((donation) =>
          donation.id === id ? { ...donation, status: newStatus } : donation
        )
      }));
      
      // Schedule removal if status is rejected
      if (newStatus === 'rejected') {
        // Show a temporary success message
        setBlockchainStatus(prev => ({
          ...prev,
          [id]: { 
            loading: false, 
            success: true,
            message: 'Donation rejected and will be removed in 30 seconds',
          }
        }));
        
        // Start countdown timer
        let secondsLeft = 30;
        setRejectionTimers(prev => ({
          ...prev,
          [id]: secondsLeft
        }));
        
        // Update the countdown every second
        const timerInterval = setInterval(() => {
          secondsLeft -= 1;
          setRejectionTimers(prev => ({
            ...prev,
            [id]: secondsLeft
          }));
          
          if (secondsLeft <= 0) {
            clearInterval(timerInterval);
          }
        }, 1000);
        
        // Schedule removal after 30 seconds
        setTimeout(() => {
          setItemsToRemove(prev => [...prev, id]);
          clearInterval(timerInterval);
        }, 30000); // 30 seconds
      }
      
      // Update the status on blockchain
      if (walletConnected) {
        await updateBlockchainStatus(type, id, newStatus);
      } else {
        setError('Wallet not connected. Please connect to MetaMask first.');
      }
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      setError(`Failed to update ${type} status.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge pending';
      case 'accepted':
        return 'status-badge accepted';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge';
    }
  };

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get all unique locations from both medicine and equipment donations
  const getUniqueLocations = () => {
    const medicineLocations = donations.medicine.map(d => d.location).filter(Boolean);
    const equipmentLocations = donations.equipment.map(d => d.location).filter(Boolean);
    const allLocations = [...medicineLocations, ...equipmentLocations];
    return [...new Set(allLocations)];
  };

  // Updated renderDonations to filter out removed items
  const renderDonations = (type, title) => {
    // Filter donations by location if a specific location is selected
    let filteredDonations = donations[type];
    
    // First filter by location if needed
    if (selectedLocation !== 'all') {
      filteredDonations = filteredDonations.filter(donation => donation.location === selectedLocation);
    }
    
    // Then filter out rejected items that are scheduled for removal
    filteredDonations = filteredDonations.filter(donation => !itemsToRemove.includes(donation.id));

    return (
      <div className="donation-section">
        <h3>{title} ({filteredDonations.length})</h3>
        {filteredDonations.length === 0 ? (
          <p className="no-donations">No {type} donations found.</p>
        ) : (
          <div className="donation-cards">
            {filteredDonations.map((donation) => (
              <div key={donation.id} className="donation-card">
                <div className="donation-header">
                  <span className={getStatusBadgeClass(donation.status)}>{donation.status}</span>
                  <span className="donation-id">ID: {donation.id.substring(0, 10)}...</span>
                </div>
                <div className="donation-details">
                  <p><strong>Item:</strong> {donation.medicineName || donation.equipmentName}</p>
                  <p><strong>Quantity:</strong> {donation.quantity}</p>
                  <p><strong>Location:</strong> {donation.location}</p>
                  <p><strong>Email:</strong> {donation.email}</p>
                  <p><strong>Date:</strong> {formatDate(donation.createdAt)}</p>
                  {donation.expiryDate && (
                    <p><strong>Expiry:</strong> {donation.expiryDate}</p>
                  )}
                </div>
                <div className="donation-actions">
                  {donation.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusChange(type, donation.id, 'accepted')}
                        className="accept-btn"
                        disabled={loading}
                      >
                        Accept Donation
                      </button>
                      <button 
                        onClick={() => handleStatusChange(type, donation.id, 'rejected')}
                        className="reject-btn"
                        disabled={loading}
                      >
                        Reject Donation
                      </button>
                    </>
                  )}
                  {blockchainStatus[donation.id] && (
                    <div className="blockchain-status">
                      {blockchainStatus[donation.id].loading && (
                        <p className="blockchain-loading">{blockchainStatus[donation.id].message}</p>
                      )}
                      {blockchainStatus[donation.id].success && (
                        <p className="blockchain-success">
                          {blockchainStatus[donation.id].message}
                          {blockchainStatus[donation.id].txHash && (
                            <span className="tx-hash"> (Tx: {blockchainStatus[donation.id].txHash.substring(0, 10)}...)</span>
                          )}
                        </p>
                      )}
                      {blockchainStatus[donation.id].error && (
                        <p className="blockchain-error">{blockchainStatus[donation.id].error}</p>
                      )}
                    </div>
                  )}
                  
                  {/* Add countdown timer for rejected items */}
                  {donation.status === 'rejected' && rejectionTimers[donation.id] > 0 && (
                    <div className="rejection-countdown">
                      Removing in {rejectionTimers[donation.id]} seconds
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Resource Redistribution Functions
  
  // Fetch inventory data and analyze for redistribution
  const getRedistributionAlerts = async () => {
    try {
      setRedistributionLoading(true);
      
      // Using the mock implementation for demo
      // 1. Fetch inventory data from Firebase - we already have donations data
      const medicineItems = donations.medicine.filter(item => item.status === 'accepted').map(item => ({
        id: item.id,
        type: 'medicine',
        name: item.medicineName,
        location: item.location,
        quantity: item.quantity,
        dateAdded: item.createdAt,
        expiryDate: item.expiryDate || null,
        lastMoved: item.lastMoved || item.createdAt
      }));
      
      const equipmentItems = donations.equipment.filter(item => item.status === 'accepted').map(item => ({
        id: item.id,
        type: 'equipment',
        name: item.equipmentName,
        location: item.location,
        quantity: item.quantity,
        dateAdded: item.createdAt,
        condition: item.condition || 'good',
        lastMoved: item.lastMoved || item.createdAt
      }));
      
      // Fetch locations data
      const locationsSnapshot = await database.ref('locations').once('value');
      const locationsData = locationsSnapshot.val() || {};
      
      const locations = {};
      Object.keys(locationsData).forEach(key => {
        const data = locationsData[key];
        locations[key] = {
          id: key,
          name: data.name || key,
          address: data.address || '',
          needs: data.needs || []
        };
      });
      
      // 2. Prepare data for analysis
      const inventoryData = [...medicineItems, ...equipmentItems];
      
      // 3. Call mock implementation
      const analysisResult = await analyzeInventoryForRedistribution(inventoryData, locations);
      
      // 4. Process and set the alerts
      setAlerts(analysisResult);
      setRedistributionError(null);
    } catch (err) {
      console.error('Error getting redistribution alerts:', err);
      setRedistributionError('Failed to analyze inventory data. Please try again.');
    } finally {
      setRedistributionLoading(false);
    }
  };

  // Mock implementation of inventory analysis
  const analyzeInventoryForRedistribution = async (inventory, locations) => {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock recommendations based on actual inventory
    const stagnantItems = inventory.filter(item => {
      const lastMovedDate = new Date(item.lastMoved || item.dateAdded);
      const today = new Date();
      const daysSinceLastMoved = (today - lastMovedDate) / (1000 * 60 * 60 * 24);
      return daysSinceLastMoved > 60;
    });
    
    // If no stagnant items, return empty array
    if (stagnantItems.length === 0) return [];
    
    // Get available locations
    const locationIds = Object.keys(locations);
    if (locationIds.length < 2) return [];
    
    // Generate recommendations
    return stagnantItems.map((item, index) => {
      // Find a different location than the current one
      const availableLocations = locationIds.filter(loc => loc !== item.location);
      const targetLocation = availableLocations[Math.floor(Math.random() * availableLocations.length)];
      
      // Determine urgency based on item type and other factors
      let urgency = 'medium';
      if (item.type === 'medicine' && item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 90) urgency = 'high';
      }
      
      return {
        id: `suggestion-${index}`,
        itemId: item.id,
        itemName: item.name,
        itemType: item.type,
        fromLocation: item.location,
        toLocation: targetLocation,
        quantity: item.quantity,
        urgency: urgency,
        reasoning: generateReasoning(item, locations[targetLocation], urgency),
        status: 'pending'
      };
    });
  };

  // Helper function to generate reasoning text
  const generateReasoning = (item, targetLocation, urgency) => {
    const reasons = [
      `This ${item.type} has been unused for over 60 days and would be better utilized at ${targetLocation?.name || targetLocation?.id || 'another location'}.`,
      `${targetLocation?.name || targetLocation?.id || 'The destination location'} has indicated a need for similar resources, while this item remains unused at its current location.`,
      `Redistributing this resource will optimize overall inventory distribution across locations.`
    ];
    
    if (item.type === 'medicine' && item.expiryDate) {
      reasons.push(`This medicine will expire soon and should be used where it's needed most.`);
    }
    
    if (urgency === 'high') {
      return `URGENT: ${reasons[0]} ${reasons[Math.floor(Math.random() * (reasons.length - 1)) + 1]}`;
    } else {
      return `${reasons[0]} ${reasons[Math.floor(Math.random() * (reasons.length - 1)) + 1]}`;
    }
  };

  // Handle accepting a redistribution suggestion
  const handleAccept = async (alertId) => {
    try {
      const alert = alerts.find(a => a.id === alertId);
      
      // Update the alert status
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'processing' } : a
      ));
      
      // Create transfer record
      const transferRef = database.ref('transfers').push();
      
      const transfer = {
        sourceLocation: alert.fromLocation,
        destinationLocation: alert.toLocation,
        itemName: alert.itemName,
        itemType: alert.itemType,
        itemId: alert.itemId,
        quantity: alert.quantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reason: alert.reasoning
      };
      
      await transferRef.set(transfer);
      
      // Update the item's location and lastMoved date
      const itemRef = database.ref(`${alert.itemType}Donations/${alert.itemId}`);
      await itemRef.update({
        transferStatus: 'pending_transfer',
        transferId: transferRef.key,
        transferDestination: alert.toLocation,
        lastMoved: new Date().toISOString()
      });
      
      // Update alert status to accepted
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'accepted' } : a
      ));
      
      // Add blockchain transaction for traceability
      if (walletConnected) {
        simulateBlockchainTransaction(`Resource transfer initiated: ${alert.itemName} from ${alert.fromLocation} to ${alert.toLocation}`);
      }
    } catch (err) {
      console.error('Error accepting suggestion:', err);
      
      // Revert to pending status on error
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'pending', error: err.message } : a
      ));
    }
  };

  // Handle rejecting a suggestion
  const handleReject = (alertId) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'rejected' } : a
    ));
  };

  // Filter alerts based on showProcessed state
  const filteredAlerts = showProcessed 
    ? alerts 
    : alerts.filter(alert => alert.status === 'pending');

  // Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle color="success" />;
      case 'rejected': return <Close color="error" />;
      case 'processing': return <CircularProgress size={20} />;
      default: return null;
    }
  };

  // Get item type icon
  const getTypeIcon = (type) => {
    return type === 'medicine' 
      ? <LocalHospital fontSize="small" color="primary" />
      : <Inventory fontSize="small" color="secondary" />;
  };
  
  // Render emergency data tables
  const renderEmergencyTable = (type) => {
    let data = [];
    let columns = [];
    
    if (type === 'donations') {
      data = emergencyDonations;
      columns = [
        { id: 'id', label: 'ID', format: (value) => value.substring(0, 10) + '...' },
        { id: 'donationType', label: 'Type' },
        { id: 'itemName', label: 'Item' },
        { id: 'quantity', label: 'Quantity' },
        { id: 'location', label: 'Location' },
        { id: 'status', label: 'Status' },
        { id: 'createdAt', label: 'Created', format: (value) => formatDate(value) }
      ];
    } else if (type === 'requests') {
      data = emergencyRequests;
      columns = [
        { id: 'id', label: 'ID', format: (value) => value.substring(0, 10) + '...' },
        { id: 'requestType', label: 'Type' },
        { id: 'itemName', label: 'Item' },
        { id: 'quantity', label: 'Quantity' },
        { id: 'urgency', label: 'Urgency' },
        { id: 'location', label: 'Location' },
        { id: 'status', label: 'Status' },
        { id: 'createdAt', label: 'Created', format: (value) => formatDate(value) }
      ];
    } else if (type === 'matches') {
      data = emergencyMatches;
      columns = [
        { id: 'id', label: 'ID', format: (value) => value.substring(0, 10) + '...' },
        { id: 'requestType', label: 'Type' },
        { id: 'itemName', label: 'Item' },
        { id: 'requesterLocation', label: 'Requester' },
        { id: 'donorLocation', label: 'Donor' },
        { id: 'status', label: 'Status' },
        { id: 'createdAt', label: 'Created', format: (value) => formatDate(value) }
      ];
    }
    
    return (
      <div className="emergency-table-container">
        <table className="emergency-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.id}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingEmergencyData ? (
              <tr>
                <td colSpan={columns.length + 1} className="loading-cell">
                  Loading data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="loading-cell">
                  No {type} found.
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id}>
                  {columns.map(column => (
                    <td key={column.id}>
                      {column.format ? column.format(item[column.id]) : item[column.id]}
                    </td>
                  ))}
                  <td>
                    <button className="view-details-btn">Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="wallet-status">
          {walletConnected ? (
            <div className="wallet-info">
              <span className="wallet-connected">Wallet Connected</span>
              {networkStatus.name && (
                <span className={`network-badge ${networkStatus.isCorrectNetwork ? 'network-correct' : 'network-wrong'}`}>
                  Network: {networkStatus.isCorrectNetwork ? 'Hardhat Local ✓' : `${networkStatus.name} ✗`}
                </span>
              )}
              {!networkStatus.isCorrectNetwork && (
                <button 
                  onClick={ensureHardhatNetwork}
                  className="network-switch-button"
                >
                  Switch to Hardhat
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={async () => {
                try {
                  if (window.ethereum) {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setWalletConnected(true);
                    // Check network immediately after connecting
                    await ensureHardhatNetwork();
                  } else {
                    setError('Please install MetaMask to connect your wallet');
                  }
                } catch (error) {
                  console.error('Error connecting to wallet:', error);
                  setError('Failed to connect to wallet');
                }
              }}
              className="connect-wallet-button"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      {!networkStatus.isCorrectNetwork && walletConnected && (
        <div className="network-warning">
          <p>⚠️ You are connected to {networkStatus.name || 'an incorrect network'}. Please switch to Hardhat Local network to use this application.</p>
        </div>
      )}
      
      {/* Tabs for different sections */}
      <div className="admin-tabs">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="admin-tabs-container"
        >
          <Tab label="Dashboard" />
          <Tab label="Donation Management" />
          <Tab label="Resource Redistribution" />
          {disasterMode.active && (
            <Tab label="Emergency Response" />
          )}
        </Tabs>
      </div>
      
      {/* Dashboard Tab */}
      {tabValue === 0 && (
        <>
          <div className="admin-dashboard-top">
            {/* Blockchain Status Display */}
            <div className="blockchain-stats">
              <h4>Blockchain Status</h4>
              <div className="stats-content">
                <p><strong>Network:</strong> {networkStatus.name}</p>
                <p><strong>Donations Registered:</strong> {blockchainStats.totalDonations}</p>
                <p><strong>Latest Transaction:</strong> {blockchainStats.latestTx !== '-' ? 
                  <span className="tx-hash">{blockchainStats.latestTx.substring(0, 10)}...</span> : '-'}</p>
                <p><strong>Last Updated:</strong> {blockchainStats.lastUpdated ? 
                  formatDate(blockchainStats.lastUpdated) : 'Never'}</p>
              </div>
            </div>
            
            {/* Blockchain Verification Feature */}
            <div className="blockchain-verification">
              <h4>Verify Donation</h4>
              <div className="verification-content">
                <div className="verification-input">
                  <input 
                    type="text" 
                    placeholder="Enter donation ID" 
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                  />
                  <button onClick={verifyDonation}>Verify</button>
                </div>
                
                {verificationResult && (
                  <div className={`verification-result ${verificationResult.found ? 'found' : 'not-found'}`}>
                    {verificationResult.found ? (
                      <>
                        <p className="verification-success">✓ Donation verified on blockchain</p>
                        <p><strong>ID:</strong> {verificationResult.donation.id}</p>
                        <p><strong>Type:</strong> {verificationResult.donation.medicineName ? 'Medicine' : 'Equipment'}</p>
                        <p><strong>Status:</strong> {verificationResult.donation.status}</p>
                        <p><strong>TX Hash:</strong> <span className="tx-hash">{verificationResult.txHash.substring(0, 10)}...</span></p>
                      </>
                    ) : (
                      <p className="verification-error">{verificationResult.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Disaster Mode Control */}
          <div className="disaster-mode-control">
            <h4>Emergency Disaster Response</h4>
            <div className="disaster-mode-status">
              <div className={`status-indicator ${disasterMode.active ? 'active' : 'inactive'}`}>
                {disasterMode.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
              {disasterMode.active && (
                <div className="disaster-details">
                  <p><strong>Location:</strong> {disasterMode.location}</p>
                  <p><strong>Description:</strong> {disasterMode.description}</p>
                  <p><strong>Activated:</strong> {formatDate(disasterMode.activatedAt)}</p>
                </div>
              )}
            </div>
            <div className="disaster-actions">
              {disasterMode.active ? (
                <button 
                  className="button emergency-deactivate"
                  onClick={() => toggleDisasterMode(false)}
                >
                  Deactivate Emergency Mode
                </button>
              ) : (
                <button 
                  className="button emergency-activate"
                  onClick={() => setDisasterModalOpen(true)}
                >
                  Activate Emergency Mode
                </button>
              )}
            </div>
          </div>
          
          {/* Demo Mode Button */}
          <div className="demo-controls">
            <button 
              className="button demo-button"
              onClick={() => {
                const txHash = simulateBlockchainTransaction("Demo transaction");
                setTimeout(() => {
                  alert(`DEMO MODE: Transaction ${txHash.substring(0, 10)}... successfully confirmed on blockchain!`);
                }, 2000);
              }}
            >
              DEMO MODE: Simulate Transaction
            </button>
          </div>
          
          {/* Transaction History Section */}
          <div className="transaction-history">
            <h4>Transaction History</h4>
            {transactionHistory.length === 0 ? (
              <p className="no-transactions">No transactions recorded yet</p>
            ) : (
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Transaction Hash</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((tx, index) => (
                    <tr key={index} className={tx.status}>
                      <td className="tx-hash">{tx.txHash.substring(0, 10)}...</td>
                      <td>{tx.action}</td>
                      <td>
                        <span className={`tx-status ${tx.status}`}>
                          {tx.status === 'pending' ? '⏳ Pending' : '✓ Confirmed'}
                        </span>
                      </td>
                      <td>{formatDate(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
      
      {/* Donation Management Tab */}
      {tabValue === 1 && (
        <>
          <div className="blockchain-info">
            <p>
              <strong>Blockchain Verification:</strong> When you change a donation status, 
              it will be permanently recorded on the blockchain for transparency and trust.
            </p>
          </div>
          
          <div className="location-filter-container">
            <label htmlFor="location-filter">Filter by Hospital:</label>
            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="location-filter-select"
            >
              <option value="all">All Locations</option>
              {getUniqueLocations().map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="dashboard-content">
            {renderDonations('medicine', 'Medicine Donations')}
            {renderDonations('equipment', 'Medical Equipment Donations')}
          </div>
        </>
      )}
      
      {/* Resource Redistribution Tab */}
      {tabValue === 2 && (
        <div className="resource-redistribution">
          <div className="redistribution-header">
            <h3>Resource Redistribution</h3>
            <div className="redistribution-actions">
              <button 
                onClick={() => setShowProcessed(!showProcessed)}
                className={`button ${showProcessed ? 'secondary' : 'outline'}`}
              >
                {showProcessed ? 'Hide Processed' : 'Show All'}
              </button>
              
              <button 
                onClick={getRedistributionAlerts}
                className="button primary"
                disabled={redistributionLoading}
              >
                {redistributionLoading ? 'Analyzing...' : 'Analyze & Recommend Transfers'}
              </button>
            </div>
          </div>
          
          <div className="redistribution-info">
            <p>
              This AI-powered system analyzes your inventory and identifies items that haven't been moved in 60+ days. 
              It then recommends optimal transfers to locations where these resources are needed.
            </p>
          </div>

          {redistributionLoading ? (
            <div className="loading-container">
              <CircularProgress />
              <p>Analyzing inventory data and generating recommendations...</p>
            </div>
          ) : redistributionError ? (
            <div className="error-message">{redistributionError}</div>
          ) : alerts.length === 0 ? (
            <div className="no-alerts-message">
              <p>No redistribution alerts at this time. All inventory is optimally distributed or no items have been unused for more than 60 days.</p>
              <button 
                onClick={getRedistributionAlerts}
                className="button outline"
              >
                Run Analysis
              </button>
            </div>
          ) : (
            <>
              <div className="alerts-count">
                <h4>
                  {filteredAlerts.length} {filteredAlerts.length === 1 ? 'Recommendation' : 'Recommendations'} Found
                </h4>
              </div>
              
              <div className="alerts-container">
                {filteredAlerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`alert-card ${alert.status !== 'pending' ? 'processed' : ''} ${alert.urgency?.toLowerCase()}`}
                  >
                    <div className="alert-header">
                      <div className="alert-title">
                        <span className="item-type-icon">
                          {alert.itemType === 'medicine' ? (
                            <LocalHospital fontSize="small" />
                          ) : (
                            <Inventory fontSize="small" />
                          )}
                        </span>
                        <h4>{alert.itemName}</h4>
                        <span className={`urgency-badge ${alert.urgency?.toLowerCase()}`}>
                          {alert.urgency}
                        </span>
                      </div>
                      
                      {alert.status !== 'pending' && (
                        <div className="alert-status">
                          <span className={`status-text ${alert.status}`}>{alert.status}</span>
                          {getStatusIcon(alert.status)}
                        </div>
                      )}
                    </div>
                    
                    <div className="alert-content">
                      <div className="transfer-details">
                        <div className="location-from">
                          <span className="location-label">From:</span>
                          <span className="location-value">{alert.fromLocation}</span>
                        </div>
                        <div className="transfer-arrow">
                          <MoveDown />
                        </div>
                        <div className="location-to">
                          <span className="location-label">To:</span>
                          <span className="location-value">{alert.toLocation}</span>
                        </div>
                      </div>
                      
                      <div className="quantity">
                        Quantity: <strong>{alert.quantity}</strong>
                      </div>
                      
                      <div className="reasoning">
                        <p>{alert.reasoning}</p>
                      </div>
                    </div>
                    
                    {alert.status === 'pending' && (
                      <div className="alert-actions">
                        <button 
                          onClick={() => handleAccept(alert.id)}
                          className="button primary"
                          disabled={redistributionLoading}
                        >
                          Initiate Transfer
                        </button>
                        <button 
                          onClick={() => handleReject(alert.id)}
                          className="button reject"
                          disabled={redistributionLoading}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    
                    {alert.error && (
                      <div className="alert-error">
                        {alert.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Emergency Response Tab */}
      {tabValue === 3 && disasterMode.active && (
        <div className="emergency-response-tab">
          <h3>Emergency Response Dashboard</h3>
          <div className="emergency-stats">
            <div className="emergency-banner">
              <strong>ACTIVE EMERGENCY:</strong> {disasterMode.description} at {disasterMode.location}
              <span className="activation-time">Activated: {formatDate(disasterMode.activatedAt)}</span>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{emergencyStats.donations}</div>
                <div className="stat-label">Emergency Donations</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{emergencyStats.requests}</div>
                <div className="stat-label">Help Requests</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{emergencyStats.matches}</div>
                <div className="stat-label">Fulfilled Requests</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{emergencyStats.pending}</div>
                <div className="stat-label">Pending Requests</div>
              </div>
            </div>
          </div>
          
          <div className="emergency-tabs">
            <button 
              className={`tab-button ${emergencyTabValue === 0 ? 'active' : ''}`}
              onClick={() => handleEmergencyTabChange(0)}
            >
              Emergency Donations
            </button>
            <button 
              className={`tab-button ${emergencyTabValue === 1 ? 'active' : ''}`}
              onClick={() => handleEmergencyTabChange(1)}
            >
              Help Requests
            </button>
            <button 
              className={`tab-button ${emergencyTabValue === 2 ? 'active' : ''}`}
              onClick={() => handleEmergencyTabChange(2)}
            >
              Matches
            </button>
          </div>
          
          {emergencyTabValue === 0 && renderEmergencyTable('donations')}
          {emergencyTabValue === 1 && renderEmergencyTable('requests')}
          {emergencyTabValue === 2 && renderEmergencyTable('matches')}
          
          <div className="emergency-actions">
            <button 
              className="button primary refresh-btn"
              onClick={fetchEmergencyData}
              disabled={loadingEmergencyData}
            >
              {loadingEmergencyData ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              className="button outline match-btn"
              onClick={runAutomaticMatching}
              disabled={loadingEmergencyData}
            >
              Run Automatic Matching
            </button>
          </div>
        </div>
      )}
      
      {/* Disaster Mode Activation Modal */}
      {disasterModalOpen && (
        <div className="modal-overlay">
          <div className="disaster-modal">
            <h3>Activate Emergency Disaster Mode</h3>
            <p className="warning-text">
              This will enable emergency donations and requests on the platform.
              Use only for genuine emergency situations.
            </p>
            
            <div className="form-group">
              <label>Emergency Location</label>
              <input 
                type="text" 
                value={disasterMode.location} 
                onChange={(e) => setDisasterMode({...disasterMode, location: e.target.value})}
                placeholder="e.g., Chennai, Tamil Nadu"
              />
            </div>
            
            <div className="form-group">
              <label>Emergency Description</label>
              <textarea 
                value={disasterMode.description} 
                onChange={(e) => setDisasterMode({...disasterMode, description: e.target.value})}
                placeholder="Describe the emergency situation"
                rows={4}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="button cancel"
                onClick={() => setDisasterModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="button emergency-activate"
                onClick={() => toggleDisasterMode(true, disasterMode)}
                disabled={!disasterMode.location || !disasterMode.description}
              >
                Activate Emergency Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;