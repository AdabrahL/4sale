import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/ai-assistant.css";

export default function AIResourceAssistant({ isOpen, onClose, resourceType, resourceTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInitialResponse, setHasInitialResponse] = useState(false);

  // Get initial prompt based on resource type
  const getInitialPrompt = () => {
    const prompts = {
      "market-news": "What are the latest real estate market trends I should know about?",
      "books": "Can you recommend some essential real estate books for beginners?",
      "analytics": "How can I analyze real estate market data effectively?",
      "consultation": "What questions should I ask a real estate agent during consultation?",
    };
    return prompts[resourceType] || "How can I help you with real estate?";
  };

  // Get AI response based on resource type
  const getAIResponse = async (userMessage) => {
    setLoading(true);

    // Simulate AI response (replace with actual OpenAI API call when deployed)
    const responses = {
      "market-news": {
        initial: `📊 **Current Real Estate Market Trends in Ghana:**

1. **Urban Development Boom** - Accra and Kumasi continue to see increased property development
2. **Rising Property Values** - Average property prices up 12% year-over-year
3. **Digital Transformation** - More buyers searching online (like on 4Sale!)
4. **Affordable Housing Demand** - Growing middle class seeking affordable homes
5. **Investment Opportunities** - Commercial properties showing strong ROI

**Key Insights:**
- Gated communities are trending in suburban areas
- Mixed-use developments gaining popularity
- Green/sustainable buildings attracting premium prices

Would you like specific data on any location or property type?`,
        followup: `I can provide detailed market analysis for specific regions. Which area interests you most?

**Popular Areas:**
- **Accra** - High demand, premium prices
- **Kumasi** - Growing market, good investment
- **Takoradi** - Emerging opportunities
- **Tema** - Industrial & residential mix

Ask me about price trends, best investment areas, or market forecasts!`,
      },
      "books": {
        initial: `📚 **Top Real Estate Books Recommended for You:**

**For Beginners:**
1. **"The Book on Rental Property Investing"** by Brandon Turner
   - Perfect for first-time investors
   - Practical strategies and case studies

2. **"Real Estate Investing for Dummies"** by Eric Tyson
   - Comprehensive guide covering basics
   - Easy to understand concepts

**For Intermediate:**
3. **"The Millionaire Real Estate Investor"** by Gary Keller
   - Advanced investment strategies
   - Wealth-building techniques

4. **"What Every Real Estate Investor Needs to Know"** by Frank Gallinelli
   - Cash flow analysis
   - Investment calculations

**Ghana-Specific:**
5. **"Property Investment in Africa"** by Various Authors
   - Local market insights
   - Legal frameworks in Ghana

**Free Resources Available:**
- Visit our Blog section for downloadable PDFs
- Weekly market reports
- Investment guides

Would you like summaries of any specific book?`,
        followup: `I can provide detailed summaries! Which book interests you most, or would you like recommendations for your specific situation?

**Tell me about:**
- Your investment experience level
- Your budget range
- Your investment goals
- Preferred property types

I'll recommend the perfect books for your journey!`,
      },
      "analytics": {
        initial: `📈 **Real Estate Market Analytics Guide:**

**Key Metrics to Track:**

1. **Price Per Square Meter**
   - Compare across neighborhoods
   - Track trends over time
   - Identify undervalued areas

2. **Days on Market (DOM)**
   - How quickly properties sell
   - Indicates market heat
   - Seasonal patterns

3. **Price Trends**
   - Month-over-month changes
   - Year-over-year growth
   - Historical comparisons

4. **Supply & Demand**
   - New listings vs. sales
   - Inventory levels
   - Absorption rates

**Tools You Can Use:**
✅ Our Insights Dashboard (you're here!)
✅ Property comparison features
✅ Price trend charts
✅ Location heat maps

**Pro Tips:**
- Compare at least 3-5 similar properties
- Look at 6-month trends minimum
- Consider location factors (schools, transport)
- Factor in property condition

What specific analysis would you like help with?`,
        followup: `I can help you analyze specific properties or areas! 

**What would you like to analyze?**
- Specific property valuation
- Neighborhood comparison
- Investment ROI calculation
- Rental yield analysis
- Market timing (buy vs. wait)

Share details and I'll provide insights!`,
      },
      "consultation": {
        initial: `💼 **Essential Questions for Real Estate Agent Consultation:**

**Before Meeting:**
✅ Check agent's license & credentials
✅ Read reviews from past clients
✅ Prepare your budget range
✅ List your must-haves

**Questions to Ask:**

**1. Experience & Expertise**
- How long have you been selling in this area?
- How many properties have you sold this year?
- What's your specialty (residential, commercial)?

**2. Market Knowledge**
- What's the current market condition?
- What are comparable properties selling for?
- How long do properties typically stay listed?

**3. Strategy & Process**
- What's your marketing strategy?
- How often will we communicate?
- What's your negotiation approach?

**4. Fees & Contracts**
- What's your commission structure?
- Are there any additional fees?
- What's the contract length?
- Can I cancel if not satisfied?

**5. References**
- Can you provide recent client references?
- Do you have testimonials?

**Red Flags to Watch:**
🚩 Pressure to sign immediately
🚩 Unrealistic promises
🚩 Poor communication
🚩 No credentials shown

**On 4Sale Platform:**
- All agents are verified ✓
- Client reviews visible
- Direct messaging available
- Transparent fee structures

Would you like tips for any specific type of consultation?`,
        followup: `I can provide more specific guidance! 

**What's your situation?**
- First-time buyer
- Selling property
- Investment property
- Commercial property
- Land purchase

**Or ask about:**
- Negotiation tactics
- Contract terms to watch
- Best time to buy/sell
- How to evaluate agent responses

I'm here to help you prepare!`,
      },
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const resourceResponses = responses[resourceType] || responses["consultation"];
    const responseText = hasInitialResponse 
      ? resourceResponses.followup 
      : resourceResponses.initial;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: responseText },
    ]);

    setHasInitialResponse(true);
    setLoading(false);
  };

  // Auto-send initial message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialPrompt = getInitialPrompt();
      getAIResponse(initialPrompt);
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    await getAIResponse(userMessage);
  };

  const quickPrompts = {
    "market-news": [
      "What areas are growing fastest?",
      "Should I buy or wait?",
      "Best investment locations?",
    ],
    "books": [
      "Books for first-time buyers",
      "Advanced investment strategies",
      "Local market guides",
    ],
    "analytics": [
      "How to calculate ROI?",
      "Compare properties",
      "Valuation methods",
    ],
    "consultation": [
      "Negotiation tips",
      "Contract red flags",
      "Agent selection criteria",
    ],
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="ai-assistant-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="ai-assistant-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="ai-assistant-header">
            <div className="ai-assistant-title">
              <div className="ai-badge">
                <i className="fa fa-robot"></i>
                <span className="ai-pulse"></span>
              </div>
              <div>
                <h3>AI Assistant</h3>
                <p>{resourceTitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="ai-close-btn">
              <i className="fa fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-assistant-messages">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`ai-message ${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {msg.role === "assistant" && (
                  <div className="ai-avatar">
                    <i className="fa fa-robot"></i>
                  </div>
                )}
                <div className="ai-message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="user-avatar">
                    <i className="fa fa-user"></i>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                className="ai-message assistant"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="ai-avatar">
                  <i className="fa fa-robot"></i>
                </div>
                <div className="ai-message-content">
                  <div className="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && !loading && (
            <div className="ai-quick-prompts">
              <span>Quick questions:</span>
              <div className="quick-prompt-buttons">
                {(quickPrompts[resourceType] || quickPrompts["consultation"]).map(
                  (prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(prompt);
                        setTimeout(() => {
                          const form = document.querySelector('.ai-assistant-input-form');
                          if (form) form.requestSubmit();
                        }, 100);
                      }}
                      className="quick-prompt-btn"
                    >
                      {prompt}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="ai-assistant-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about real estate..."
              disabled={loading}
              className="ai-input"
            />
            <button type="submit" disabled={!input.trim() || loading} className="ai-send-btn">
              <i className="fa fa-paper-plane"></i>
            </button>
          </form>

          {/* Footer */}
          <div className="ai-assistant-footer">
            <i className="fa fa-shield-alt"></i>
            <span>Powered by AI • Information for guidance only</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
