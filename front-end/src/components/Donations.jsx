import React, { useEffect, useState } from "react";
import { database } from "../firebase/firebase";
import "./Donations.css";
import Questionnaire from "./Questionnaire";
import Modal from "react-modal";
import medicine from "../assets/medicine.jpg";
import equipment from "../assets/equipment.jpg";
import blood from "../assets/blood.jpg";

Modal.setAppElement("#root");

function Donations() {
  const [medicineDonations, setMedicineDonations] = useState([]);
  const [equipmentDonations, setEquipmentDonations] = useState([]);
  const [bloodDonations, setBloodDonations] = useState([]);

  const [medicineIndex, setMedicineIndex] = useState({});
  const [equipmentIndex, setEquipmentIndex] = useState({});
  const [bloodIndex, setBloodIndex] = useState({});

  const [hospitalData, setHospitalData] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactCardId, setContactCardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [restrictedMedicineEmail, setRestrictedMedicineEmail] = useState(null);
  const [restrictedMedicineName, setRestrictedMedicineName] = useState("");

  const restrictedMedicines = [
    "Adderall", "Ritalin", "Ambien", "Sonata", "Warfarin", 
    "Heparin", "Risperdal", "Seroquel", "Abilify", "Lunesta", "Concerta",
  ];

  const sampleHospitalData = [
    {
      name: "Osmania Hospital",
      location: "Hyderabad",
      contact: "040-24630111",
    },
    {
      name: "Gandhi Hospital",
      location: "Secunderabad",
      contact: "040-27806650",
    },
    {
      name: "King Koti Hospital",
      location: "Hyderabad",
      contact: "040-24752010",
    },
    {
      name: "Niloufer Hospital",
      location: "Hyderabad",
      contact: "040-27514877",
    },
  ];

  useEffect(() => {
    setHospitalData(sampleHospitalData);
  }, []);

  const tokenize = (text) => {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
  };

  const buildInvertedIndex = (donations, fields) => {
    const index = {};
    donations.forEach((donation, idx) => {
      fields.forEach((field) => {
        if (donation[field]) {
          const tokens = tokenize(donation[field]);
          tokens.forEach((token) => {
            if (!index[token]) {
              index[token] = new Set();
            }
            index[token].add(idx);
          });
        }
      });
    });
    return index;
  };

  useEffect(() => {
    const fetchMedicineDonations = async () => {
      try {
        const medicineDonationsRef = database.ref("medicineDonations");
        const snapshot = await medicineDonationsRef.once("value");
        const data = snapshot.val();

        if (data) {
          const donationArray = Object.values(data).filter(
            (donation) => donation.status === "accepted"
          );
          setMedicineDonations(donationArray);
          console.log("Medicine Donations (Accepted):", donationArray);

          const index = buildInvertedIndex(donationArray, [
            "medicineName",
            "location",
          ]);
          setMedicineIndex(index);
          console.log("Medicine Inverted Index:", index);
        }
      } catch (error) {
        console.error("Error fetching medicine donations:", error);
      }
    };

    const fetchEquipmentDonations = async () => {
      try {
        const equipmentDonationsRef = database.ref("equipmentDonations");
        const snapshot = await equipmentDonationsRef.once("value");
        const data = snapshot.val();

        if (data) {
          const donationArray = Object.values(data).filter(
            (donation) => donation.status === "accepted"
          );
          setEquipmentDonations(donationArray);

          const index = buildInvertedIndex(donationArray, [
            "equipmentName",
            "location",
          ]);
          setEquipmentIndex(index);
        }
      } catch (error) {
        console.error("Error fetching equipment donations:", error);
      }
    };

    const fetchBloodDonations = async () => {
      try {
        const bloodDonationsRef = database.ref("bloodDonations");
        const snapshot = await bloodDonationsRef.once("value");
        const data = snapshot.val();

        if (data) {
          const donationArray = Object.values(data);
          setBloodDonations(donationArray);
          console.log("Blood Donations:", donationArray); 
          const index = buildInvertedIndex(donationArray, [
            "bloodType",
            "location",
          ]);
          setBloodIndex(index);
          console.log("Blood Inverted Index:", index); 
        }
      } catch (error) {
        console.error("Error fetching blood donations:", error);
      }
    };

    fetchMedicineDonations();
    fetchEquipmentDonations();
    fetchBloodDonations();
  }, []);

  const filterDonations = (donations, query, fields) => {
    if (!query.trim()) return donations;

    return donations.filter((donation) =>
      fields.some((field) =>
        donation[field]?.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const filteredMedicineDonations = filterDonations(
    medicineDonations,
    searchQuery,
    ["medicineName", "location"]
  );

  const filteredEquipmentDonations = filterDonations(
    equipmentDonations,
    searchQuery,
    ["equipmentName", "location"]
  );

  const filteredBloodDonations = filterDonations(
    bloodDonations,
    searchQuery,
    ["bloodType", "location"]
  );
  
  const handleContactHospital = (donationLocation, cardId) => {
    const matchedHospital = hospitalData.find(
      (hospital) =>
        hospital.location.toLowerCase() === donationLocation.toLowerCase()
    );
    if (matchedHospital) {
      setSelectedContact(matchedHospital.contact);
      setContactCardId(cardId);
    } else {
      alert("No hospital found for this location");
      setSelectedContact(null);
    }
  };

  const handleCloseContact = () => {
    setSelectedContact(null);
    setContactCardId(null);
  };

  return (
    <div className="donations-page">
      <div className="search-container">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, type..."
            className="search-input"
          />
        </div>
      </div>

      {/* Medicine Donations Section */}
      <section className="donation-section">
        <div className="section-header">
          <h2>Medicine Donations</h2>
          <div className="section-divider"></div>
        </div>
        
        {filteredMedicineDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <p>No medicine donations available{searchQuery ? " matching your search" : ""}.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredMedicineDonations.map((donation, index) => {
              const cardId = `medicine-${index}`;
              return (
                <div key={cardId} className="donation-card">
                  <div className="card-image-container">
                    <img src={medicine} alt={donation.medicineName} className="card-image" />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{donation.medicineName}</h3>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">📦</span>
                        <span>Quantity: {donation.quantity}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>Location: {donation.location}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span>Expires: {donation.expiryDate}</span>
                      </div>
                    </div>
                   
                    
                    {selectedContact && contactCardId === cardId && (
                      <div className="contact-popup">
                        <div className="contact-header">
                          <h4>Hospital Contact</h4>
                          <button className="close-button" onClick={handleCloseContact}>
                            ✖
                          </button>
                        </div>
                        <div className="contact-body">
                          <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <span>{selectedContact}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Equipment Donations Section */}
      <section className="donation-section">
        <div className="section-header">
          <h2>Equipment Donations</h2>
          <div className="section-divider"></div>
        </div>
        
        {filteredEquipmentDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <p>No equipment donations available{searchQuery ? " matching your search" : ""}.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredEquipmentDonations.map((donation, index) => {
              const cardId = `equipment-${index}`;
              return (
                <div key={cardId} className="donation-card">
                  <div className="card-image-container">
                    <img src={equipment} alt={donation.equipmentName} className="card-image" />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{donation.equipmentName}</h3>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">📦</span>
                        <span>Quantity: {donation.quantity}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>Location: {donation.location}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="condition-badge">{donation.condition}</span>
                      </div>
                    </div>
                    {selectedContact && contactCardId === cardId && (
                      <div className="contact-popup">
                        <div className="contact-header">
                          <h4>Hospital Contact</h4>
                          <button className="close-button" onClick={handleCloseContact}>
                            ✖
                          </button>
                        </div>
                        <div className="contact-body">
                          <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <span>{selectedContact}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Blood Donations Section */}
      <section className="donation-section">
        <div className="section-header">
          <h2>Blood Donations</h2>
          <div className="section-divider"></div>
        </div>
        
        {filteredBloodDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩸</div>
            <p>No blood donations available{searchQuery ? " matching your search" : ""}.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filteredBloodDonations.map((donation, index) => {
              const cardId = `blood-${index}`;
              return (
                <div key={cardId} className="donation-card">
                  <div className="card-image-container">
                    <img src={blood} alt={donation.bloodType} className="card-image" />
                    <div className="blood-type-badge">{donation.bloodType}</div>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">Blood Donation</h3>
                    
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">❤️</span>
                        <span>Donor's Age: {donation.age}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>Location: {donation.location}</span>
                      </div>
                    </div>
                    
                    {selectedContact && contactCardId === cardId && (
                      <div className="contact-popup">
                        <div className="contact-header">
                          <h4>Hospital Contact</h4>
                          <button className="close-button" onClick={handleCloseContact}>
                            ✖
                          </button>
                        </div>
                        <div className="contact-body">
                          <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <span>{selectedContact}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Donations;