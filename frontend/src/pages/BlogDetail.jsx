import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getPhotoUrl } from "../utils/getPhotoUrl";
import BlogSidebar from "../components/BlogSidebar ";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";
function getBlogImage(image) {
  if (!image) return "/img/default.jpg";
  return image.startsWith("http") ? image : `${backendUrl}/storage/${image}`;
}
function getReadingTime(text) {
  const wpm = 200;
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / wpm));
}

// Strip HTML tags and get plain text
function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // For text-to-speech highlighting
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWord, setCurrentWord] = useState(-1);
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef(null);

  // Prepare blog content as plain text and split to words
  const plainText = blog?.content ? stripHtml(blog.content) : "";
  const words = plainText.split(/\s+/);

  useEffect(() => {
    fetch(`${backendUrl}/api/blogs/${id}`)
      .then(res => res.json())
      .then(data => {
        setBlog(data.data || data.blog || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Clean up on unmount
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWord(-1);
    };
  }, [id]);

  // Stop speaking and highlight if blog changes
  useEffect(() => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWord(-1);
  }, [blog]);

  const handleSpeak = () => {
    if (!plainText) return;
    if (synthRef.current.speaking) synthRef.current.cancel();

    utterRef.current = new window.SpeechSynthesisUtterance(plainText);
    utterRef.current.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWord(-1);
    };
    utterRef.current.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentWord(-1);
    };
    utterRef.current.onboundary = (event) => {
      if (event.name === "word") {
        // event.charIndex: where the word starts
        const spokenSoFar = plainText.slice(0, event.charIndex);
        const wordIndex = spokenSoFar.split(/\s+/).length - 1;
        setCurrentWord(wordIndex);
      }
    };
    synthRef.current.speak(utterRef.current);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };
  const handleResume = () => {
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };
  const handleStop = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWord(-1);
  };

  if (loading) return <div className="blog-detail-loading">Loading...</div>;
  if (!blog) return <div className="blog-detail-notfound">Blog not found.</div>;

  return (
    <div className="container py-5 blog-detail-page">
      <div className="row gx-5">
        <div className="col-lg-8 col-12">
          <Link to="/blog" className="blog-detail-back mb-3 d-inline-block">
            <i className="fa fa-chevron-left"></i> Back to Blog
          </Link>
          {/* Hero Image */}
          <div className="blog-detail-hero-img-wrap">
            <img
              src={getBlogImage(blog.image)}
              alt={blog.title}
              className="blog-detail-hero-img"
            />
          </div>
          {/* Title & Meta */}
          <h1 className="blog-detail-title">{blog.title}</h1>
          <div className="blog-detail-meta">
            <div className="blog-detail-meta-author">
              <img
                src={getPhotoUrl(blog.user?.photo)}
                alt={blog.user?.name}
                className="blog-detail-author-avatar"
              />
              <span className="blog-detail-author-name">{blog.user?.name || blog.author || "Author"}</span>
              <span className="blog-detail-dot">•</span>
              <span className="blog-detail-date">{blog.created_at?.slice(0, 10)}</span>
              <span className="blog-detail-dot">•</span>
              <span className="blog-detail-readtime">{getReadingTime(blog.content)} min read</span>
              <span className="blog-detail-views">
  <i className="fa fa-eye"></i> {blog.views || 0} views
</span>
            </div>
            {/* Listen (Read Aloud) */}
            <div className="blog-detail-listen">
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="btn btn-outline-success btn-sm me-2"
                title="Listen to blog"
              >
                <i className="fa fa-volume-up"></i> Listen
              </button>
              {isSpeaking && (
                <>
                  {!isPaused ? (
                    <button onClick={handlePause} className="btn btn-outline-secondary btn-sm me-2" title="Pause">
                      <i className="fa fa-pause"></i>
                    </button>
                  ) : (
                    <button onClick={handleResume} className="btn btn-outline-secondary btn-sm me-2" title="Resume">
                      <i className="fa fa-play"></i>
                    </button>
                  )}
                  <button onClick={handleStop} className="btn btn-outline-danger btn-sm" title="Stop">
                    <i className="fa fa-stop"></i>
                  </button>
                </>
              )}
            </div>
            {/* Social share */}
            <div className="blog-detail-share">
              <span>Share:</span>
              <a href={`https://www.facebook.com/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" title="Share on Facebook">
                <i className="fa fa-facebook"></i>
              </a>
              <a href={`https://wa.me/?text=${window.location.href}`} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">
                <i className="fa fa-whatsapp"></i>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" title="Share on Twitter">
                <i className="fa fa-twitter"></i>
              </a>
            </div>
          </div>
          {/* Excerpt */}
          {blog.excerpt && (
            <div className="blog-detail-excerpt">
              <i className="fa fa-quote-left"></i> {blog.excerpt}
            </div>
          )}
          {/* Content (highlighted if speaking) */}
          <div className="blog-detail-content" style={{lineHeight: 1.8, fontSize: "1.18em"}}>
            {isSpeaking ? (
              words.map((word, i) => (
                <span
                  key={i}
                  className={i === currentWord ? "tts-highlight" : ""}
                  style={{
                    background: i === currentWord ? "#fff2a8" : "unset",
                    borderRadius: i === currentWord ? "4px" : "0"
                  }}
                >
                  {word + " "}
                </span>
              ))
            ) : (
              <span dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, "<br/>") }} />
            )}
          </div>
        </div>
        <div className="col-lg-4 col-12 mt-5 mt-lg-0">
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
}