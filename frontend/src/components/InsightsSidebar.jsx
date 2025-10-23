import React from "react";
import { Link } from "react-router-dom";

export default function InsightsSidebar() {
  return (
    <aside className="insights-sidebar">
      {/* Tip of the week */}
      <div className="insights-sidebar-section">
        <div className="insights-sidebar-tip">
          <strong>Tip of the Week:</strong><br />
          Always verify ownership documents before making payments for property.
        </div>
      </div>
      {/* Quick links */}
      <div className="insights-sidebar-section">
        <h5 className="insights-sidebar-title">Quick Links</h5>
        <ul className="insights-sidebar-links">
          <li><Link to="/blog">Read Market News</Link></li>
          <li><Link to="/properties">Search Properties</Link></li>
          <li><Link to="/agents">Find an Agent</Link></li>
          <li><Link to="/blog?tab=books">Free Real Estate Books</Link></li>
        </ul>
      </div>
      {/* Mini market summary */}
      <div className="insights-sidebar-section">
        <h5 className="insights-sidebar-title">Market Summary</h5>
        <div className="insights-sidebar-summary">
          <div><b>Avg. Price:</b> ₵980,000</div>
          <div><b>Listings today:</b> 35</div>
          <div><b>Most searched:</b> East Legon</div>
        </div>
      </div>
    </aside>
  );
}