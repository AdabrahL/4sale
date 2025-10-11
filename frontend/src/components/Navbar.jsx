import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Listen for scroll to show/hide top bar and change nav background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 64);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tabs: Replace "Home" and "Contact" with relevant ones for real estate
  const navTabs = [
    { to: "/home", label: "Home" },
    { to: "/properties", label: "Properties" },
    { to: "/agents", label: "Agents" },
    { to: "/insights", label: "Insights" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <header className={`header ${scrolled ? "nav-scrolled" : ""}`}>
      {/* Top Bar - hidden on scroll */}
      <div className={`header__top${scrolled ? " hide" : ""}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="header__top__left">
                <ul>
                  <li>
                    <i className="fa fa-envelope"></i> support@yourestate.com
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

          {/* Saved & My Properties (only logged in) */}
          {user && (
            <div className="col-lg-3 d-none d-lg-block">
              <div className="header__cart d-flex justify-content-end">
                <ul className="d-flex align-items-center gap-4">
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
                      <NavLink to="/saved" onClick={() => setMobileOpen(false)}>
                        Saved
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/my-properties" onClick={() => setMobileOpen(false)}>
                        My Properties
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