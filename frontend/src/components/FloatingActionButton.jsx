import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/fab.css';

export default function FloatingActionButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    setIsMenuOpen(false);
  };

  const handleCreateProperty = () => {
    if (user) {
      navigate('/create-property');
    } else {
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {isVisible && (
        <div className="fab-container">
          {/* Secondary Actions Menu */}
          {isMenuOpen && (
            <div className="fab-menu">
              <button
                className="fab-menu-item"
                onClick={scrollToTop}
                title="Scroll to top"
              >
                <i className="fas fa-arrow-up"></i>
                <span>Top</span>
              </button>

              {user && (
                <>
                  <button
                    className="fab-menu-item"
                    onClick={handleCreateProperty}
                    title="Create property listing"
                  >
                    <i className="fas fa-plus-circle"></i>
                    <span>List Property</span>
                  </button>

                  <Link
                    to="/saved"
                    className="fab-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                    title="View saved properties"
                  >
                    <i className="fas fa-bookmark"></i>
                    <span>Saved</span>
                  </Link>

                  <Link
                    to="/messenger"
                    className="fab-menu-item"
                    onClick={() => setIsMenuOpen(false)}
                    title="Messages"
                  >
                    <i className="fas fa-comment-dots"></i>
                    <span>Messages</span>
                  </Link>
                </>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="fab-menu-item"
                  onClick={() => setIsMenuOpen(false)}
                  title="Login"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login</span>
                </Link>
              )}
            </div>
          )}

          {/* Main FAB Button */}
          <button
            className={`fab-button ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Quick actions"
          >
            <i className={`fas fa-${isMenuOpen ? 'times' : 'ellipsis-v'}`}></i>
          </button>
        </div>
      )}
    </>
  );
}
