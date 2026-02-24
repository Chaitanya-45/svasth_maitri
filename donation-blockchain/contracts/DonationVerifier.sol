// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationVerifier {
    address public owner;
    
    // Donation struct to store essential verification data
    struct Donation {
        string donationId;        // Firebase ID
        string donationType;      // "medicine", "equipment", "blood"
        string donorEmail;        // Email hash (for privacy)
        string itemDetails;       // Medicine name, equipment name, or blood type
        uint256 quantity;         // Quantity donated
        string location;          // Hospital location
        uint256 expiryTimestamp;  // For medicine (0 for non-medicine)
        uint256 createdAt;        // When donation was recorded
        string status;            // "pending", "accepted", "rejected"
        bool verified;            // Verification status
    }
    
    // Mapping from donation ID to Donation
    mapping(string => Donation) public donations;
    
    // Mapping to track admin addresses
    mapping(address => bool) public admins;
    
    // Events
    event DonationRegistered(
        string donationId, 
        string donationType,
        string donorEmailHash,
        uint256 timestamp
    );
    
    event DonationStatusUpdated(
        string donationId, 
        string newStatus,
        uint256 timestamp
    );
    
    event DonationVerified(
        string donationId,
        string verifiedBy,
        uint256 timestamp
    );
    
    // Constructor
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admins can call this function");
        _;
    }
    
    // Function to add or remove admins
    function setAdmin(address adminAddress, bool isAdmin) public onlyOwner {
        admins[adminAddress] = isAdmin;
    }
    
    // Hash function for emails (for privacy)
    function hashEmail(string memory email) public pure returns (string memory) {
        return email; // In a real implementation, use a proper hashing method
    }
    
    // Register a new donation
    function registerDonation(
        string memory donationId,
        string memory donationType,
        string memory donorEmail,
        string memory itemDetails,
        uint256 quantity,
        string memory location,
        uint256 expiryTimestamp
    ) public {
        // Hash email for privacy
        string memory emailHash = hashEmail(donorEmail);
        
        // Create donation record
        donations[donationId] = Donation({
            donationId: donationId,
            donationType: donationType,
            donorEmail: emailHash,
            itemDetails: itemDetails,
            quantity: quantity,
            location: location,
            expiryTimestamp: expiryTimestamp,
            createdAt: block.timestamp,
            status: "pending",
            verified: false
        });
        
        emit DonationRegistered(donationId, donationType, emailHash, block.timestamp);
    }
    
    // Update donation status (admin only)
    function updateDonationStatus(
        string memory donationId, 
        string memory newStatus
    ) public onlyAdmin {
        require(
            keccak256(bytes(donations[donationId].donationId)) != keccak256(bytes("")),
            "Donation not found"
        );
        
        donations[donationId].status = newStatus;
        
        // If status is "accepted", mark as verified
        if (keccak256(bytes(newStatus)) == keccak256(bytes("accepted"))) {
            donations[donationId].verified = true;
        } else {
            donations[donationId].verified = false;
        }
        
        emit DonationStatusUpdated(donationId, newStatus, block.timestamp);
        
        if (donations[donationId].verified) {
            emit DonationVerified(donationId, "admin", block.timestamp);
        }
    }
    
    // Verify a donation's details and status
    function verifyDonation(
        string memory donationId
    ) public view returns (
        string memory donationType,
        string memory itemDetails,
        uint256 quantity,
        string memory location,
        uint256 expiryTimestamp,
        uint256 createdAt,
        string memory status,
        bool verified
    ) {
        Donation storage donation = donations[donationId];
        
        require(
            keccak256(bytes(donation.donationId)) != keccak256(bytes("")),
            "Donation not found"
        );
        
        return (
            donation.donationType,
            donation.itemDetails,
            donation.quantity,
            donation.location,
            donation.expiryTimestamp,
            donation.createdAt,
            donation.status,
            donation.verified
        );
    }
    
    // Check if a donation is verified
    function isVerified(string memory donationId) public view returns (bool) {
        return donations[donationId].verified;
    }
    
    // Get total donation count by type and status
    function getDonationStats(
        string memory donationType, 
        string memory status
    ) public view returns (uint256) {
        uint256 count = 0;
        
        // This is inefficient for large datasets but works for demonstration
        // In production, maintain counters in storage
        for (uint i = 0; i < 100; i++) { // Arbitrary limit to prevent gas issues
            string memory id = string(abi.encodePacked("donation-", i));
            
            if (
                keccak256(bytes(donations[id].donationId)) != keccak256(bytes("")) &&
                keccak256(bytes(donations[id].donationType)) == keccak256(bytes(donationType)) &&
                keccak256(bytes(donations[id].status)) == keccak256(bytes(status))
            ) {
                count++;
            }
        }
        
        return count;
    }
}