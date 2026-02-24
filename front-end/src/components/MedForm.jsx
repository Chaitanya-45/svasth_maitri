import React, { useState, useEffect } from 'react';
import './MedForm.css';
import { ethers } from 'ethers';
import DonationVerifierJSON from '../blockchain/DonationVerifierABI.json';

function MedForm() {
  const [formData, setFormData] = useState({
    medicineName: '',
    quantity: '',
    location: '',
    email: '',
    expiryDate: '',
    donationTime: '',
  });
  const [blockchainError, setBlockchainError] = useState('');
  const [blockchainSuccess, setBlockchainSuccess] = useState('');
  const [networkStatus, setNetworkStatus] = useState({
    isCorrectNetwork: false,
    name: ''
  });
  
  // NEW: State for demo transactions
  const [demoTransactionHash, setDemoTransactionHash] = useState(null);

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
              setBlockchainError('Failed to add Hardhat network to MetaMask');
              return false;
            }
          }
          console.error('Error switching to Hardhat network:', switchError);
          setBlockchainError('Failed to switch to Hardhat network. Please switch manually in MetaMask.');
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      setBlockchainError('Failed to check current network');
      return false;
    }
  };

  // NEW: Generate a fake transaction hash for demo purposes
  const generateFakeTransactionHash = () => {
    return '0x' + Array.from({length: 64}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  };

  // NEW: Simulate a blockchain transaction for demo
  const simulateTransaction = () => {
    setBlockchainError('');
    setBlockchainSuccess('DEMO MODE: Processing transaction...');
    
    // Generate a fake transaction hash
    const txHash = generateFakeTransactionHash();
    setDemoTransactionHash(txHash);
    
    // Simulate blockchain transaction processing time
    setTimeout(() => {
      setBlockchainSuccess(`DEMO MODE: Transaction successfully confirmed on blockchain!`);
    }, 2000);
    
    return txHash;
  };

  // Check network when component mounts
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        await ensureHardhatNetwork();
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          ensureHardhatNetwork();
        });
      }
    };
    
    checkNetwork();
    
    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const registerOnBlockchain = async (donationId) => {
    try {
      setBlockchainError('');
      setBlockchainSuccess('');

      if (!window.ethereum) {
        console.warn("Ethereum provider not found. Please install MetaMask.");
        setBlockchainError("MetaMask not detected. Please install MetaMask browser extension.");
        return false;
      }

      // Ensure we're on Hardhat network before proceeding
      const isOnCorrectNetwork = await ensureHardhatNetwork();
      if (!isOnCorrectNetwork) {
        return false;
      }

      // Create a BrowserProvider using the window.ethereum object (ethers v6)
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network - verify we're on Hardhat
      const network = await provider.getNetwork();
      console.log("Connected to network:", network);
      
      // Double check we're on the right network
      if (network.chainId.toString() !== '31337') {
        setBlockchainError(`Wrong network detected: ${network.name}. Please switch to Hardhat Local network.`);
        return false;
      }
      
      // Request account access if needed
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      // Get the contract address from environment variables
      const contractAddress = import.meta.env.VITE_DV_ADDRESS || '0x73511669fd4de447fed18bb79bafeac93ab7f31f';
      
      console.log("Using contract address:", contractAddress);
      console.log("ABI:", DonationVerifierJSON.abi); // Debug to check the ABI
      
      const donationVerifier = new ethers.Contract(
        contractAddress,
        DonationVerifierJSON.abi,
        signer
      );
      
      const expiryTimestamp = formData.expiryDate ? 
        Math.floor(new Date(formData.expiryDate).getTime() / 1000) : 0;

      console.log("Calling registerDonation with:", {
        donationId,
        donationType: "medicine",
        donorEmail: formData.email,
        itemDetails: formData.medicineName,
        quantity: parseInt(formData.quantity),
        location: formData.location,
        expiryTimestamp
      });

      const tx = await donationVerifier.registerDonation(
        donationId,               // donationId
        "medicine",               // donationType
        formData.email,           // donorEmail
        formData.medicineName,    // itemDetails
        parseInt(formData.quantity), // quantity
        formData.location,        // location
        expiryTimestamp           // expiryTimestamp
      );
      
      setBlockchainSuccess("Transaction submitted. Waiting for confirmation...");
      
      await tx.wait();
      
      setBlockchainSuccess("Donation successfully registered on blockchain!");
      return true;
    } catch (error) {
      console.error("Blockchain error:", error);
      setBlockchainError(`Blockchain registration failed: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // First check if we're on the right network
      const isOnCorrectNetwork = await ensureHardhatNetwork();
      if (!isOnCorrectNetwork) {
        setBlockchainError("Please switch to Hardhat Local network before donating");
        return;
      }
      
      const donationData = {
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString(), 
      };

      // Submit to backend first
      const response = await fetch('http://localhost:5000/submit-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Donation submitted successfully.');
        
        // Generate a unique donation ID based on medicine name and timestamp
        const donationId = `medicine-${Date.now()}`;
        
        // Register the donation on the blockchain
        await registerOnBlockchain(donationId);
        
        // Reset form after successful submission
        setFormData({
          medicineName: '',
          quantity: '',
          location: '',
          email: '',
          expiryDate: '',
          donationTime: '',
        });
      } else {
        console.error('Failed to submit donation to backend.');
        setBlockchainError('Failed to submit donation to backend server.');
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      setBlockchainError(`Error: ${error.message}`);
    }
  };

  return (
    <section className="header">
      <div className="wrapper">
        <div className="card">
          <div className="title">
            <h2>Medicines Donation Form</h2>
          </div>
          
          {!networkStatus.isCorrectNetwork && (
            <div className="message warning">
              ⚠️ You are connected to {networkStatus.name || 'an incorrect network'}. 
              <button onClick={ensureHardhatNetwork} className="network-switch-button">
                Switch to Hardhat Local
              </button>
            </div>
          )}
          
          {blockchainError && (
            <div className="message error">
              {blockchainError}
            </div>
          )}
          {blockchainSuccess && (
            <div className="message success">
              {blockchainSuccess}
              {demoTransactionHash && (
                <div className="tx-hash">Transaction: {demoTransactionHash.substring(0, 10)}...</div>
              )}
            </div>
          )}
          
          <div className="form-content">
            <form onSubmit={handleSubmit} action="/submit-medicine" id="donationForm">
              <div className="input_wrap">
                <label htmlFor="medicineName">Medicine Name</label>
                <input
                  type="text"
                  name="medicineName"
                  id="medicineName"
                  placeholder="Enter the medicine name"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  placeholder="Enter the quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="location">Hospital Name</label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  placeholder="Enter the hospital name"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="donationTime">Donation time:</label>
                <input
                  type="time"
                  name="donationTime"
                  id="donationTime"
                  value={formData.donationTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <input 
                type="submit" 
                className="button" 
                value="Donate Now" 
                disabled={!networkStatus.isCorrectNetwork}
              />
            </form>
            
            {/* NEW: Demo Mode Button */}
            <div className="demo-section">
              <button 
                className="button demo-button"
                onClick={() => {
                  simulateTransaction();
                }}
              >
                DEMO MODE: Simulate Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MedForm;