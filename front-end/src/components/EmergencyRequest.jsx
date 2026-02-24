import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import './disaster.css';

function EmergencyRequest() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [disasterMode, setDisasterMode] = useState({
    active: false,
    location: "",
    description: ""
  });
  
  const [formData, setFormData] = useState({
    requestType: 'food',
    itemName: '',
    quantity: '',
    urgency: 'medium',
    description: '',
    location: '',
    phoneNumber: '',
    numberOfPeople: '1',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Check if disaster mode is active
  useEffect(() => {
    const checkDisasterMode = async () => {
      try {
        const disasterRef = database.ref('disasterMode');
        const snapshot = await disasterRef.once('value');
        const data = snapshot.val();
        
        if (data && data.active) {
          setDisasterMode(data);
        } else {
          // Redirect if disaster mode is not active
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking disaster mode:", error);
      }
    };
    
    checkDisasterMode();
  }, [navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!formData.itemName || !formData.quantity || !formData.location || !formData.phoneNumber) {
        throw new Error("Please fill all required fields");
      }
      
      // Create request record
      const requestRef = database.ref('emergencyRequests').push();
      
      await requestRef.set({
        requestType: formData.requestType,
        itemName: formData.itemName,
        quantity: formData.quantity,
        urgency: formData.urgency,
        description: formData.description,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        numberOfPeople: formData.numberOfPeople,
        status: 'pending',
        requesterId: currentUser ? currentUser.uid : 'anonymous',
        requesterEmail: currentUser ? currentUser.email : 'anonymous',
        createdAt: new Date().toISOString(),
        disasterId: disasterMode.activatedAt // Link to current disaster
      });
      
      // Reset form and show success message
      setFormData({
        requestType: 'food',
        itemName: '',
        quantity: '',
        urgency: 'medium',
        description: '',
        location: '',
        phoneNumber: '',
        numberOfPeople: '1',
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting emergency request:", error);
      setError(error.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!disasterMode.active) {
    return <div className="loading-container">Checking emergency status...</div>;
  }
  
  return (
    <div className="emergency-container">
      <div className="emergency-banner">
        <div className="emergency-icon">⚠️</div>
        <div className="emergency-details">
          <h2>Emergency Disaster Response Active</h2>
          <p>{disasterMode.description}</p>
          <p><strong>Location:</strong> {disasterMode.location}</p>
        </div>
      </div>
      
      <div className="emergency-form-container">
        <h3>Request Emergency Supplies</h3>
        <p className="form-subtitle">Request essential supplies needed during this emergency</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Your emergency request has been submitted. When matched with a donation, both you and the donor will be notified to coordinate pickup/delivery.</div>}
        
        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label>Request Type*</label>
            <select 
              name="requestType" 
              value={formData.requestType}
              onChange={handleChange}
              required
            >
              <option value="food">Food</option>
              <option value="water">Drinking Water</option>
              <option value="medicine">Medicines</option>
              <option value="first_aid">First Aid Kits</option>
              <option value="clothing">Clothing</option>
              <option value="shelter">Shelter Items</option>
              <option value="hygiene">Hygiene Products</option>
              <option value="other">Other Essential Items</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Item Name*</label>
            <input 
              type="text" 
              name="itemName" 
              value={formData.itemName}
              onChange={handleChange}
              placeholder="E.g., Bottled Water, Ready-to-eat meals"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Quantity Needed*</label>
            <input 
              type="text" 
              name="quantity" 
              value={formData.quantity}
              onChange={handleChange}
              placeholder="E.g., 20 bottles, 5 boxes"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Urgency*</label>
            <select 
              name="urgency" 
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="low">Low - Needed within a few days</option>
              <option value="medium">Medium - Needed within 24 hours</option>
              <option value="high">High - Needed immediately</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>For How Many People?*</label>
            <input 
              type="number" 
              name="numberOfPeople" 
              value={formData.numberOfPeople}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide more details about your request"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Your Location*</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location}
              onChange={handleChange}
              placeholder="Where are you located?"
              required
            />
            <small className="field-note">You may need to arrange pickup from the donor's location</small>
          </div>
          
          <div className="form-group">
            <label>Contact Number*</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone number for coordination"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button request-button" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Emergency Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmergencyRequest;