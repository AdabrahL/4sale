import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import BlogSidebar from "../components/BlogSidebar";
import { useAuth } from "../contexts/AuthContext"; // <-- added import

/**
 * Enhanced Blog page
 * - Uses API (axios) for requests
 * - Search, category & tag filters, sort, pagination
 * - Featured hero card, grid of article cards
 * - Skeleton loaders while fetching
 * - Read time estimate and share buttons
 */

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}

// small util to estimate reading time
function estimateReadTime(text = "") {
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default function Blog() {
  const { user } = useAuth(); // <-- get auth user
  const isAdmin = !!(user && user.is_admin); // determine admin status

  const [tab, setTab] = useState("blogs"); // blogs | books
  const [items, setItems] = useState([]); // current list (blogs or books)
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);

  // filters / pagination
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("newest"); // newest, popular
  const [page, setPage] = useState(1);
  const [perPage] = useState(8);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });

  // fetch with params (works for both blogs and books endpoints)
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchList = async () => {
      try {
        const params = {
          page,
          per_page: perPage,
          q: query || undefined,
          category_id: categoryId || undefined,
          tag: tag || undefined,
          sort: sort === "popular" ? "views_desc" : undefined,
        };

        const res = await API.get("/blogs", { params });
        // backend may return paginated resource: { data: [...], meta: {...} } or just array
        const payload = res.data?.data ?? res.data ?? [];
        const dataArr = Array.isArray(payload) ? payload : payload.data ?? [];
        const list = (dataArr || []).filter(i => (tab === "books" ? i.type === "book" : i.type !== "book"));
        if (!mounted) return;

        // set featured as the first highest priority blog when on blogs tab
        if (tab === "blogs") {
          const first = list.length ? list[0] : null;
          setFeatured(first);
          // remove first from items to avoid duplication in grid
          setItems(list.slice(first ? 1 : 0));
        } else {
          setFeatured(null);
          setItems(list);
        }

        // meta support
        const metaData = res.data?.meta ?? res.data?.pagination ?? { total: list.length, last_page: 1 };
        setMeta({
          total: metaData.total ?? list.length,
          last_page: metaData.last_page ?? 1,
        });
      } catch (err) {
        console.error("Failed to load blogs:", err.response?.data || err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
    return () => { mounted = false; };
  }, [tab, page, perPage, query, categoryId, tag, sort]);

  const skeletons = useMemo(() => new Array(6).fill(0), []);

  return (
    <div className="blog-main-page container py-5">
      <div className="blog-header-row d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="blog-main-title">Insights & Articles</h2>
          <p className="blog-subtitle">Helpful articles, guides and featured reads from our experts.</p>
        </div>
        <div className="blog-actions">
          <div className="blog-search-wrap">
            <input
              className="blog-search"
              placeholder="Search blogs, titles or authors..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>

          <div className="blog-toggle">
            <button className={`blog-toggle-btn ${tab === "blogs" ? "active" : ""}`} onClick={() => { setTab("blogs"); setPage(1); }}>
              Blogs
            </button>
            <button className={`blog-toggle-btn ${tab === "books" ? "active" : ""}`} onClick={() => { setTab("books"); setPage(1); }}>
              Books
            </button>
          </div>

          {/* Admin-only Post button */}
          {isAdmin && (
            <Link to="/blog/post" className="btn btn-green ms-3">
              + Post Blog/Book
            </Link>
          )}
        </div>
      </div>

      <div className="row blog-main-row gx-5">
        <div className="col-lg-8 col-12 blog-main-stack-col">
          {/* Featured hero (only for blogs tab and when featured exists) */}
          {!loading && tab === "blogs" && featured && (
            <article className="blog-hero-card">
              <Link to={`/blog/${featured.id}`} className="blog-hero-link">
                <img src={getBlogImage(featured.image)} alt={featured.title} className="blog-hero-img" loading="lazy" />
                <div className="blog-hero-overlay">
                  <div className="blog-hero-meta">
                    <span className="badge">{featured.category?.name ?? "Article"}</span>
                    <span className="date">{featured.created_at?.slice(0,10)}</span>
                  </div>
                  <h3 className="blog-hero-title">{featured.title}</h3>
                  <p className="blog-hero-excerpt">{featured.excerpt ?? featured.description?.slice(0,160)}</p>
                  <div className="blog-hero-bottom">
                    <div className="author">
                      <img src={featured.user?.photo ? `${backendUrl}/storage/${featured.user.photo}` : "/default-avatar.png"} alt={featured.user?.name} />
                      <span>{featured.user?.name ?? featured.author ?? "Author"}</span>
                    </div>
                    <div className="meta">
                      <span>{estimateReadTime(featured.description)}</span>
                      <span>•</span>
                      <span><i className="fa fa-eye"></i> {featured.views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          )}

          {/* Filter bar */}
          <div className="blog-filter-bar">
            <div className="blog-filter-left">
              <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
                <option value="">All categories</option>
                {/* categories: in a real app you'd fetch categories; include a few common fallbacks */}
                <option value="1">Market news</option>
                <option value="2">Guides</option>
                <option value="3">Tips</option>
              </select>

              <input
                className="blog-filter-tag"
                placeholder="Filter by tag (e.g. staging)"
                value={tag}
                onChange={(e) => { setTag(e.target.value); setPage(1); }}
              />
            </div>

            <div className="blog-filter-right">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="popular">Most viewed</option>
              </select>
            </div>
          </div>

          {/* Content grid / list */}
          {loading ? (
            <div className="blog-grid">
              {skeletons.map((_, i) => (
                <div key={i} className="blog-card-skeleton">
                  <div className="s-img" />
                  <div className="s-lines">
                    <div className="s-line s-title" />
                    <div className="s-line s-sub" />
                    <div className="s-line s-meta" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="blog-empty">No articles found.</div>
          ) : (
            <div className="blog-grid">
              {items.map(b => (
                <article key={b.id} className="blog-card">
                  <Link to={`/blog/${b.id}`} className="blog-card-link">
                    <div className="blog-card-media">
                      <img src={getBlogImage(b.image)} alt={b.title} loading="lazy" />
                    </div>
                    <div className="blog-card-body">
                      <div className="blog-card-top">
                        <h4 className="blog-card-title">{b.title}</h4>
                        <div className="blog-card-excerpt">{(b.excerpt || b.description || "").slice(0, 160)}{(b.excerpt || b.description || "").length > 160 && "..."}</div>
                      </div>

                      <div className="blog-card-meta">
                        <div className="author">
                          <img src={b.user?.photo ? `${backendUrl}/storage/${b.user.photo}` : "/default-avatar.png"} alt={b.user?.name} />
                          <div>
                            <div className="author-name">{b.user?.name ?? b.author ?? "Author"}</div>
                            <div className="meta-row">
                              <span className="date">{b.created_at?.slice(0,10)}</span>
                              <span className="dot">•</span>
                              <span className="read-time">{estimateReadTime(b.description)}</span>
                              <span className="dot">•</span>
                              <span className="views"><i className="fa fa-eye"></i> {b.views || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-actions">
                          {/* share actions (opens native share if available) */}
                          <button
                            className="icon-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              const shareData = { title: b.title, text: b.excerpt ?? "", url: window.location.origin + `/blog/${b.id}` };
                              if (navigator.share) {
                                navigator.share(shareData).catch(() => {});
                              } else {
                                // fallback copy url
                                navigator.clipboard?.writeText(shareData.url);
                                alert("Link copied to clipboard");
                              }
                            }}
                          >
                            <i className="fa fa-share-alt"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="blog-pagination">
            <button className="page-btn" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</button>
            <div className="page-info">Page {page} of {meta.last_page}</div>
            <button className="page-btn" onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page >= meta.last_page}>Next</button>
          </div>
        </div>

        <div className="col-lg-4 col-12 blog-main-sidebar">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}