import { motion } from "framer-motion";

// Reusable skeleton components with Framer Motion

export const PropertyCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="skeleton-property-card"
    >
      <div className="skeleton-property-image" />
      <div className="skeleton-property-content">
        <div className="skeleton-property-title" />
        <div className="skeleton-property-price" />
        <div className="skeleton-property-location" />
        <div className="skeleton-property-meta">
          <div className="skeleton-property-meta-item" />
          <div className="skeleton-property-meta-item" />
          <div className="skeleton-property-meta-item" />
        </div>
      </div>
    </motion.div>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="skeleton-blog-card"
    >
      <div className="skeleton-blog-image" />
      <div className="skeleton-blog-content">
        <div className="skeleton-blog-title" />
        <div className="skeleton-blog-excerpt" />
        <div className="skeleton-blog-excerpt" />
        <div className="skeleton-blog-date" />
      </div>
    </motion.div>
  );
};

export const AgentCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="skeleton-agent-card"
    >
      <div className="skeleton-agent-avatar" />
      <div className="skeleton-agent-name" />
      <div className="skeleton-agent-role" />
    </motion.div>
  );
};

export const LoadingSpinner = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "loading-spinner-sm" : size === "lg" ? "loading-spinner-lg" : "";
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`loading-spinner ${sizeClass}`}
    />
  );
};

export const LoadingDots = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="loading-dots"
    >
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </motion.div>
  );
};

export const ProgressBar = ({ progress = 0 }) => {
  return (
    <div className="progress-bar-container">
      <motion.div
        className="progress-bar"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};
