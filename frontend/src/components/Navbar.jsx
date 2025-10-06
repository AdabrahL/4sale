// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header__top">
        <div className="container">
          <div className="row">
            {/* Left */}
            <div className="col-lg-6 col-md-6">
              <div className="header__top__left">
                <ul>
                  <li>
                    <i className="fa fa-envelope"></i> support@yourestate.com
                  </li>
                  <li>Buy • Sell • Invest in Properties</li>
                </ul>
              </div>
            </div>

            {/* Right */}
            <div className="col-lg-6 col-md-6">
              <div className="header__top__right">
                <div className="header__top__right__social">
                  <a href="#">
                    <i className="fa fa-facebook"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-twitter"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-linkedin"></i>
                  </a>
                  <a href="#">
                    <i className="fa fa-instagram"></i>
                  </a>
                </div>

                <div className="header__top__right__auth">
                  {user ? (
                    <>
                      &nbsp;|&nbsp;
                      <button
                        onClick={logout}
                        className="bg-transparent border-0 text-black hover:underline"
                      >
                        <i className="fa fa-sign-out"></i> Logout
                      </button>
                    </>
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
        <div className="row">
          {/* Logo */}
          <div className="col-lg-3">
            <div className="header__logo">
              <Link to="/">
                <img src="/img/Untitled design.png" alt="Estate Logo" />
              </Link>
            </div>
          </div>

          {/* Menu */}
          <div className="col-lg-6 d-none d-lg-block">
            <nav className="header__menu">
              <ul>
                <li>
                  <NavLink to="/" end>
                    Properties
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about">About</NavLink>
                </li>
                <li>
                  <NavLink to="/blog">Blog</NavLink>
                </li>
                <li>
                  <NavLink to="/contact">Contact</NavLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* ✅ Saved & Compare only if logged in */}
          {user && (
            <div className="col-lg-3 d-none d-lg-block">
              <div className="header__cart">
                <ul>
                  <li>
                    <Link to="/saved">
                      <i className="fa fa-bookmark"></i>
                      <span>0</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-properties">My Properties</Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Nav Button */}
        <div className="humberger__open d-lg-none" onClick={() => setMobileOpen(true)}>
          <i className="fa fa-bars"></i>
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
                <li>
                  <NavLink to="/" onClick={() => setMobileOpen(false)} end>
                    Properties
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" onClick={() => setMobileOpen(false)}>About</NavLink>
                </li>
                <li>
                  <NavLink to="/blog" onClick={() => setMobileOpen(false)}>Blog</NavLink>
                </li>
                <li>
                  <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
                </li>
                {user && (
                  <>
                    <li>
                      <NavLink to="/saved" onClick={() => setMobileOpen(false)}>Saved</NavLink>
                    </li>
                    <li>
                      <NavLink to="/my-properties" onClick={() => setMobileOpen(false)}>My Properties</NavLink>
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
