import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";

// Use VITE_BACKEND_URL from .env or fallback to http://backend.test
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

// Utility function to get the correct photo URL
function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const notificationRef = useRef(null);
  const location = useLocation();
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const SCROLL_THRESHOLD = 80;

    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset || 0;
      const isScrolled = scrollPosition > SCROLL_THRESHOLD;
      
      // Only update state if the scroll status changed
      setScrolled(prev => {
        if (prev !== isScrolled) {
          return isScrolled;
        }
        return prev;
      });
    };

    // Initialize on mount
    handleScroll();

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // If the logged-in user is an admin, fetch pending count for approvals
  useEffect(() => {
    let cancelled = false;

    const fetchPendingCount = async () => {
      if (!user || !user.is_admin) {
        if (!cancelled) setPendingCount(0);
        return;
      }
      try {
        const res = await API.get("/admin/properties/pending");
        // normalize possible paginated or array responses
        const list = res.data?.data ?? res.data ?? [];
        if (!cancelled) setPendingCount(Array.isArray(list) ? list.length : 0);
      } catch (err) {
        if (!cancelled) setPendingCount(0);
      }
    };

    fetchPendingCount();
    return () => { cancelled = true; };
  }, [user]);

  // Fetch unread message count
  useEffect(() => {
    let cancelled = false;

    const fetchUnreadCount = async () => {
      if (!user) {
        if (!cancelled) setUnreadCount(0);
        return;
      }
      try {
        const res = await API.get("/messages/unread-count");
        if (!cancelled) setUnreadCount(res.data?.count || 0);
      } catch (err) {
        if (!cancelled) setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Custom event listener to refresh count when messages are read
    const handleRefreshCount = () => fetchUnreadCount();
    window.addEventListener('refreshUnreadCount', handleRefreshCount);

    // Listen for real-time message notifications via WebSocket
    if (socket) {
      const handleNewMessage = (data) => {
        // Increment unread count when receiving a new message
        if (data.receiver_id === user?.id) {
          setUnreadCount(prev => prev + 1);
        }
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
        window.removeEventListener('refreshUnreadCount', handleRefreshCount);
        cancelled = true;
      };
    }

    return () => { 
      window.removeEventListener('refreshUnreadCount', handleRefreshCount);
      cancelled = true; 
    };
  }, [user, socket]);

  // Fetch notification count
  useEffect(() => {
    let cancelled = false;

    const fetchNotificationCount = async () => {
      if (!user) {
        if (!cancelled) setNotificationCount(0);
        return;
      }
      try {
        const res = await API.get("/notifications/unread-count");
        if (!cancelled) setNotificationCount(res.data?.count || 0);
      } catch (err) {
        if (!cancelled) setNotificationCount(0);
      }
    };

    fetchNotificationCount();

    // Custom event listener to refresh notification count
    const handleRefreshNotifications = () => fetchNotificationCount();
    window.addEventListener('refreshNotifications', handleRefreshNotifications);

    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
      cancelled = true;
    };
  }, [user]);

  // Fetch recent notifications for dropdown
  const fetchRecentNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get("/notifications/recent");
      setRecentNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch recent notifications:", err);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchRecentNotifications();
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await API.post(`/notifications/${id}/read`);
      setNotificationCount(prev => Math.max(0, prev - 1));
      setRecentNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      window.dispatchEvent(new Event('refreshNotifications'));
    } catch (err) {
      console.error(err);
    }
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const navTabs = [
    { to: "/home", label: "Home" },
    { to: "/properties", label: "Properties" },
    { to: "/agents", label: "Agents" },
    { to: "/insights", label: "Insights" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <header className={`header ${scrolled ? "nav-scrolled" : ""}`}>
      {/* Top Bar */}
      <div className={`header__top${scrolled ? " hide" : ""}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="header__top__left">
                <ul>
                  <li>
                    <i className="fa fa-envelope"></i> 4Sale@gmail.com
                  </li>
                  <li>Buy • Sell • Rent • Invest</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="header__top__right d-flex justify-content-end align-items-center">
                <div className="header__top__right__social">
                  <a href="#"><i className="fab fa-facebook"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
                <div className="header__top__right__auth ms-3">
                  {user ? (
                    <button
                      onClick={logout}
                      className="bg-transparent border-0 text-black hover:underline"
                    >
                      <i className="fa fa-sign-out"></i> Logout
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="me-3">
                        <i className="fa fa-sign-in-alt"></i> Login
                      </Link>
                      <Link to="/register">
                        <i className="fa fa-user-plus"></i> Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container">
        <div className="row align-items-center py-3">
          {/* Logo */}
          <div className="col-lg-3 col-6">
            <div className="header__logo">
              <Link to="/">
                <img
                  src="/img/Untitled design.png"
                  alt="Estate Logo"
                  style={{
                    maxHeight: "70px",
                    filter: scrolled ? "brightness(0) invert(1)" : "none",
                  }}
                />
              </Link>
            </div>
          </div>

          {/* Menu */}
          <div className="col-lg-6 d-none d-lg-block">
            <nav className="header__menu">
              <ul>
                {navTabs.map(tab => (
                  <li key={tab.to}>
                    <NavLink
                      to={tab.to}
                      className={({ isActive }) =>
                        isActive || location.pathname === tab.to ? "active" : ""
                      }
                    >
                      {tab.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Saved, Admin (only for admins), Profile (only logged in) */}
          {user && (
            <div className="col-lg-3 d-none d-lg-block">
              <div className="header__cart d-flex justify-content-end">
                <ul className="d-flex align-items-center gap-4">
                  <li style={{ position: 'relative' }}>
                    <Link to="/messenger" className="nav-messages-link" title="Messenger">
                      <i className={`fa fa-envelope${scrolled ? " white-icon" : ""}`}></i>
                      {unreadCount > 0 && (
                        <span
                          role="status"
                          aria-label={`${unreadCount} unread messages`}
                          className={`admin-badge ${scrolled ? "scrolled" : ""}`}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-10px',
                            minWidth: '20px',
                            height: '20px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>

                  <li style={{ position: 'relative' }} ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="notification-bell-btn"
                      title="Notifications"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <i className={`fa fa-bell${scrolled ? " white-icon" : ""}`}></i>
                      {notificationCount > 0 && (
                        <span
                          className={`admin-badge ${scrolled ? "scrolled" : ""}`}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-10px',
                            minWidth: '20px',
                            height: '20px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}
                        >
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="notification-dropdown">
                        <div className="notification-dropdown-header">
                          <h4>Notifications</h4>
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All
                          </Link>
                        </div>
                        <div className="notification-dropdown-body">
                          {recentNotifications.length === 0 ? (
                            <div className="notification-empty">
                              <i className="fa fa-bell-slash"></i>
                              <p>No new notifications</p>
                            </div>
                          ) : (
                            recentNotifications.map((notif) => (
                              <Link
                                key={notif.id}
                                to="/notifications"
                                className={`notification-dropdown-item ${!notif.read_at ? 'unread' : ''}`}
                                onClick={() => {
                                  setShowNotifications(false);
                                  markNotificationAsRead(notif.id);
                                }}
                              >
                                <div className="notif-icon">
                                  <i className="fa fa-bell"></i>
                                </div>
                                <div className="notif-content">
                                  <h5>{notif.title}</h5>
                                  <p>{notif.message}</p>
                                  <span className="notif-time">
                                    {formatNotificationTime(notif.created_at)}
                                  </span>
                                </div>
                                {!notif.read_at && <div className="notif-dot"></div>}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </li>

                  <li>
                    <Link to="/saved" title="Saved">
                      <i className={`fa fa-bookmark${scrolled ? " white-icon" : ""}`}></i>
                    </Link>
                  </li>

                  {/* Admin approvals link: admin-icon + admin-badge */}
                  {(user?.is_admin === true && pendingCount > 0) && (
                    <li>
                      <Link to="/admin/pending" title="Approvals" className="admin-approvals-link">
                        {/* admin-icon intentionally does NOT get white-icon when scrolled */}
                        <i className="fa fa-gavel admin-icon" aria-hidden="true"  />
                        <span
                          role="status"
                          aria-label={`${pendingCount} pending approvals`}
                          className={`admin-badge ${scrolled ? "scrolled" : ""}`}
                        >
                          {pendingCount}
                        </span>
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link to="/profile" className="profile-icon" title="Profile">
                      <img
                        src={getPhotoUrl(user.photo)}
                        alt="Profile"
                        className="profile-avatar"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #0c5904"
                        }}
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Nav Button */}
        <div className="humberger__open d-lg-none" onClick={() => setMobileOpen(true)}>
          <i className={`fa fa-bars${scrolled ? " white-icon" : ""}`}></i>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile__menu">
          <div className="mobile__menu__overlay" onClick={() => setMobileOpen(false)}></div>
          <div className="mobile__menu__content">
            <button className="mobile__menu__close" onClick={() => setMobileOpen(false)}>
              <i className="fa fa-times"></i>
            </button>
            <nav>
              <ul>
                {navTabs.map(tab => (
                  <li key={tab.to}>
                    <NavLink
                      to={tab.to}
                      onClick={() => setMobileOpen(false)}
                    >
                      {tab.label}
                    </NavLink>
                  </li>
                ))}

                {user && (
                  <>
                    <li style={{ position: 'relative' }}>
                      <NavLink to="/messenger" onClick={() => setMobileOpen(false)}>
                        <i className="fa fa-envelope" style={{ marginRight: '8px' }}></i>
                        Messages
                        {unreadCount > 0 && (
                          <span className="mobile-admin-badge" style={{
                            marginLeft: '8px',
                            display: 'inline-block',
                            minWidth: '20px',
                            height: '20px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            lineHeight: '16px',
                            textAlign: 'center'
                          }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/saved" onClick={() => setMobileOpen(false)}>
                        Saved
                      </NavLink>
                    </li>

                    {/* Admin link in mobile drawer */}
                    {(user?.is_admin === true && pendingCount > 0) && (
                      <li>
                        <NavLink to="/admin/pending" onClick={() => setMobileOpen(false)}>
                          Approvals
                          <span className={`mobile-admin-badge ${scrolled ? "scrolled" : ""}`}>
                            {pendingCount}
                          </span>
                        </NavLink>
                      </li>
                    )}

                    <li>
                      <NavLink to="/profile" onClick={() => setMobileOpen(false)}>
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <img
                            src={getPhotoUrl(user.photo)}
                            alt="Profile"
                            className="mobile-profile-avatar"
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #0c5904",
                              marginRight: "0.5rem"
                            }}
                          /> Profile
                        </span>
                      </NavLink>
                    </li>
                  </>
                )}
                {user ? (
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="bg-transparent border-0 text-black hover:underline"
                    >
                      <i className="fa fa-sign-out"></i> Logout
                    </button>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <i className="fa fa-sign-in-alt"></i> Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        <i className="fa fa-user-plus"></i> Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}