import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Donate.css';
import meddon from "../assets/meddon.avif";
import blooddon from "../assets/blooddon.webp";

function Donate() {
  const [activeTab, setActiveTab] = useState('biomedical');
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  const [mapError, setMapError] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const mapFrameRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    // Only run geolocation code when e-waste tab is active
    if (activeTab === 'ewaste' && navigator.geolocation) {
      setMapError(false); // Reset error state
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ latitude, longitude });
          setLocationStatus('Showing results near you.');
          
          // Set iframe src with proper URL encoding
          if (mapFrameRef.current) {
            try {
              // For demo use a static embed code
              const fallbackUrl = `https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d237088.4048125464!2d78.4449077380472!3d17.398368294740408!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1se-waste%20recycling%20centers%20near%20me!5e0!3m2!1sen!2sin!4v1743142472221!5m2!1sen!2sin`;
              
              mapFrameRef.current.src = fallbackUrl;
            } catch (error) {
              console.error("Map loading error:", error);
              setMapError(true);
            }
          }
        },
        (error) => {
          const errorMsg = {
            1: "Location access denied. Showing general results.",
            2: "Location unavailable. Try refreshing the page.",
            3: "Location request timed out. Please try again."
          };
          setLocationStatus(errorMsg[error.code] || "An unknown error occurred.");
          
          // Set fallback static map on error
          if (mapFrameRef.current) {
            mapFrameRef.current.src = "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15069.304237556921!2d72.8239!3d19.1374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1se-waste%20disposal%20centers!5e0!3m2!1sen!2sin!4v1648202876542!5m2!1sen!2sin";
          }
        }
      );
    }
  }, [activeTab]);

  const renderBiomedicalContent = () => (
    <>
      <div className="donation-section">
        <div className="donation-card">
          <div className="donation-card-content">
            <div className="donation-card-text">
              <h2 className="donation-title">First Aid Volunteer</h2>
              <p className="donation-description">
                Be a hero in emergencies by joining our network of First Aid volunteers. When someone needs urgent assistance, you can make a critical difference.
              </p>
              <div className="donation-details">
                <h3>Join Us:</h3>
                <ul>
                  <li><span>Register:</span> Sign up to become a volunteer and be part of our network.</li>
                  <li><span>Be Prepared:</span> Ensure you're ready to respond and provide first aid effectively.</li>
                  <li><span>Make a Difference:</span> Help save lives and support your community in emergencies.</li>
                </ul>
              </div>
              <Link to="/Volform" className="donation-button">Join as a Volunteer</Link>
            </div>
            <div className="donation-card-image">
              <img src="../imgs/vol.avif" alt="First Aid Volunteer" />
            </div>
          </div>
        </div>

        <div className="donation-card">
          <div className="donation-card-content">
            <div className="donation-card-text">
              <h2 className="donation-title">Medicine Donation</h2>
              <p className="donation-description">
                Help make a difference in someone's life by donating unused medicines.
              </p>
              <div className="donation-details">
                <h3>What can you donate?</h3>
                <ul>
                  <li>Pain relievers (e.g., ibuprofen, acetaminophen)</li>
                  <li>Antibiotics</li>
                  <li>Antihistamines</li>
                  <li>Vitamins and supplements</li>
                  <li>Prescription medications</li>
                </ul>
                <h3>Conditions for Donation:</h3>
                <ul>
                  <li><span>Unexpired:</span> Ensure that the medicines have not expired.</li>
                  <li><span>Quantity:</span> We encourage donations of full unopened packages.</li>
                  <li><span>Prescription Medications:</span> Should be donated with original label intact.</li>
                </ul>
              </div>
              <Link to="/MedForm" className="donation-button">Donate Now</Link>
            </div>
            <div className="donation-card-image">
              <img src={meddon} alt="Medicine Donation" />
            </div>
          </div>
        </div>
        
        <div className="donation-card">
          <div className="donation-card-content">
            <div className="donation-card-text">
              <h2 className="donation-title">Medical Equipment Donation</h2>
              <p className="donation-description">
                Support healthcare facilities by donating medical equipment such as wheelchairs, nebulizers, and more.
              </p>
              <div className="donation-details">
                <h3>What can you donate?</h3>
                <ul>
                  <li>Wheelchairs</li>
                  <li>Crutches</li>
                  <li>Nebulizers</li>
                  <li>Hospital beds</li>
                  <li>Medical monitors</li>
                  <li>Walking aids (e.g., canes, walkers)</li>
                </ul>
                <h3>Conditions for Donation:</h3>
                <ul>
                  <li><span>Functional:</span> Equipment should be in working condition.</li>
                  <li><span>Clean:</span> Thoroughly sanitized before donation.</li>
                  <li><span>Complete:</span> Include all necessary accessories and components.</li>
                </ul>
              </div>
              <Link to="/MedEquipment" className="donation-button">Donate Now</Link>
            </div>
            <div className="donation-card-image">
              <img src="../imgs/medequip.jpg" alt="Medical Equipment Donation" />
            </div>
          </div>
        </div>
        
        <div className="donation-card">
          <div className="donation-card-content">
            <div className="donation-card-text">
              <h2 className="donation-title">Blood Donation</h2>
              <p className="donation-description">
                Make a life-saving difference by donating blood. Your donation can provide critical support to patients in need.
              </p>
              <div className="donation-details">
                <h3>Conditions for Donation:</h3>
                <ul>
                  <li><span>Health Status:</span> Donors should be in good health and free from illnesses.</li>
                  <li><span>Age:</span> Donors must typically be between 18 and 65 years old.</li>
                  <li><span>Identification:</span> Valid ID is required for donation.</li>
                </ul>
              </div>
              <Link to="/BloodDonation" className="donation-button">Donate Now</Link>
            </div>
            <div className="donation-card-image">
              <img src={blooddon} alt="Blood Donation" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderEwasteContent = () => (
    <div className="ewaste-section">
      <div className="donation-card">
        <div className="donation-card-content single-column">
          <h2 className="donation-title">E-Waste Recycling</h2>
          <p className="donation-description">
            Proper disposal of electronic waste is crucial for protecting our environment. E-waste contains toxic materials that can harm ecosystems if not handled correctly, as well as valuable materials that can be recovered and reused.
          </p>
          <div className="donation-details">
            <h3>What can you recycle?</h3>
            <div className="ewaste-items">
              <div className="ewaste-item">
                <span className="ewaste-icon">💻</span>
                <span>Computers & Laptops</span>
              </div>
              <div className="ewaste-item">
                <span className="ewaste-icon">📱</span>
                <span>Smartphones & Tablets</span>
              </div>
              <div className="ewaste-item">
                <span className="ewaste-icon">🖨️</span>
                <span>Printers & Scanners</span>
              </div>
              <div className="ewaste-item">
                <span className="ewaste-icon">📺</span>
                <span>TVs & Monitors</span>
              </div>
              <div className="ewaste-item">
                <span className="ewaste-icon">🔋</span>
                <span>Batteries & Chargers</span>
              </div>
              <div className="ewaste-item">
                <span className="ewaste-icon">🏠</span>
                <span>Home Appliances</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="donation-card">
        <div className="donation-card-content single-column">
          <h2 className="donation-title">Find E-Waste Disposal Centers Near You</h2>
          
          <div className="location-status-container">
            <div className="location-icon">📍</div>
            <div className="location-text">
              <h3>Searching for Nearby Facilities</h3>
              <p>{locationStatus}</p>
            </div>
          </div>
          
          {mapError ? (
            <div className="map-error">
              <p>Unable to load the map. Please try the following options:</p>
              <div className="map-alternatives">
                <a 
                  href="https://www.google.com/maps/search/e-waste+recycling+centers+in+/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-button primary"
                >
                  Open Google Maps
                </a>
                
                <button 
                  onClick={() => setMapError(false)}
                  className="map-button secondary"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="map-container">
              <iframe 
                ref={mapFrameRef}
                className="e-waste-map"
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d15069.304237556921!2d72.8239!3d19.1374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1se-waste%20disposal%20centers!5e0!3m2!1sen!2sin!4v1648202876542!5m2!1sen!2sin" 
                allowFullScreen
                loading="lazy"
                title="E-waste disposal centers map"
                onError={() => setMapError(true)}
              ></iframe>
            </div>
          )}
          
          {userCoords && (
            <div className="direct-search">
              <p>Can't find what you're looking for?</p>
              <a 
                href={`https://www.google.com/maps/search/e-waste+recycling+centers/@${userCoords.latitude},${userCoords.longitude},13z`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button outline"
              >
                Open in Google Maps
              </a>
            </div>
          )}
          
          <div className="tips-container">
            <h3>Tips for Responsible E-Waste Recycling</h3>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">💾</span>
                <span>Back up your data before recycling devices</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🔋</span>
                <span>Remove batteries when possible (they often need separate recycling)</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🏭</span>
                <span>Check if manufacturers offer take-back programs</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">♻️</span>
                <span>Consider donating working electronics that are still usable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="donate-page">
      <header className="donate-header">
        <div className="header-content">
          <h1>Make a Difference Through Donation</h1>
          <p>Join us in fostering hope and creating positive change in our community</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'biomedical' ? 'active' : ''}`}
            onClick={() => handleTabChange('biomedical')}
          >
            Biomedical Waste
          </button>
          <button 
            className={`tab ${activeTab === 'ewaste' ? 'active' : ''}`}
            onClick={() => handleTabChange('ewaste')}
          >
            E-Waste
          </button>
        </div>
      </div>

      <section className="donate-content">
        {activeTab === 'biomedical' ? renderBiomedicalContent() : renderEwasteContent()}
      </section>
    </div>
  );
}

export default Donate;