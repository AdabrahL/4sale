import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import {
  PropertyCardSkeleton,
  BlogCardSkeleton,
  AgentCardSkeleton,
  LoadingSpinner,
  LoadingDots,
  ProgressBar
} from '../components/Skeletons';
import {
  AnimatedSection,
  AnimatedCard,
  AnimatedButton,
  FloatingElement,
  PulseElement,
  RevealOnScroll
} from '../components/AnimatedComponents';

export default function DesignShowcase() {
  const { success, error, warning, info } = useToast();
  const [progress, setProgress] = useState(0);

  const showToasts = () => {
    success('This is a success message!');
    setTimeout(() => error('This is an error message!'), 500);
    setTimeout(() => warning('This is a warning message!'), 1000);
    setTimeout(() => info('This is an info message!'), 1500);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gradient"
        style={{ fontSize: '48px', textAlign: 'center', marginBottom: '40px' }}
      >
        🎨 Design System Showcase
      </motion.h1>

      {/* Animations Section */}
      <AnimatedSection>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>✨ Animations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <AnimatedCard className="floating-card" style={{ padding: '20px' }}>
            <h3>Fade In Up</h3>
            <p>Smooth entrance animation</p>
          </AnimatedCard>
          
          <motion.div
            className="floating-card"
            whileHover={{ scale: 1.05, rotate: 2 }}
            style={{ padding: '20px' }}
          >
            <h3>Hover Scale + Rotate</h3>
            <p>Hover over me!</p>
          </motion.div>
          
          <FloatingElement className="floating-card" style={{ padding: '20px' }}>
            <h3>Floating</h3>
            <p>Continuously floating</p>
          </FloatingElement>
          
          <PulseElement className="floating-card" style={{ padding: '20px' }}>
            <h3>Pulsing</h3>
            <p>Gentle pulse effect</p>
          </PulseElement>
        </div>
      </AnimatedSection>

      {/* Glass Effects */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>🔮 Glassmorphism</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <div className="glass" style={{ padding: '30px', borderRadius: '16px' }}>
            <h3>Light Glass</h3>
            <p>Subtle blur effect</p>
          </div>
          <div className="glass-dark" style={{ padding: '30px', borderRadius: '16px', color: 'white' }}>
            <h3>Dark Glass</h3>
            <p>Dark variant</p>
          </div>
          <div className="glass-green" style={{ padding: '30px', borderRadius: '16px' }}>
            <h3>Green Glass</h3>
            <p>Brand colored</p>
          </div>
          <div className="frosted" style={{ padding: '30px', borderRadius: '16px' }}>
            <h3>Frosted</h3>
            <p>Strong blur</p>
          </div>
        </div>
      </RevealOnScroll>

      {/* Skeletons */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>💀 Loading Skeletons</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <PropertyCardSkeleton />
          <BlogCardSkeleton />
          <AgentCardSkeleton />
        </div>
      </RevealOnScroll>

      {/* Loading States */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>⏳ Loading Indicators</h2>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="sm" />
            <p>Small</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="md" />
            <p>Medium</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <LoadingSpinner size="lg" />
            <p>Large</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <LoadingDots />
            <p>Dots</p>
          </div>
        </div>
      </RevealOnScroll>

      {/* Progress Bar */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>📊 Progress Bar</h2>
        <div style={{ marginBottom: '60px' }}>
          <ProgressBar progress={progress} />
          <AnimatedButton
            onClick={simulateProgress}
            className="hero-btn"
            style={{ marginTop: '20px' }}
          >
            Simulate Progress
          </AnimatedButton>
        </div>
      </RevealOnScroll>

      {/* Toast Notifications */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>🍞 Toast Notifications</h2>
        <AnimatedButton
          onClick={showToasts}
          className="hero-btn ripple"
          style={{ marginBottom: '60px' }}
        >
          Show All Toasts
        </AnimatedButton>
      </RevealOnScroll>

      {/* Badges */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>🏷️ Badges & Tags</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '60px' }}>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-danger">Danger</span>
          <span className="badge badge-info">Info</span>
          <span className="badge badge-premium">Premium</span>
          <span className="badge badge-new">New</span>
          <span className="badge badge-featured">Featured</span>
          <span className="badge badge-outline badge-success">Outline</span>
        </div>
      </RevealOnScroll>

      {/* Shadows & Effects */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>🌟 Shadows & Effects</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          <div className="shadow-sm" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
            <h4>Small Shadow</h4>
          </div>
          <div className="shadow-md" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
            <h4>Medium Shadow</h4>
          </div>
          <div className="shadow-lg" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
            <h4>Large Shadow</h4>
          </div>
          <div className="shadow-green-lg" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
            <h4>Green Shadow</h4>
          </div>
          <div className="glow-green" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
            <h4>Green Glow</h4>
          </div>
          <div className="neuro" style={{ padding: '20px', borderRadius: '12px' }}>
            <h4>Neumorphism</h4>
          </div>
        </div>
      </RevealOnScroll>

      {/* Empty State Example */}
      <RevealOnScroll>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>📭 Empty State</h2>
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h3 className="empty-state-title">No Properties Found</h3>
          <p className="empty-state-description">
            We couldn't find any properties matching your criteria. Try adjusting your filters or browse all available properties.
          </p>
          <div className="empty-state-action">
            <a href="/properties" className="empty-state-button empty-state-button-primary">
              Browse All Properties
            </a>
            <a href="/properties/create" className="empty-state-button empty-state-button-secondary">
              List a Property
            </a>
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
