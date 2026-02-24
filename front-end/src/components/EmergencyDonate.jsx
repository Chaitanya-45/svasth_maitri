import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import './disaster.css';

function EmergencyDonate() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [disasterMode, setDisasterMode] = useState({
    active: false,
    location: "",
    description: ""
  });
  
  const [formData, setFormData] = useState({
    donationType: 'food',
    itemName: '',
    quantity: '',
    description: '',
    location: '',
    phoneNumber: '',
    availableUntil: '',
    image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [skipImageUpload, setSkipImageUpload] = useState(false);
  
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
  
  const handleFileChange = (e) => {
    setImageError('');
    if (e.target.files[0]) {
      // Check file size (limit to 1MB)
      if (e.target.files[0].size > 1024 * 1024) {
        setImageError('Image size must be less than 1MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };
  
  // Function to remove selected image
  const removeSelectedImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImageError('');
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };
  
  const uploadImage = async (file) => {
    try {
      setUploadStatus('Uploading image...');
      
      // Check if file is actually provided
      if (!file) {
        throw new Error("No image file selected");
      }
      
      // Instead of using an external API, let's use a data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadStatus('Image processed successfully!');
          resolve(reader.result); // This is the base64 data URL
        };
        reader.onerror = () => {
          reject(new Error('Failed to process image'));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadStatus('');
      setImageError(`Failed to process image: ${error.message}`);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImageError('');
    
    try {
      // Basic validation
      if (!formData.itemName || !formData.quantity || !formData.location || !formData.phoneNumber) {
        throw new Error("Please fill all required fields");
      }
      
      let imageUrl = null;
      
      // Only try to upload if there's an image and user hasn't chosen to skip upload
      if (formData.image && !skipImageUpload) {
        try {
          imageUrl = await uploadImage(formData.image);
        } catch (uploadError) {
          // If upload fails but user wants to continue anyway
          if (window.confirm("Image processing failed. Would you like to submit the form without the image?")) {
            console.log("Proceeding without image upload");
          } else {
            // User wants to fix the image issue first
            setLoading(false);
            return;
          }
        }
      }
      
      // Create donation record
      const donationRef = database.ref('emergencyDonations').push();
      
      await donationRef.set({
        donationType: formData.donationType,
        itemName: formData.itemName,
        quantity: formData.quantity,
        description: formData.description,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        availableUntil: formData.availableUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        imageUrl: imageUrl, // This might be null if upload failed or was skipped
        status: 'available',
        donorId: currentUser ? currentUser.uid : 'anonymous',
        donorEmail: currentUser ? currentUser.email : 'anonymous',
        createdAt: new Date().toISOString(),
        disasterId: disasterMode.activatedAt // Link to current disaster
      });
      
      // Reset form and show success message
      setFormData({
        donationType: 'food',
        itemName: '',
        quantity: '',
        description: '',
        location: '',
        phoneNumber: '',
        availableUntil: '',
        image: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      setSkipImageUpload(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error submitting emergency donation:", error);
      setError(error.message || "Failed to submit donation. Please try again.");
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };
  
  // Function to submit without image
  const submitWithoutImage = (e) => {
    e.preventDefault();
    setSkipImageUpload(true);
    removeSelectedImage();
    handleSubmit(e);
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
        <h3>Donate Emergency Supplies</h3>
        <p className="form-subtitle">Your donations can save lives during this emergency</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Thank you! Your emergency donation has been registered. If matched with a request, both you and the recipient will be notified.</div>}
        
        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label>Donation Type*</label>
            <select 
              name="donationType" 
              value={formData.donationType}
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
            <label>Quantity*</label>
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
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide details about the items"
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
              placeholder="Where can the items be picked up from?"
              required
            />
            <small className="field-note">Recipients will need to arrange pickup from this location</small>
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
          
          <div className="form-group">
            <label>Available Until</label>
            <input 
              type="date" 
              name="availableUntil" 
              value={formData.availableUntil}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label>Upload Image (Optional)</label>
            <div className="file-input-container">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <small>Upload an image of the items you're donating (max size: 1MB)</small>
              {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
              {imageError && (
                <div className="image-error">
                  <p>{imageError}</p>
                  {formData.image && (
                    <button type="button" className="remove-image-btn" onClick={removeSelectedImage}>
                      Remove Selected Image
                    </button>
                  )}
                </div>
              )}
              {formData.image && (
                <div className="selected-image-name">
                  Selected: {formData.image.name}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-buttons">
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Emergency Donation'}
            </button>
            
            {formData.image && (
              <button 
                type="button" 
                className="skip-image-button" 
                onClick={submitWithoutImage}
                disabled={loading}
              >
                Submit Without Image
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmergencyDonate;