import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api/axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

function getPhotoUrl(photo) {
  if (!photo) return "/img/agent-default.jpg";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

// Helper function to render star ratings
function StarRating({ rating = 5.0, reviewCount = 0 }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<i key={`star-${i}`} className="fa fa-star"></i>);
  }
  if (hasHalfStar) {
    stars.push(<i key="half-star" className="fa fa-star-half-o"></i>);
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<i key={`empty-${i}`} className="fa fa-star-o"></i>);
  }
  
  return (
    <div className="agent-rating">
      <div className="stars">{stars}</div>
      <span className="rating-value">{rating.toFixed(1)}</span>
      {reviewCount > 0 && <span className="review-count">({reviewCount})</span>}
    </div>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await API.get("/agents");
        const data = res.data.data || res.data || [];
        setAgents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  // FAQ Data
  const faqData = [
    {
      question: "Why do I need an Agent?",
      answers: [
        "Agents are connected to professional networks and numerous list of properties.",
        "Agents are experienced with detailed information about Geographical areas, their culture and other personal neighbourhood information not gotten from the internet.",
        "Agents are marketers and salespersons. They have credible sources of information to get your listing or provide you with the right source of buyers or sellers."
      ]
    },
    {
      question: "Why do some Agents Charge Registration fees?",
      answers: [
        "Agent Commitment fee: Most Agents or Brokers charge commitment fees to enable them to see how serious clients are and also to bind them to the buyer or the seller. This makes both parties committed and also prevent the buyer or seller from contacting other Realtor or Agent.",
        "Agent Transport Fee: Sometimes these fees are termed as Transport fees to enable them to roam with you the buyer or potential tenant to the various property locations.",
        "Agent Consultation Fee: Some elite or professional agents term these charge are Consultation fee."
      ]
    },
    {
      question: "What are the qualities of a great Agent, Realtor or Associate Broker?",
      answers: [
        "Knowledge of the Locality: Most great Agents are profoundly knowledgeable about the neighbourhoods and vicinity with experience in customer service and Geographical locations.",
        "Attention to Detailed Information: A great Agent also has the patience to listen to clients needs and takes notes of information to arrive at the perfect suitable property for a client."
      ]
    },
    {
      question: "What is an Agent average salary?",
      answers: [
        "According to salary.com, the median annual Agent salary is $40,140, as of June 28, 2017.",
        "However calculating your monthly income as an Agent will depend on the total number of closed deals from clients, multiplied by the rate per charge to clients."
      ]
    },
    {
      question: "How do you become a successful and credible Agent, Broker, Associate Broker or Realtor?",
      answers: [
        "Collaborate or partner with other colleagues, associates and co-workers to gain maximum impact on clients as in being able to supply every demand as requested.",
        "Use Top Listing Directories like 4Sale",
        "For as low as $50 a month you can list your properties on 4Sale and gain more leads.",
        "Send stories to reporters or blog about your properties with paid services or free services like blogger to boost your image.",
        "Search for investors and vendors for leads.",
        "Don't disapprove or turn down any deal",
        "Always maintain connections and relationships with old clients and referrals."
      ]
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent =>
      agent.name?.toLowerCase().includes(search.toLowerCase()) ||
      agent.bio?.toLowerCase().includes(search.toLowerCase()) ||
      agent.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name?.localeCompare(b.name);
      if (sortBy === "properties") return (b.properties_count || 0) - (a.properties_count || 0);
      return 0;
    });

  return (
    <div className="zillow-agents-page">
      {/* Simple Header */}
      <div className="agents-header-section">
        <div className="agents-container">
          <h1 className="page-title">Real Estate Agents in Ghana</h1>
          
          {/* Search Bar - Zillow Style */}
          <div className="zillow-search-bar">
            <div className="location-input-wrapper">
              <input
                type="text"
                placeholder="City, neighborhood, or zip code"
                className="location-input"
              />
            </div>
            <div className="agent-name-input-wrapper">
              <input
                type="text"
                placeholder="Agent name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="agent-name-input"
              />
            </div>
            <button className="find-agent-btn">
              <i className="fa fa-search"></i> Find agent
            </button>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills">
            <button className="filter-pill">Buying</button>
            <button className="filter-pill">Selling</button>
            <button className="filter-pill">Top agent</button>
            <button className="filter-pill">Price range</button>
            <button className="filter-pill">Specialty</button>
            <button className="filter-pill">Language</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="agents-main-content">
        <div className="agents-container">
          {/* Agent Count */}
          <div className="agent-count">
            <strong>{filteredAgents.length}</strong> agents found
          </div>
          
          <div className="agents-layout">
            {/* Agents List - Left Side */}
            <div className="agents-list-section">
              {loading ? (
                <div className="agents-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading agents...</p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="agents-empty">
                  <i className="fa fa-users empty-icon"></i>
                  <h3>No agents found</h3>
                  <p>{search ? "Try adjusting your search criteria" : "No agents available at the moment"}</p>
                </div>
              ) : (
                <div className="zillow-agents-list">
                  {filteredAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="zillow-agent-card"
                    >
                      <Link to={`/agents/${agent.id}`} className="agent-card-content">
                        <div className="agent-left">
                          <img
                            src={getPhotoUrl(agent.photo)}
                            alt={agent.name}
                            className="agent-photo"
                          />
                        </div>
                        
                        <div className="agent-right">
                          <div className="agent-header-info">
                            <h2 className="agent-name-zillow">{agent.name}</h2>
                            <StarRating rating={agent.rating || 5.0} reviewCount={agent.reviews_count || 0} />
                          </div>
                          
                          {agent.agency && (
                            <div className="agent-company">{agent.agency}</div>
                          )}
                          
                          <div className="agent-stats-zillow">
                            {agent.price_range_min && agent.price_range_max ? (
                              <div className="stat-item-zillow">
                                <span className="stat-value">
                                  ${agent.price_range_min.toLocaleString()} - ${agent.price_range_max.toLocaleString()}
                                </span>
                                <span className="stat-label-zillow">price range</span>
                              </div>
                            ) : (
                              <div className="stat-item-zillow">
                                <span className="stat-value">No recent price range</span>
                              </div>
                            )}
                            
                            <div className="stat-item-zillow">
                              <span className="stat-value">{agent.properties_count || 0}</span>
                              <span className="stat-label-zillow">sales last 12 months</span>
                            </div>
                            
                            {agent.properties && agent.properties.length > 0 ? (
                              <div className="stat-item-zillow">
                                <span className="stat-value">{agent.properties.length}</span>
                                <span className="stat-label-zillow">
                                  sales in {agent.properties[0]?.location || "area"}
                                </span>
                              </div>
                            ) : (
                              <div className="stat-item-zillow">
                                <span className="stat-value">No sales in area</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <aside className="agents-sidebar">
              <div className="sidebar-card">
                <h3>Get help finding an agent</h3>
                <p>We'll pair you with a 4Sale agent who has the inside scoop on your market.</p>
                <button className="connect-agent-btn">
                  Connect with a local agent
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="agents-faq-section">
        <div className="agents-container">
          <h3 className="faq-title">Agent Frequently Asked Questions</h3>
          <div className="faq-list">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
                initial={false}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaqIndex === index}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <motion.i
                    className={`fa fa-chevron-down faq-icon`}
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
                <motion.div
                  className="faq-answer"
                  initial={false}
                  animate={{
                    height: openFaqIndex === index ? "auto" : 0,
                    opacity: openFaqIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="faq-answer-content">
                    <ol className="faq-list-items">
                      {faq.answers.map((answer, answerIndex) => (
                        <li key={answerIndex}>{answer}</li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
