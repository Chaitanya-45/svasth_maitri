import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isChatboxOpen, setChatboxOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you today?", type: "incoming" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatbox = () => {
    setChatboxOpen(!isChatboxOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: userInput, type: "outgoing" }]);
    
    // Clear input
    setUserInput("");
    
    // Show bot is typing
    setIsTyping(true);
    
    try {
      // Simulate API call - replace with your actual API call
      setTimeout(() => {
        // Add response message
        setMessages(prev => [...prev, { 
          text: "Thank you for your message. How else can I assist you?", 
          type: "incoming" 
        }]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: "Oops! Something went wrong. Please try again.", 
        type: "incoming" 
      }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot">
      {isChatboxOpen && (
        <div className="chatbox">
          <header>
            <h2>Chatbot</h2>
            <span className="close-btn" onClick={toggleChatbox}></span>
          </header>
          
          <ul className="chat-messages">
            {messages.map((msg, index) => (
              <li key={index} className={`chat ${msg.type}`}>
                {msg.text}
                {msg.type === "outgoing" && (
                  <div className="message-actions">
                    <button className="action-btn wrong">Mark as wrong</button>
                    <button className="action-btn delete">Delete</button>
                  </div>
                )}
              </li>
            ))}
            
            {isTyping && (
              <li className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </li>
            )}
            <div ref={messagesEndRef} />
          </ul>
          
          <form className="chat-input" onSubmit={handleSubmit}>
            <textarea 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter a message..."
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button type="submit" className="send-btn"></button>
          </form>
        </div>
      )}
      
      <button className="chatbot-toggler" onClick={toggleChatbox}>
        {isChatboxOpen ? "×" : "?"}
      </button>
    </div>
  );
};

export default Chatbot;