import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AIResourceAssistant from "./AIResourceAssistant";

/**
 * Professional InsightsSidebar with enhanced features and AI integration
 * Props:
 * - stats: { avgPrice, topLocation, topType, listedToday, demandTrend, totalListings }
 * - pricesData: optional series array used to show a sparkline
 */
export default function InsightsSidebar({ stats = {}, pricesData = [] }) {
  const avgPrice = stats.avgPrice ?? "₵0";
  const listedToday = stats.listedToday ?? 0;
  const topLocation = stats.topLocation ?? "—";
  const totalListings = stats.totalListings ?? 0;
  const demandTrend = stats.demandTrend ?? "stable";

  const [activeTab, setActiveTab] = useState("tips");
  const [aiAssistant, setAiAssistant] = useState({
    isOpen: false,
    resourceType: "",
    resourceTitle: "",
  });

  // Rotating tips
  const tips = [
    {
      icon: "fa-shield-alt",
      title: "Verify Ownership",
      text: "Always verify ownership documents before making payments for property."
    },
    {
      icon: "fa-search-location",
      title: "Visit in Person",
      text: "Never buy property without visiting the location first. Photos can be misleading."
    },
    {
      icon: "fa-file-contract",
      title: "Legal Review",
      text: "Have a lawyer review all contracts and agreements before signing."
    },
    {
      icon: "fa-users",
      title: "Use Licensed Agents",
      text: "Work with verified and licensed real estate agents for secure transactions."
    },
    {
      icon: "fa-chart-line",
      title: "Research Market Value",
      text: "Compare prices in the area to ensure you're getting fair market value."
    }
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000); // Change tip every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = () => {
    if (demandTrend === "up") return "fa-arrow-trend-up";
    if (demandTrend === "down") return "fa-arrow-trend-down";
    return "fa-minus";
  };

  const getTrendColor = () => {
    if (demandTrend === "up") return "#10b981";
    if (demandTrend === "down") return "#ef4444";
    return "#64748b";
  };

  const openAIAssistant = (type, title) => {
    setAiAssistant({
      isOpen: true,
      resourceType: type,
      resourceTitle: title,
    });
  };

  const closeAIAssistant = () => {
    setAiAssistant({
      isOpen: false,
      resourceType: "",
      resourceTitle: "",
    });
  };

  return (
    <aside className="insights-sidebar">
      {/* Rotating Tip Card */}
      <div className="sidebar-card tip-card">
        <div className="tip-header">
          <div className="tip-icon-wrapper">
            <i className={`fa ${tips[currentTip].icon}`}></i>
          </div>
          <div className="tip-indicators">
            {tips.map((_, idx) => (
              <span
                key={idx}
                className={`tip-dot ${idx === currentTip ? "active" : ""}`}
                onClick={() => setCurrentTip(idx)}
              ></span>
            ))}
          </div>
        </div>
        <div className="tip-content">
          <h4>{tips[currentTip].title}</h4>
          <p>{tips[currentTip].text}</p>
        </div>
      </div>

      {/* Market Pulse */}
      <div className="sidebar-card market-pulse-card">
        <div className="card-header">
          <i className="fa fa-heart-pulse"></i>
          <h4>Market Pulse</h4>
        </div>
        <div className="market-pulse-content">
          <div className="pulse-item">
            <div className="pulse-label">
              <i className="fa fa-dollar-sign"></i>
              <span>Avg. Price</span>
            </div>
            <div className="pulse-value">{avgPrice}</div>
          </div>
          
          <div className="pulse-item">
            <div className="pulse-label">
              <i className="fa fa-calendar-day"></i>
              <span>Listed Today</span>
            </div>
            <div className="pulse-value highlight">{listedToday}</div>
          </div>

          <div className="pulse-item">
            <div className="pulse-label">
              <i className="fa fa-building"></i>
              <span>Total Listings</span>
            </div>
            <div className="pulse-value">{totalListings.toLocaleString()}</div>
          </div>

          <div className="pulse-item">
            <div className="pulse-label">
              <i className="fa fa-location-dot"></i>
              <span>Top Location</span>
            </div>
            <div className="pulse-value location">{topLocation}</div>
          </div>

          <div className="pulse-item trend">
            <div className="pulse-label">
              <i className={`fa ${getTrendIcon()}`} style={{ color: getTrendColor() }}></i>
              <span>Demand Trend</span>
            </div>
            <div className="pulse-value" style={{ color: getTrendColor() }}>
              {demandTrend.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Price Trend Sparkline */}
      {pricesData && pricesData.length > 0 && (
        <div className="sidebar-card sparkline-card">
          <div className="card-header">
            <i className="fa fa-chart-line"></i>
            <h4>Price Trend</h4>
          </div>
          <div className="sparkline-wrapper">
            <div className="sparkline-bars">
              {pricesData.slice(-12).map((p, i) => {
                const max = Math.max(...pricesData.map(x => x.price || 0));
                const min = Math.min(...pricesData.map(x => x.price || 0));
                const range = Math.max(1, max - min);
                const val = p.price || 0;
                const pct = Math.round(((val - min) / range) * 100);
                return (
                  <div
                    key={i}
                    className="spark-bar"
                    style={{ height: `${Math.max(10, pct)}%` }}
                    title={`${p.month}: ₵${Number(val).toLocaleString()}`}
                  >
                    <div className="spark-bar-inner"></div>
                  </div>
                );
              })}
            </div>
            <div className="sparkline-label">Last 12 months</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="sidebar-card quick-actions-card">
        <div className="card-header">
          <i className="fa fa-bolt"></i>
          <h4>Quick Actions</h4>
        </div>
        <div className="quick-actions-grid">
          <Link to="/properties" className="quick-action-btn">
            <i className="fa fa-search"></i>
            <span>Search</span>
          </Link>
          <Link to="/properties/create" className="quick-action-btn">
            <i className="fa fa-plus"></i>
            <span>List Property</span>
          </Link>
          <Link to="/agents" className="quick-action-btn">
            <i className="fa fa-user-tie"></i>
            <span>Find Agent</span>
          </Link>
          <Link to="/saved" className="quick-action-btn">
            <i className="fa fa-bookmark"></i>
            <span>Saved</span>
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div className="sidebar-card resources-card">
        <div className="card-header">
          <i className="fa fa-book-open"></i>
          <h4>Resources</h4>
        </div>
        <ul className="resources-list">
          <li>
            <Link to="/blog">
              <i className="fa fa-newspaper"></i>
              <span>Market News & Updates</span>
              <i className="fa fa-chevron-right"></i>
            </Link>
            <button
              className="ai-quick-btn"
              onClick={() => openAIAssistant("market-news", "Market News & Updates")}
              title="Ask AI about market trends"
            >
              <i className="fa fa-robot"></i>
            </button>
          </li>
          <li>
            <Link to="/blog?tab=books">
              <i className="fa fa-book"></i>
              <span>Real Estate Books</span>
              <i className="fa fa-chevron-right"></i>
            </Link>
            <button
              className="ai-quick-btn"
              onClick={() => openAIAssistant("books", "Real Estate Books")}
              title="Get AI book recommendations"
            >
              <i className="fa fa-robot"></i>
            </button>
          </li>
          <li>
            <Link to="/insights">
              <i className="fa fa-chart-pie"></i>
              <span>Market Analytics</span>
              <i className="fa fa-chevron-right"></i>
            </Link>
            <button
              className="ai-quick-btn"
              onClick={() => openAIAssistant("analytics", "Market Analytics")}
              title="Learn about analytics with AI"
            >
              <i className="fa fa-robot"></i>
            </button>
          </li>
          <li>
            <Link to="/agents">
              <i className="fa fa-handshake"></i>
              <span>Expert Consultation</span>
              <i className="fa fa-chevron-right"></i>
            </Link>
            <button
              className="ai-quick-btn"
              onClick={() => openAIAssistant("consultation", "Expert Consultation")}
              title="Prepare for consultation with AI"
            >
              <i className="fa fa-robot"></i>
            </button>
          </li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="sidebar-card cta-card">
        <div className="cta-content">
          <div className="cta-icon">
            <i className="fa fa-rocket"></i>
          </div>
          <h4>List Your Property</h4>
          <p>Reach thousands of buyers and sell faster with our platform.</p>
          <Link to="/properties/create" className="cta-button">
            Get Started <i className="fa fa-arrow-right"></i>
          </Link>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIResourceAssistant
        isOpen={aiAssistant.isOpen}
        onClose={closeAIAssistant}
        resourceType={aiAssistant.resourceType}
        resourceTitle={aiAssistant.resourceTitle}
      />
    </aside>
  );
}
