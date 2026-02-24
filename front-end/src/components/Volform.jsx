import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MedForm.css';

function Volform() {
  const [formData, setFormData] = useState({
    name: '',
    medicalRegistrationNumber: '',
    medicalId: null,
    contact: '',
    location: '', 
    acceptPhone: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      medicalId: event.target.files[0]
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formDataObject = new FormData();
    formDataObject.append('name', formData.name);
    formDataObject.append('medicalRegistrationNumber', formData.medicalRegistrationNumber);
    formDataObject.append('medicalId', formData.medicalId);
    formDataObject.append('contact', formData.contact);
    formDataObject.append('location', formData.location); 
    formDataObject.append('acceptPhone', formData.acceptPhone);
  
    try {
      const response = await fetch('http://localhost:5000/submit-volunteer', {
        method: 'POST',
        body: formDataObject
      });

      const result = await response.json();
      if (response.ok) {
        navigate('/volunteer-emergency'); 
      } else {
        setErrorMessage(result.error || 'Failed to submit volunteer.');
      }
    } catch (error) {
      setErrorMessage('Error submitting volunteer.');
      console.error('Error submitting volunteer:', error);
    }
  };

  return (
    <section className="header">
      <div className="wrapper">
        <div className="card">
          <div className="title">
            <h2>Volunteer Registration Form</h2>
          </div>
          <div className="form-content">
            <form onSubmit={handleSubmit} id="volunteerForm">
              <div className="input_wrap">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="medicalRegistrationNumber">Medical Registration Number</label>
                <input
                  type="text"
                  name="medicalRegistrationNumber"
                  id="medicalRegistrationNumber"
                  placeholder="Enter your medical registration number"
                  value={formData.medicalRegistrationNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="medicalId">Medical ID (PDF)</label>
                <input
                  type="file"
                  name="medicalId"
                  id="medicalId"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="contact">Contact</label>
                <input
                  type="tel"
                  name="contact"
                  id="contact"
                  placeholder="Enter your contact number"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input_wrap">
                <label>
                  <input
                    type="checkbox"
                    name="acceptPhone"
                    checked={formData.acceptPhone}
                    onChange={handleInputChange}
                    required
                  />
                  I accept to provide my phone number
                </label>
              </div>
              <input type="submit" className="button" value="Submit" />
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Volform;
