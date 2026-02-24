import React from 'react';
import { Link } from 'react-router-dom';
import './Donate.css';
import meddon from "../assets/meddon.avif";
import blooddon from "../assets/blooddon.webp";

function Donate() {
  return (
    <div className="donate-page">
      <header className="donate-header">
        <div className="header-content">
          <h1>Make a Difference Through Donation</h1>
          <p>Join us in fostering hope and creating positive change in our community</p>
        </div>
      </header>

      <section className="donate-content">
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
      </section>
    </div>
  );
}

export default Donate;