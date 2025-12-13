import { Link, useLocation } from 'react-router-dom';
import '../styles/breadcrumb.css';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Route name mapping for better labels
  const routeNames = {
    'properties': 'Properties',
    'property-details': 'Property Details',
    'agents': 'Agents',
    'blog': 'Blog',
    'insights': 'Market Insights',
    'saved': 'Saved Properties',
    'messenger': 'Messages',
    'profile': 'Profile',
    'create-property': 'List Property',
    'edit-property': 'Edit Property',
    'notifications': 'Notifications',
    'admin': 'Admin',
    'pending': 'Pending Approvals',
    'manage-users': 'Manage Users',
    'login': 'Login',
    'register': 'Register',
  };

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) {
    return null;
  }

  // Format path segment to readable name
  const formatName = (segment) => {
    if (routeNames[segment]) {
      return routeNames[segment];
    }
    // If it's a number, it's likely an ID
    if (!isNaN(segment)) {
      return `#${segment}`;
    }
    // Capitalize and replace hyphens with spaces
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="breadcrumb-container" aria-label="Breadcrumb">
      <div className="container">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="breadcrumb-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
          </li>

          {pathnames.map((segment, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            return (
              <li
                key={routeTo}
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              >
                <i className="fas fa-chevron-right breadcrumb-separator"></i>
                {isLast ? (
                  <span className="breadcrumb-current">{formatName(segment)}</span>
                ) : (
                  <Link to={routeTo} className="breadcrumb-link">
                    {formatName(segment)}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
