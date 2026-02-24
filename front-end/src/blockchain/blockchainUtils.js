import { ethers } from 'ethers';
import DonationVerifierJSON from './DonationVerifierABI.json';

const FALLBACK_CONTRACT_ADDRESS = '0x73511669fd4de447fed18bb79bafeac93ab7f31f';

function getConfiguredContractAddress() {
  // Vite exposes env at import.meta.env
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_DV_ADDRESS) {
      return import.meta.env.VITE_DV_ADDRESS;
    }
  } catch (e) {
    // ignore in environments where import.meta isn't available
  }

  // CRA-style env fallback
  if (typeof process !== 'undefined' && process?.env?.REACT_APP_DV_ADDRESS) {
    return process.env.REACT_APP_DV_ADDRESS;
  }

  return FALLBACK_CONTRACT_ADDRESS;
}

function toNumberSafe(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'object' && typeof v.toNumber === 'function') return v.toNumber();
  return Number(v);
}

async function ensureBrowserProvider() {
  if (!window?.ethereum) throw new Error('No injected wallet (MetaMask) found. Connect MetaMask to the local RPC and unlock it.');
  // ethers v6: BrowserProvider
  const provider = new ethers.BrowserProvider(window.ethereum);
  // request account access
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContractAndSigner() {
  const { provider, signer } = await ensureBrowserProvider();
  const address = getConfiguredContractAddress();
  const contract = new ethers.Contract(address, DonationVerifierJSON.abi, signer);
  return { provider, signer, contract };
}

export const initializeBlockchain = async () => {
  try {
    const { provider, contract } = await getContractAndSigner();
    const network = await provider.getNetwork();
    return {
      success: true,
      network: {
        name: network.name,
        chainId: network.chainId
      }
    };
  } catch (error) {
    console.error('Failed to initialize blockchain:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Register a donation on the blockchain (signed by connected wallet)
export async function registerDonationOnBlockchain(donationData) {
  try {
    const { contract } = await getContractAndSigner();
    
    // Ensure donationId is a string
    const id = donationData.id || `donation-${Date.now()}`;
    
    const tx = await contract.registerDonation(
      id,
      donationData.type || 'medicine',
      donationData.email || '',
      donationData.name || '',
      toNumberSafe(donationData.quantity),
      donationData.location || '',
      toNumberSafe(donationData.expiryTimestamp)
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Failed to register donation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update donation status on blockchain (admin only)
export async function updateDonationStatusOnBlockchain(donationId, newStatus) {
  try {
    const { contract } = await getContractAndSigner();
    
    const tx = await contract.updateDonationStatus(
      donationId,
      newStatus
    );
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.hash
    };
  } catch (error) {
    console.error('Failed to update donation status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}