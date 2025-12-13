import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InsightsSidebar from "../components/InsightsSidebar";
import MarketTrendsChart from "../components/MarketTrendsChart";
import LeafletPropertyMap from "../components/LeafletPropertyMap";
import MarketTemperatureGauge from "../components/MarketTemperatureGauge";
import InvestmentScoreCard from "../components/InvestmentScoreCard";
import { getPhotoUrl } from "../utils/getPhotoUrl";
import { GHANA_LOCATIONS_ORGANIZED } from "../data/ghanaLocations";
import API from "../api/axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}
function normalizePayload(res) {
  if (!res) return [];
  const d = res.data ?? res;
  return d?.data ?? d ?? [];
}
function monthName(m) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m] ?? "";
}

export default function Insights() {
  // Stats for quick summary cards
  const [stats, setStats] = useState({
    avgPrice: "₵0",
    topLocation: "—",
    topType: "—",
    listedToday: 0,
    totalListings: 0,
    demandTrend: "stable",
  });

  // Market metrics
  const [marketMetrics, setMarketMetrics] = useState({
    temperature: "warm",
    temperatureScore: 75,
    investmentScore: 4.2,
    roi: 15.5,
    risk: "medium",
    marketActivity: 0,
    priceGrowth: 0,
  });

  // Chart data
  const [pricesData, setPricesData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

  // Featured articles
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Properties for map
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  
  // Interactive filters
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [priceRange, setPriceRange] = useState('all');
  const [propertyType, setPropertyType] = useState('all');

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);

      // Try insight-specific endpoints first, but fall back to properties/blog lists if not present
      try {
        const [statsRes, propsRes, blogsRes] = await Promise.allSettled([
          API.get("/insights/stats").catch(() => null),
          API.get("/properties", { params: { per_page: 500 } }).catch(() => null),
          API.get("/blogs", { params: { per_page: 20 } }).catch(() => null),
        ]);

        // Normalize property list
        const propData = propsRes.status === "fulfilled" ? normalizePayload(propsRes.value) : [];
        // Normalize blogs list
        const blogData = blogsRes.status === "fulfilled" ? normalizePayload(blogsRes.value) : [];

        // Store properties for map
        if (mounted) {
          setProperties(propData);
          setFilteredProperties(propData);
        }

        // Calculate market metrics
        if (mounted && propData.length > 0) {
          // Calculate temperature based on listing velocity and price trends
          const today = new Date();
          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const recentListings = propData.filter(p => {
            const created = new Date(p.created_at);
            return created >= lastWeek;
          }).length;
          
          const monthlyListings = propData.filter(p => {
            const created = new Date(p.created_at);
            return created >= lastMonth;
          }).length;

          // Calculate average price trend
          const prices = propData.map(p => Number(p.price || 0)).filter(Boolean);
          const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
          
          // Calculate temperature (hot: >20 weekly, warm: 10-20, cool: <10)
          let temperature = "cool";
          let temperatureScore = 50;
          if (recentListings > 20) {
            temperature = "hot";
            temperatureScore = 85 + Math.min(recentListings - 20, 15);
          } else if (recentListings > 10) {
            temperature = "warm";
            temperatureScore = 65 + (recentListings - 10);
          } else {
            temperatureScore = 40 + (recentListings * 2);
          }

          // Calculate investment score (1-5 based on various factors)
          const activityScore = Math.min((monthlyListings / propData.length) * 100, 100);
          const priceScore = avgPrice > 0 ? Math.min((avgPrice / 500000) * 100, 100) : 50;
          const investmentScore = ((activityScore + priceScore) / 2) / 20; // Convert to 1-5 scale
          
          // Calculate ROI estimate (simplified)
          const estimatedROI = temperature === "hot" ? 18.5 : temperature === "warm" ? 15.5 : 12.0;
          
          // Determine risk level
          const risk = investmentScore > 4 ? "low" : investmentScore > 3 ? "medium" : "high";

          // Calculate price growth percentage
          const priceGrowth = temperature === "hot" ? 12 : temperature === "warm" ? 8 : 5;

          setMarketMetrics({
            temperature,
            temperatureScore: Math.round(temperatureScore),
            investmentScore: Number(investmentScore.toFixed(1)),
            roi: estimatedROI,
            risk,
            marketActivity: recentListings * 7, // Extrapolate weekly to approximate monthly
            priceGrowth,
          });
        }

        // 1) Stats: prefer insights/stats endpoint if present
        if (statsRes.status === "fulfilled" && statsRes.value && statsRes.value.data) {
          const payload = statsRes.value.data?.data ?? statsRes.value.data ?? statsRes.value;
          if (mounted && payload) {
            setStats({
              avgPrice: payload.avgPrice ? `₵${Number(payload.avgPrice).toLocaleString()}` : stats.avgPrice,
              topLocation: payload.topLocation ?? stats.topLocation,
              topType: payload.topType ?? stats.topType,
              listedToday: payload.listedToday ?? stats.listedToday,
              totalListings: payload.totalListings ?? propData.length ?? 0,
              demandTrend: payload.demandTrend ?? stats.demandTrend,
            });
          }
        } else if (propData.length) {
          // derive stats from properties as fallback
          const prices = propData.map(p => Number(p.price || 0)).filter(Boolean);
          const avgPrice = prices.length ? Math.round(prices.reduce((a,b)=>a+b,0)/prices.length) : 0;

          const locCounts = {};
          const typeCounts = {};
          const today = new Date().toISOString().slice(0,10);
          let listedToday = 0;

          propData.forEach(p => {
            if (p.location) locCounts[p.location] = (locCounts[p.location] || 0) + 1;
            if (p.type) typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
            const created = p.created_at?.slice(0,10) ?? p.created_at;
            if (created === today) listedToday += 1;
          });

          const topLocation = Object.entries(locCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—";
          const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—";

          if (mounted) {
            setStats({
              avgPrice: avgPrice ? `₵${Number(avgPrice).toLocaleString()}` : "₵0",
              topLocation,
              topType,
              listedToday,
              totalListings: propData.length,
              demandTrend: listedToday > 5 ? "up" : listedToday > 2 ? "stable" : "down",
            });
          }

          // build chart data from properties: monthly average price (last 12 months)
          const byMonth = {};
          propData.forEach(p => {
            const d = p.created_at ? new Date(p.created_at) : null;
            if (!d || !p.price) return;
            const key = `${d.getFullYear()}-${d.getMonth()}`; // year-month
            if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0, year: d.getFullYear(), month: d.getMonth() };
            byMonth[key].sum += Number(p.price || 0);
            byMonth[key].count += 1;
          });

          // Take the last 12 months keys sorted
          const monthKeys = Object.keys(byMonth).sort((a,b) => {
            const [ay,am] = a.split("-").map(Number), [byy,bm] = b.split("-").map(Number);
            return ay !== byy ? ay - byy : am - bm;
          });
          const last12 = monthKeys.slice(-12);
          const pricesSeries = last12.map(k => {
            const entry = byMonth[k];
            return { month: `${monthName(entry.month)} ${entry.year}`, price: Math.round(entry.sum / entry.count) };
          });
          if (mounted && pricesSeries.length) setPricesData(pricesSeries);

          // types data
          const typesSeries = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
          if (mounted) setTypesData(typesSeries);

          // locations top N
          const locationsSeries = Object.entries(locCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([location, count]) => ({ location, count }));
          if (mounted) setLocationsData(locationsSeries);
        }

        // If pricesData empty and there exists an endpoint /insights/prices-monthly, try it
        if ((!pricesData || pricesData.length === 0) && (await tryFetchAndSet("/insights/prices-monthly", setPricesData))) {
          // done inside helper
        }

        // 2) Featured articles: look for market/insights reports in blogs; fallback to newest blogs
        let featuredList = [];
        if (blogData.length) {
          // prefer items with category 'Market', tag 'insight', or type 'report'
          featuredList = blogData.filter(b => {
            const cat = b.category?.name?.toLowerCase?.() ?? "";
            const tags = (b.tags || []).map(t => (t?.toLowerCase ? t.toLowerCase() : ""));
            return (b.type === "report") || cat.includes("market") || tags.includes("insight") || tags.includes("market");
          });
          if (featuredList.length < 3) {
            // add newest to reach 3
            const remaining = blogData.filter(b => !featuredList.includes(b)).sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
            featuredList = featuredList.concat(remaining.slice(0, 3 - featuredList.length));
          }
        } else {
          // fallback: try fetching /insights/articles
          const alt = await tryFetchAndNormalize("/insights/articles");
          if (alt.length) featuredList = alt.slice(0,3);
        }

        if (mounted) setFeatured(featuredList.slice(0,3));
      } catch (err) {
        console.error("Insights fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // helper to fetch and set series if available
    async function tryFetchAndSet(path, setter) {
      try {
        const r = await API.get(path).catch(()=>null);
        const arr = normalizePayload(r);
        if (arr && arr.length) {
          setter(arr);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    // helper to fetch and return array
    async function tryFetchAndNormalize(path) {
      try {
        const r = await API.get(path).catch(()=>null);
        return normalizePayload(r);
      } catch {
        return [];
      }
    }

    fetchAll();

    return () => { mounted = false; };
  }, []); // only on mount

  // Filter properties based on selected region and other filters
  useEffect(() => {
    let filtered = [...properties];

    // Filter by region
    if (selectedRegion) {
      filtered = filtered.filter(p => {
        // Get property location (only field that exists in most properties)
        const propertyLocation = (p.location || '').toLowerCase().trim();
        
        if (!propertyLocation) return false;
        
        // Check if property's location matches any city in the selected region
        if (GHANA_LOCATIONS_ORGANIZED[selectedRegion]) {
          const regionCities = GHANA_LOCATIONS_ORGANIZED[selectedRegion].cities || [];
          return regionCities.some(city => {
            const cityLower = city.toLowerCase();
            // Check both ways: location contains city name OR city name contains location
            return propertyLocation.includes(cityLower) || cityLower.includes(propertyLocation);
          });
        }
        
        return false;
      });
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(p => {
        const price = Number(p.price || 0);
        switch(priceRange) {
          case '0-200k': return price < 200000;
          case '200k-400k': return price >= 200000 && price < 400000;
          case '400k-600k': return price >= 400000 && price < 600000;
          case '600k+': return price >= 600000;
          default: return true;
        }
      });
    }

    // Filter by property type
    if (propertyType !== 'all') {
      filtered = filtered.filter(p => {
        const type = (p.type || '').toLowerCase();
        return type.includes(propertyType.toLowerCase());
      });
    }

    setFilteredProperties(filtered);
  }, [selectedRegion, priceRange, propertyType, properties]);

  return (
    <div className="insights-page">
      <div className="container">
        <div className="row gx-5">
          <div className="col-lg-8 col-12">
            {/* Hero Header */}
            <h1 className="insights-title">Real Estate Market Insights</h1>
            <p className="insights-subtitle">
              Discover trends, analyze data, and make informed property decisions with our comprehensive market intelligence.
            </p>

            {/* Interactive Ghana Map */}
            <div className="insights-map-section mb-4">
              <div className="insights-map-header">
                <h3>
                  <i className="fa fa-map-marked-alt"></i>
                  Explore Ghana Real Estate Market
                </h3>
                <p>Click on any region to see properties and market insights for that area</p>
              </div>
              <LeafletPropertyMap
                properties={filteredProperties}
                onRegionSelect={(regionName) => {
                  setSelectedRegion(regionName);
                  setSelectedLocation(null);
                }}
                showRegionBoundaries={true}
                showControls={false}
                height="500px"
                className="insights-map"
              />
            </div>

            {/* Market Temperature & Investment Score Row */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <MarketTemperatureGauge 
                  temperature={marketMetrics.temperature} 
                  score={marketMetrics.temperatureScore} 
                />
              </div>
              <div className="col-md-6">
                <InvestmentScoreCard 
                  score={marketMetrics.investmentScore} 
                  roi={marketMetrics.roi} 
                  risk={marketMetrics.risk} 
                />
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="insights-stats-row mb-4">
              <div className="insight-stat-card">
                <div className="insight-stat-icon">
                  <i className="fa fa-dollar-sign"></i>
                </div>
                <div className="insight-stat-label">Average Price</div>
                <div className="insight-stat-value">{stats.avgPrice}</div>
              </div>
              <div className="insight-stat-card">
                <div className="insight-stat-icon">
                  <i className="fa fa-map-marker-alt"></i>
                </div>
                <div className="insight-stat-label">Top Location</div>
                <div className="insight-stat-value" style={{ fontSize: '1.25rem' }}>{stats.topLocation}</div>
              </div>
              <div className="insight-stat-card">
                <div className="insight-stat-icon">
                  <i className="fa fa-home"></i>
                </div>
                <div className="insight-stat-label">Most Popular</div>
                <div className="insight-stat-value" style={{ fontSize: '1.25rem' }}>{stats.topType}</div>
              </div>
              <div className="insight-stat-card">
                <div className="insight-stat-icon">
                  <i className="fa fa-calendar-day"></i>
                </div>
                <div className="insight-stat-label">Listed Today</div>
                <div className="insight-stat-value">{stats.listedToday}</div>
              </div>
            </div>

            {/* Interactive Filters */}
            <div className="insights-filters mb-4">
              <div className="filters-header">
                <h4>
                  <i className="fa fa-filter"></i>
                  Filter Market Data
                </h4>
              </div>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Price Range</label>
                  <select 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Prices</option>
                    <option value="0-200k">Under ₵200K</option>
                    <option value="200k-400k">₵200K - ₵400K</option>
                    <option value="400k-600k">₵400K - ₵600K</option>
                    <option value="600k+">Above ₵600K</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Property Type</label>
                  <select 
                    value={propertyType} 
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="house">Houses</option>
                    <option value="apartment">Apartments</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Region</label>
                  <select 
                    value={selectedRegion || ''} 
                    onChange={(e) => {
                      setSelectedRegion(e.target.value || null);
                      setSelectedLocation(null);
                    }}
                    className="filter-select"
                  >
                    <option value="">All Regions</option>
                    <option value="Greater Accra">Greater Accra</option>
                    <option value="Ashanti">Ashanti</option>
                    <option value="Western">Western</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Central">Central</option>
                    <option value="Volta">Volta</option>
                    <option value="Northern">Northern</option>
                    <option value="Upper East">Upper East</option>
                    <option value="Upper West">Upper West</option>
                    <option value="Bono">Bono</option>
                    <option value="Bono East">Bono East</option>
                    <option value="Ahafo">Ahafo</option>
                    <option value="Savannah">Savannah</option>
                    <option value="North East">North East</option>
                    <option value="Western North">Western North</option>
                    <option value="Oti">Oti</option>
                  </select>
                </div>
                <button className="filter-reset-btn" onClick={() => {
                  setPriceRange('all');
                  setPropertyType('all');
                  setSelectedLocation(null);
                  setSelectedRegion(null);
                }}>
                  <i className="fa fa-redo"></i>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="insights-key-metrics">
              <div className="insights-metric-card">
                <div className="insights-metric-header">
                  <div className="insights-metric-label">Market Activity</div>
                  <div className={`insights-metric-change ${marketMetrics.priceGrowth > 0 ? 'positive' : 'negative'}`}>
                    <i className={`fa fa-arrow-${marketMetrics.priceGrowth > 0 ? 'up' : 'down'}`}></i>
                    <span>{marketMetrics.priceGrowth}%</span>
                  </div>
                </div>
                <div className="insights-metric-value">{marketMetrics.marketActivity || stats.listedToday * 7}</div>
                <div className="insights-metric-description">Properties listed this month</div>
              </div>
              <div className="insights-metric-card">
                <div className="insights-metric-header">
                  <div className="insights-metric-label">Average ROI</div>
                  <div className="insights-metric-change positive">
                    <i className="fa fa-arrow-up"></i>
                    <span>{marketMetrics.roi}%</span>
                  </div>
                </div>
                <div className="insights-metric-value">{marketMetrics.temperature}</div>
                <div className="insights-metric-description">Market temperature status</div>
              </div>
              <div className="insights-metric-card">
                <div className="insights-metric-header">
                  <div className="insights-metric-label">Investment Grade</div>
                  <div className={`insights-metric-change ${marketMetrics.risk === 'low' ? 'positive' : marketMetrics.risk === 'medium' ? 'neutral' : 'negative'}`}>
                    <i className="fa fa-shield-alt"></i>
                    <span>{marketMetrics.risk}</span>
                  </div>
                </div>
                <div className="insights-metric-value">{marketMetrics.investmentScore.toFixed(1)}/5</div>
                <div className="insights-metric-description">Overall investment score</div>
              </div>
            </div>

            {/* Regional Market Insights */}
            {selectedRegion && (
              <div className="insights-regional-highlight mb-5">
                <div className="regional-highlight-header">
                  <h3>
                    <i className="fa fa-map-pin"></i>
                    {selectedRegion} Region Market Overview
                  </h3>
                  <button 
                    className="clear-region-btn"
                    onClick={() => {
                      setSelectedRegion(null);
                      setPriceRange('all');
                      setPropertyType('all');
                    }}
                  >
                    <i className="fa fa-times"></i>
                    View All Regions
                  </button>
                </div>
                <div className="regional-stats-grid">
                  <div className="regional-stat">
                    <div className="regional-stat-icon">
                      <i className="fa fa-home"></i>
                    </div>
                    <div className="regional-stat-content">
                      <div className="regional-stat-label">Properties Available</div>
                      <div className="regional-stat-value">{filteredProperties.length}</div>
                    </div>
                  </div>
                  <div className="regional-stat">
                    <div className="regional-stat-icon">
                      <i className="fa fa-coins"></i>
                    </div>
                    <div className="regional-stat-content">
                      <div className="regional-stat-label">Avg Price</div>
                      <div className="regional-stat-value">
                        {filteredProperties.length > 0 
                          ? `₵${Math.round(filteredProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0) / filteredProperties.length).toLocaleString()}`
                          : '₵0'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="regional-stat">
                    <div className="regional-stat-icon">
                      <i className="fa fa-fire"></i>
                    </div>
                    <div className="regional-stat-content">
                      <div className="regional-stat-label">Market Status</div>
                      <div className="regional-stat-value" style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
                        {filteredProperties.length > 30 ? 'Hot' : filteredProperties.length > 15 ? 'Warm' : 'Cool'}
                      </div>
                    </div>
                  </div>
                  <div className="regional-stat">
                    <div className="regional-stat-icon">
                      <i className="fa fa-percentage"></i>
                    </div>
                    <div className="regional-stat-content">
                      <div className="regional-stat-label">Market Share</div>
                      <div className="regional-stat-value">
                        {properties.length > 0 ? ((filteredProperties.length / properties.length) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Trends Chart */}
            <div className="insights-market-charts mb-5">
              <div className="insights-chart-header">
                <h3 className="insights-chart-title">
                  <i className="fa fa-chart-line"></i>
                  Market Trends Analysis
                </h3>
              </div>
              <MarketTrendsChart
                pricesData={pricesData}
                typesData={typesData}
                locationsData={locationsData}
              />
            </div>

            {/* Quick Actions */}
            <div className="insights-quick-actions">
              <h3>Explore More</h3>
              <p>Dive deeper into market data and discover investment opportunities</p>
              <div className="insights-actions-grid">
                <Link to="/properties" className="insights-action-btn">
                  <i className="fa fa-search"></i>
                  Browse Properties
                </Link>
                <Link to="/agents" className="insights-action-btn">
                  <i className="fa fa-users"></i>
                  Find Agents
                </Link>
                <Link to="/blog" className="insights-action-btn">
                  <i className="fa fa-newspaper"></i>
                  Market News
                </Link>
                <Link to="/properties?type=investment" className="insights-action-btn">
                  <i className="fa fa-chart-pie"></i>
                  Investments
                </Link>
              </div>
            </div>

            {/* Featured Articles */}
            <h3 className="insights-section-title mt-5">Featured Market Reports</h3>
            {loading ? (
              <div className="empty">
                <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                <div>Loading market insights...</div>
              </div>
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
                      <div>
                        <Link to={`/blog/${blog.id}`} className="insights-featured-title">
                          {blog.title}
                        </Link>
                        <div className="insights-featured-excerpt">
                          {(blog.excerpt ?? blog.description ?? "").slice(0, 140)}
                          {(blog.excerpt ?? blog.description ?? "").length > 140 && "..."}
                        </div>
                      </div>
                      <div className="insights-featured-meta">
                        <img
                          src={getPhotoUrl(blog.user?.photo)}
                          alt={blog.user?.name}
                          className="insights-featured-author-avatar"
                        />
                        <span>{blog.user?.name || blog.author || "Author"}</span>
                        <span className="insights-featured-date">
                          <i className="fa fa-calendar" style={{ marginRight: '0.25rem' }}></i>
                          {blog.created_at?.slice(0,10)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {featured.length === 0 && (
                  <div className="empty">
                    <i className="fa fa-newspaper" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                    <div>No featured market articles yet.</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-lg-4 col-12">
            <InsightsSidebar stats={stats} pricesData={pricesData} />
          </div>
        </div>
      </div>
    </div>
  );
}