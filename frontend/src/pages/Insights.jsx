import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import InsightsSidebar from "../components/InsightsSidebar";
import MarketTrendsChart from "../components/MarketTrendsChart";
import { getPhotoUrl } from "../utils/getPhotoUrl";
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
    demandTrend: "N/A",
  });

  // Chart data
  const [pricesData, setPricesData] = useState([]);
  const [typesData, setTypesData] = useState([]);
  const [locationsData, setLocationsData] = useState([]);

  // Featured articles
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // 1) Stats: prefer insights/stats endpoint if present
        if (statsRes.status === "fulfilled" && statsRes.value && statsRes.value.data) {
          const payload = statsRes.value.data?.data ?? statsRes.value.data ?? statsRes.value;
          if (mounted && payload) {
            setStats({
              avgPrice: payload.avgPrice ? `₵${Number(payload.avgPrice).toLocaleString()}` : stats.avgPrice,
              topLocation: payload.topLocation ?? stats.topLocation,
              topType: payload.topType ?? stats.topType,
              listedToday: payload.listedToday ?? stats.listedToday,
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
              demandTrend: "N/A",
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
                    <div className="insights-featured-excerpt">{(blog.excerpt ?? blog.description ?? "").slice(0, 140)}{(blog.excerpt ?? blog.description ?? "").length > 140 && "..."}</div>
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
              {featured.length === 0 && <div className="empty">No featured market articles yet.</div>}
            </div>
          )}
        </div>

        <div className="col-lg-4 col-12">
          <InsightsSidebar stats={stats} pricesData={pricesData} />
        </div>
      </div>
    </div>
  );
}