import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/empty-states.css';

export default function EmptyState({ 
  type = 'properties',
  title,
  message,
  actionText,
  actionLink,
  onAction,
  illustration
}) {
  // Predefined empty states
  const emptyStates = {
    properties: {
      title: 'No Properties Found',
      message: 'We couldn\'t find any properties matching your criteria. Try adjusting your filters or browse all listings.',
      actionText: 'Browse All Properties',
      actionLink: '/properties',
      icon: 'fa-home'
    },
    saved: {
      title: 'No Saved Properties',
      message: 'You haven\'t saved any properties yet. Start exploring and save your favorites!',
      actionText: 'Explore Properties',
      actionLink: '/properties',
      icon: 'fa-bookmark'
    },
    messages: {
      title: 'No Messages Yet',
      message: 'Your inbox is empty. Start a conversation with property agents.',
      actionText: 'View Properties',
      actionLink: '/properties',
      icon: 'fa-comment-dots'
    },
    notifications: {
      title: 'All Caught Up!',
      message: 'You have no new notifications at the moment.',
      actionText: 'Back to Home',
      actionLink: '/',
      icon: 'fa-bell'
    },
    search: {
      title: 'No Results Found',
      message: 'Try different keywords or check your spelling.',
      actionText: 'Clear Search',
      actionLink: null,
      icon: 'fa-search'
    },
    blogs: {
      title: 'No Blog Posts',
      message: 'There are no blog posts available at the moment. Check back later!',
      actionText: 'Go to Home',
      actionLink: '/',
      icon: 'fa-newspaper'
    },
    agents: {
      title: 'No Agents Found',
      message: 'We couldn\'t find any agents in this area.',
      actionText: 'View All Agents',
      actionLink: '/agents',
      icon: 'fa-user-tie'
    },
    error: {
      title: 'Oops! Something Went Wrong',
      message: 'We encountered an error loading this content. Please try again.',
      actionText: 'Try Again',
      actionLink: null,
      icon: 'fa-exclamation-circle'
    }
  };

  const state = emptyStates[type] || emptyStates.properties;

  const finalTitle = title || state.title;
  const finalMessage = message || state.message;
  const finalActionText = actionText || state.actionText;
  const finalActionLink = actionLink !== undefined ? actionLink : state.actionLink;
  const icon = state.icon;

  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="empty-state-content">
        {/* Illustration */}
        <motion.div
          className="empty-state-illustration"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
        >
          {illustration || (
            <div className="empty-state-icon">
              <i className={`fas ${icon}`}></i>
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h3
          className="empty-state-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {finalTitle}
        </motion.h3>

        {/* Message */}
        <motion.p
          className="empty-state-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {finalMessage}
        </motion.p>

        {/* Action Button */}
        {(finalActionLink || onAction) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {finalActionLink ? (
              <Link to={finalActionLink} className="empty-state-action">
                {finalActionText}
                <i className="fas fa-arrow-right"></i>
              </Link>
            ) : (
              <button onClick={onAction} className="empty-state-action">
                {finalActionText}
                <i className="fas fa-arrow-right"></i>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="empty-state-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </motion.div>
  );
}
