import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InsightsSidebar from "../components/InsightsSidebar";
import MarketTrendsChart from "../components/MarketTrendsChart";
import { getPhotoUrl } from "../utils/getPhotoUrl";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}

export default function Insights() {
  // Stats for quick summary cards
  const [stats, setStats] = useState({
    avgPrice: "₵980,000",
    topLocation: "East Legon",
    topType: "3-Bed Apartment",
    listedToday: 35,
    demandTrend: "Upward"
  });

  // Chart data
  const [pricesData, setPricesData] = useState([
    { month: "Jan", price: 820000 },
    { month: "Feb", price: 840000 },
    { month: "Mar", price: 880000 },
    { month: "Apr", price: 920000 },
    { month: "May", price: 970000 },
    { month: "Jun", price: 990000 },
    { month: "Jul", price: 980000 },
    { month: "Aug", price: 1010000 },
    { month: "Sep", price: 1050000 },
    { month: "Oct", price: 1070000 },
    { month: "Nov", price: 1110000 },
    { month: "Dec", price: 1120000 },
  ]);
  const [typesData, setTypesData] = useState([
    { type: "Apartment", count: 42 },
    { type: "House", count: 33 },
    { type: "Shop", count: 12 },
    { type: "Land", count: 24 },
  ]);
  const [locationsData, setLocationsData] = useState([
    { location: "East Legon", count: 28 },
    { location: "Airport", count: 17 },
    { location: "Tema", count: 12 },
    { location: "Spintex", count: 11 },
    { location: "Osu", count: 9 },
  ]);

  // Featured articles
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured blog articles (or research/reports)
  useEffect(() => {
    fetch(`${backendUrl}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        const blogsArr = Array.isArray(data) ? data : data.data;
        setFeatured((blogsArr || []).filter(b => b.type === "blog").slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5 insights-page">
      <div className="row gx-5">
        <div className="col-lg-8 col-12">
          <h1 className="insights-title mb-4">Real Estate Insights & Trends</h1>
          {/* Market Stats */}
          <div className="insights-stats-row mb-4">
            <div className="insight-stat-card">
              <div className="insight-stat-label">Avg. Price</div>
              <div className="insight-stat-value">{stats.avgPrice}</div>
            </div>
            <div className="insight-stat-card">
              <div className="insight-stat-label">Top Location</div>
              <div className="insight-stat-value">{stats.topLocation}</div>
            </div>
            <div className="insight-stat-card">
              <div className="insight-stat-label">Top Property Type</div>
              <div className="insight-stat-value">{stats.topType}</div>
            </div>
            <div className="insight-stat-card">
              <div className="insight-stat-label">Listed Today</div>
              <div className="insight-stat-value">{stats.listedToday}</div>
            </div>
            <div className="insight-stat-card">
              <div className="insight-stat-label">Demand Trend</div>
              <div className="insight-stat-value">{stats.demandTrend}</div>
            </div>
          </div>

          {/* Market Trends Chart */}
          <div className="insights-market-charts mb-5">
            <MarketTrendsChart
              pricesData={pricesData}
              typesData={typesData}
              locationsData={locationsData}
            />
          </div>

          {/* Featured Articles */}
          <h3 className="insights-section-title mt-5">Featured Market Articles</h3>
          {loading ? (
            <div>Loading articles...</div>
          ) : (
            <div className="insights-featured-articles">
              {featured.map(blog => (
                <div key={blog.id} className="insights-featured-article">
                  <Link to={`/blog/${blog.id}`}>
                    <img
                      src={getBlogImage(blog.image)}
                      alt={blog.title}
                      className="insights-featured-img"
                    />
                  </Link>
                  <div className="insights-featured-body">
                    <Link to={`/blog/${blog.id}`} className="insights-featured-title">
                      {blog.title}
                    </Link>
                    <div className="insights-featured-excerpt">{blog.excerpt?.slice(0, 140)}{blog.excerpt?.length > 140 && "..."}</div>
                    <div className="insights-featured-meta">
                      <img
                        src={getPhotoUrl(blog.user?.photo)}
                        alt={blog.user?.name}
                        className="insights-featured-author-avatar"
                      />
                      <span>{blog.user?.name || blog.author || "Author"}</span>
                      <span className="insights-featured-date">{blog.created_at?.slice(0,10)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-lg-4 col-12">
          <InsightsSidebar />
        </div>
      </div>
    </div>
  );
}