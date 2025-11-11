import React from "react";
import { Link } from "react-router-dom";

/**
 * InsightsSidebar now accepts dynamic stats (from API) and optional pricesData.
 * Props:
 * - stats: { avgPrice, topLocation, topType, listedToday, demandTrend }
 * - pricesData: optional series array used to show a small sparkline (left simple)
 */
export default function InsightsSidebar({ stats = {}, pricesData = [] }) {
  const avgPrice = stats.avgPrice ?? "₵0";
  const listedToday = stats.listedToday ?? 0;
  const topLocation = stats.topLocation ?? "—";

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

      {/* Mini market summary (dynamic) */}
      <div className="insights-sidebar-section">
        <h5 className="insights-sidebar-title">Market Summary</h5>
        <div className="insights-sidebar-summary">
          <div><b>Avg. Price:</b> {avgPrice}</div>
          <div><b>Listings today:</b> {listedToday}</div>
          <div><b>Most searched:</b> {topLocation}</div>
        </div>
      </div>

      {/* Optional small sparkline: very small inline visualization using simple CSS bars */}
      {pricesData && pricesData.length > 0 && (
        <div className="insights-sidebar-section">
          <h5 className="insights-sidebar-title">Price trend (recent)</h5>
          <div className="insights-sparkline" aria-hidden>
            {pricesData.slice(-8).map((p, i) => {
              // normalize to relative value for height
              const max = Math.max(...pricesData.map(x => x.price || 0));
              const min = Math.min(...pricesData.map(x => x.price || 0));
              const range = Math.max(1, max - min);
              const val = p.price || 0;
              const pct = Math.round(((val - min) / range) * 100);
              return <div key={i} className="spark-bar" style={{ height: `${Math.max(6, pct)}%` }} title={`${p.month}: ₵${Number(val).toLocaleString()}`} />;
            })}
          </div>
        </div>
      )}
    </aside>
  );
}