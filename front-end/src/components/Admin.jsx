import React, { useState, useEffect } from 'react';
import { database } from '../firebase/firebase';
import './Admin.css';

function Admin() {
  const [donations, setDonations] = useState({
    medicine: [],
    equipment: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    const fetchDonations = (type) => {
      const ref = database.ref(`${type}Donations`);
      ref.on(
        'value',
        (snapshot) => {
          const data = snapshot.val();
          setDonations((prev) => ({
            ...prev,
            [type]: data
              ? Object.entries(data).map(([id, details]) => ({
                  id,
                  ...details,
                  // If createdAt doesn't exist, use current timestamp as fallback
                  createdAt: details.createdAt || new Date().toISOString()
                }))
              : []
          }));
        },
        (error) => {
          console.error(`Error fetching ${type} donations:`, error);
          setError(`Failed to fetch ${type} donations.`);
        }
      );

      return () => ref.off();
    };

    const types = ['medicine', 'equipment'];
    types.forEach(fetchDonations);

    return () => types.forEach((type) => database.ref(`${type}Donations`).off());
  }, []);

  const handleStatusChange = async (type, id, newStatus) => {
    setLoading(true);
    try {
      await database.ref(`${type}Donations/${id}`).update({ status: newStatus });
      setDonations((prev) => ({
        ...prev,
        [type]: prev[type].map((donation) =>
          donation.id === id ? { ...donation, status: newStatus } : donation
        )
      }));
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      setError(`Failed to update ${type} status.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'accepted': return 'status-badge accepted';
      case 'rejected': return 'status-badge rejected';
      default: return 'status-badge pending';
    }
  };

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Format: "March 28, 2025 at 2:15 PM"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date error';
    }
  };

  // Get all unique locations from both medicine and equipment donations
  const getUniqueLocations = () => {
    const medicineLocations = donations.medicine.map(item => item.location);
    const equipmentLocations = donations.equipment.map(item => item.location);
    const allLocations = [...medicineLocations, ...equipmentLocations];
    // Filter out undefined/null values and create a unique set
    const uniqueLocations = [...new Set(allLocations.filter(location => location))];
    return uniqueLocations;
  };

  const renderDonations = (type, title) => {
    // Filter donations by selected location if not 'all'
    const filteredDonations = selectedLocation === 'all' 
      ? donations[type] 
      : donations[type].filter(donation => donation.location === selectedLocation);

    return (
      <div className="donations-container">
        <h3 className="section-header">{title}</h3>
        {filteredDonations.length === 0 ? (
          <div className="empty-state">
            <i className="empty-icon">📦</i>
            <p>
              {selectedLocation === 'all' 
                ? `No ${title.toLowerCase()} available at this time.` 
                : `No ${title.toLowerCase()} available for ${selectedLocation}.`}
            </p>
          </div>
        ) : (
          <div className="donations-list">
            {filteredDonations.map((donation) => (
              <div key={donation.id} className="donation-card">
                <div className="card-header">
                  <h4 title={donation.medicineName || donation.equipmentName}>
                    {donation.medicineName || donation.equipmentName}
                  </h4>
                  <span className={getStatusBadgeClass(donation.status)}>
                    {donation.status}
                  </span>
                </div>
                
                <div className="donation-details">
                  <div>
                    <div className="detail-row">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{donation.quantity}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Donation Time:</span>
                      <span className="detail-value">{donation.donationTime}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Hospital:</span>
                      <span className="detail-value">{donation.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Donation Date:</span>
                      <span className="detail-value">
                        {formatDate(donation.createdAt || donation.date)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Donor:</span>
                      <span className="detail-value">{donation.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-actions">
                  <select
                    value={donation.status}
                    onChange={(e) => handleStatusChange(type, donation.id, e.target.value)}
                    disabled={loading}
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Dashboard</h2>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
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
        {renderDonations('equipment', 'Equipment Donations')}
      </div>
    </div>
  );
}

export default Admin;