import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer spad">
      <div className="container">
        <div className="row">
          {/* About */}
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="footer__about">
              <div className="footer__about__logo">
                <Link to="/">
                  <img src="/img/Untitled design.png" alt="4Sale Real Estate Logo" />
                </Link>
              </div>
              <ul>
                <li>Address: East Legon, Accra, Ghana</li>
                <li>Phone: +233 55 123 4567</li>
                <li>Email: support@4sale.com</li>
              </ul>
            </div>
          </div>

          {/* Links */}
          <div className="col-lg-4 col-md-6 col-sm-6 offset-lg-1">
            <div className="footer__widget">
              <h6>Buy</h6>
              <ul>
                <li><Link to="/properties?type=houses">Houses for Sale</Link></li>
                <li><Link to="/properties?type=apartments">Apartments for Sale</Link></li>
                <li><Link to="/properties?type=lands">Lands for Sale</Link></li>
                <li><Link to="/properties?type=commercial">Commercial Property</Link></li>
                <li><Link to="/properties?type=new-dev">New Developments</Link></li>
              </ul>
            </div>

            <div className="footer__widget mt-4">
              <h6>Rent</h6>
              <ul>
                <li><Link to="/properties?type=rent-houses">Houses for Rent</Link></li>
                <li><Link to="/properties?type=rent-apartments">Apartments for Rent</Link></li>
                <li><Link to="/properties?type=short-stay">Short Stay</Link></li>
                <li><Link to="/properties?type=rent-commercial">Commercial Rentals</Link></li>
              </ul>
            </div>
          </div>

          {/* Sell + Company */}
          <div className="col-lg-4 col-md-12">
            <div className="footer__widget">
              <h6>Sell</h6>
              <ul>
                <li><Link to="/properties/create">List Your Property</Link></li>
                <li><Link to="/agents">Agent Services</Link></li>
                <li><Link to="/promotions">Promotions</Link></li>
              </ul>
            </div>

            <div className="footer__widget mt-4">
              <h6>Company</h6>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/agents">Our Agents</Link></li>
                <li><Link to="/blog">Blog & News</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="footer__widget text-center">
              <h6>Join Our Newsletter</h6>
              <p>Get updates about new listings, market trends, and real estate tips.</p>
              <form className="d-inline-block" action="#">
                <input type="text" placeholder="Enter your email" />
                <button type="submit" className="site-btn">Subscribe</button>
              </form>
              <div className="footer__widget__social mt-3">
                <a href="#"><i className="fa fa-facebook"></i></a>
                <a href="#"><i className="fa fa-instagram"></i></a>
                <a href="#"><i className="fa fa-twitter"></i></a>
                <a href="#"><i className="fa fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="row mt-4">
          <div className="col-lg-12">
            <div className="footer__copyright d-flex justify-content-between align-items-center">
              <div className="footer__copyright__text">
                <p>
                  &copy; {new Date().getFullYear()} 4Sale Real Estate.  
                  Built with <i className="fa fa-heart" aria-hidden="true"></i> for property buyers & sellers.
                </p>
              </div>
              <div className="footer__copyright__payment">
                <img src="/img/payment-item.png" alt="Payment Methods" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
