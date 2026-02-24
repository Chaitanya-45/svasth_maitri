import React from "react";
import "./Articlespage.css";
import { Link } from "react-router-dom";

function Article() {
   const articleData = [
      {
         id: 1,
         title: "Impact of Medicines Donation",
         image: "../imgs/medicinedonation.jpg",
         category: "Healthcare",
         readTime: "5 min read",
         path: "/ImpMedicineDon",
         description: "Discover how your medicine donations can transform lives and support healthcare systems worldwide."
      },
      {
         id: 2,
         title: "Donating Medical Equipment",
         image: "../imgs/medicalequipment.jpg",
         category: "Resources",
         readTime: "7 min read",
         path: "/MedicalEquipmentDonation",
         description: "Learn about the impact of donating medical equipment and best practices for effective contributions."
      },
      {
         id: 3,
         title: "Maximizing the Impact of Blood Donation",
         image: "../imgs/blood donation.jpg",
         category: "Life-Saving",
         readTime: "6 min read",
         path: "/BloodDonationImpact",
         description: "Understanding how blood donations save lives and ways to increase the effectiveness of your donation."
      },
      {
         id: 4,
         title: "The Role of Community Support",
         image: "../imgs/community.jpg",
         category: "Community",
         readTime: "4 min read",
         path: "/CommunitySupport",
         description: "Explore how communities can mobilize and create lasting impact through coordinated support systems."
      }
   ];

   return (
      <div className="articles-page">
         <section className="articles-header">
            <div className="header-overlay">
               <div className="header-content">
                  <h1>Health Resource Articles</h1>
                  <p>Explore the latest insights, research findings, and expert tips in our curated collection of health resource articles</p>
               </div>
            </div>
         </section>

         <div className="articles-container">
            
            <div className="articles-grid">
               {articleData.map((article) => (
                  <Link to={article.path} className="article-card" key={article.id}>
                     <div className="article-image-container">
                        <img src={article.image} alt={article.title} />
                        <span className="article-category">{article.category}</span>
                     </div>
                     <div className="article-content">
                        <h3>{article.title}</h3>
                        <p className="article-description">{article.description}</p>
                        <div className="article-meta">
                           <span className="read-time">{article.readTime}</span>
                           <span className="read-more">Read more →</span>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>

            <div className="articles-cta">
               <h3>Want to contribute?</h3>
               <p>Share your own experiences or insights to help others in their healthcare journey</p>
               <Link to="/community" className="cta-button">Join Our Community</Link>
            </div>
         </div>
      </div>
   );
}

export default Article;