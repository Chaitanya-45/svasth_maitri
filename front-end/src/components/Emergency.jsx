import React, { useEffect, useState } from 'react';
import { database } from '../firebase/firebase';
import './Emergency.css'; 

function Emergency() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const volunteersRef = database.ref('volunteers');
        const snapshot = await volunteersRef.once('value');
        const data = snapshot.val();

        if (data) {
          const volunteerArray = Object.entries(data).map(([id, volunteer]) => ({ ...volunteer, id }));
          setVolunteers(volunteerArray);
          setFilteredVolunteers(volunteerArray); // Initialize filteredVolunteers
        } else {
          setVolunteers([]);
          setFilteredVolunteers([]);
        }
      } catch (error) {
        setError('Error fetching volunteers.');
        console.error('Error fetching volunteers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  useEffect(() => {
    // Filter volunteers based on the search query
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = volunteers.filter(volunteer =>
      volunteer.location.toLowerCase().includes(lowercasedQuery) ||
      volunteer.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredVolunteers(filtered);
  }, [searchQuery, volunteers]);

  const handleUpdateButtonClick = async () => {
    if (!medicalRegistrationNumber.trim()) {
      alert('Please enter a registration number.');
      return;
    }

    try {
      const volunteersRef = database.ref('volunteers');
      const snapshot = await volunteersRef.once('value');
      const data = snapshot.val();

      if (data) {
        const volunteerEntry = Object.entries(data).find(([id, volunteer]) => volunteer.medicalRegistrationNumber === medicalRegistrationNumber);

        if (volunteerEntry) {
          const [id, volunteerData] = volunteerEntry;
          
          if (newLocation.trim()) {
            await volunteersRef.child(id).update({ location: newLocation.trim() });
            alert('Location updated successfully!');
            
            // Refresh volunteers list
            const updatedSnapshot = await volunteersRef.once('value');
            const updatedData = updatedSnapshot.val();
            const updatedVolunteerArray = updatedData ? Object.entries(updatedData).map(([id, volunteer]) => ({ ...volunteer, id })) : [];
            setVolunteers(updatedVolunteerArray);
            setFilteredVolunteers(updatedVolunteerArray);
          } else {
            alert('Please enter a new location.');
          }
        } else {
          alert('Registration number not found.');
        }
      }
    } catch (error) {
      alert('Error updating location.');
      console.error('Error updating location:', error);
    } finally {
      setUpdateMode(false);
      setMedicalRegistrationNumber('');
      setNewLocation('');
    }
  };

  return (
    <div className="emergency-container">
      <div className="emergency-header">
        <h1>First Aid Volunteers</h1>
        <p>Find nearby volunteers for emergency medical assistance</p>
      </div>

      <div className="control-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or location..."
            className="search-input"
          />
        </div>
        
        <button 
          className="update-button"
          onClick={() => setUpdateMode(!updateMode)}
        >
          {updateMode ? 'Cancel Update' : 'Update Location'}
        </button>
      </div>

      {updateMode && (
        <div className="update-panel">
          <div className="input-group">
            <label htmlFor="regNumber">Registration Number</label>
            <input
              id="regNumber"
              type="text"
              value={medicalRegistrationNumber}
              onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
              placeholder="Enter medical registration number"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="newLocation">New Location</label>
            <input
              id="newLocation"
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter your current location"
            />
          </div>
          
          <div className="button-group">
            <button 
              className="submit-button"
              onClick={handleUpdateButtonClick}
            >
              Update
            </button>
            <button 
              className="cancel-button"
              onClick={() => setUpdateMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading volunteers...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="table-container">
          {filteredVolunteers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👨‍⚕️</div>
              <p>No volunteers found matching your search criteria</p>
              {searchQuery && (
                <button className="reset-search" onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-info">
                <span className="volunteer-count">
                  Showing {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
                </span>
              </div>
              <table className="volunteers-table">
                <thead>
                  <tr>
                    <th width="8%">S.No</th>
                    <th width="32%">Name</th>
                    <th width="25%">Contact</th>
                    <th width="35%">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.map((volunteer, index) => (
                    <tr key={volunteer.id}>
                      <td>{index + 1}</td>
                      <td>{volunteer.name}</td>
                      <td>
                        <a href={`tel:${volunteer.contact}`} className="contact-link">
                          {volunteer.contact}
                        </a>
                      </td>
                      <td>{volunteer.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Emergency;