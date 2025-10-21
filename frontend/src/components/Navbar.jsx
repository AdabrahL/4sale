import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

// Use VITE_BACKEND_URL from .env or fallback to http://backend.test
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://backend.test";

// Utility function to get the correct photo URL
function getPhotoUrl(photo) {
  if (!photo) return "/default-avatar.png";
  return photo.startsWith("http") ? photo : `${backendUrl}/storage/${photo}`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 64);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                  <a href="#"><i className="fa fa-facebook"></i></a>
                  <a href="#"><i className="fa fa-twitter"></i></a>
                  <a href="#"><i className="fa fa-linkedin"></i></a>
                  <a href="#"><i className="fa fa-instagram"></i></a>
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
                    <Link to="/login">
                      <i className="fa fa-user"></i> Login / Register
                    </Link>
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
                    maxHeight: "200px",
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
                        isActive || location.pathname === tab.to
                          ? "active"
                          : ""
                      }
                    >
                      {tab.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Saved, My Properties, Profile (only logged in) */}
          {user && (
            <div className="col-lg-3 d-none d-lg-block">
              <div className="header__cart d-flex justify-content-end">
                <ul className="d-flex align-items-center gap-4">
                  <li>
                    <Link to="/messenger" className="nav-messages-link" title="Messenger">
                    <i className="fa fa-envelope nav-messages-icon"></i>
                    </Link>
                  </li>


                  <li>
                    <Link to="/saved" title="Saved">
                      <i className={`fa fa-bookmark${scrolled ? " white-icon" : ""}`}></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-properties" title="My Properties">
                      <i className={`fa fa-home${scrolled ? " white-icon" : ""}`}></i>
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="profile-icon" title="Profile">
                      <img
                        src={getPhotoUrl(user.photo)}
                        alt="Profile"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #228B22"
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
                  <li>
                      <NavLink to="/mymessages" className="nav-messages-link" title="My Messages">
          <i className="fa fa-envelope nav-messages-icon"></i>
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/saved" onClick={() => setMobileOpen(false)}>
                        Saved
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/my-properties" onClick={() => setMobileOpen(false)}>
                        My Properties
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/profile" onClick={() => setMobileOpen(false)}>
                        <span style={{display: "inline-flex", alignItems: "center"}}>
                          <img
                            src={getPhotoUrl(user.photo)}
                            alt="Profile"
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #228B22",
                              marginRight: "0.5rem"
                            }}
                          /> Profile
                        </span>
                      </NavLink>
                    </li>
                  </>
                )}
                <li>
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="bg-transparent border-0 text-black hover:underline"
                    >
                      <i className="fa fa-sign-out"></i> Logout
                    </button>
                  ) : (
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <i className="fa fa-user"></i> Login / Register
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}