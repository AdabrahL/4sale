import { useEffect, useState } from 'react';
import '../styles/market-gauge.css';

export default function MarketTemperatureGauge({ temperature = 'warm', score = 75 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score on mount
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getTemperatureConfig = (temp) => {
    switch(temp.toLowerCase()) {
      case 'hot':
        return {
          label: 'HOT MARKET',
          color: '#ef4444',
          gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
          icon: '🔥',
          description: 'High demand, prices rising rapidly',
          emoji: '🔥🔥🔥'
        };
      case 'warm':
        return {
          label: 'WARM MARKET',
          color: '#f59e0b',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: '☀️',
          description: 'Moderate growth, good opportunities',
          emoji: '☀️☀️'
        };
      case 'cool':
        return {
          label: 'COOL MARKET',
          color: '#3b82f6',
          gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          icon: '❄️',
          description: 'Stable prices, buyer\'s market',
          emoji: '❄️'
        };
      default:
        return {
          label: 'NEUTRAL MARKET',
          color: '#6b7280',
          gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
          icon: '🌡️',
          description: 'Balanced market conditions',
          emoji: '🌡️'
        };
    }
  };

  const config = getTemperatureConfig(temperature);
  const rotation = (animatedScore / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="market-gauge-container">
      <div className="gauge-header">
        <h3>
          <i className="fa fa-temperature-high"></i>
          Market Temperature
        </h3>
        <span className="gauge-emoji">{config.emoji}</span>
      </div>

      <div className="gauge-wrapper">
        {/* Semicircle gauge */}
        <svg viewBox="0 0 200 120" className="gauge-svg">
          <defs>
            {/* Gradient definitions */}
            <linearGradient id="coolGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="hotGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Cool zone (0-33%) */}
          <path
            d="M 20 100 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="url(#coolGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Warm zone (33-66%) */}
          <path
            d="M 100 20 A 80 80 0 0 1 166 60"
            fill="none"
            stroke="url(#warmGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Hot zone (66-100%) */}
          <path
            d="M 166 60 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#hotGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Active indicator arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={config.color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(animatedScore / 100) * 251.2} 251.2`}
            className="gauge-progress"
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Needle */}
          <g transform={`rotate(${rotation} 100 100)`} className="gauge-needle">
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={config.color}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={config.color} />
            <circle cx="100" cy="100" r="4" fill="white" />
          </g>

          {/* Zone labels */}
          <text x="30" y="110" fontSize="10" fill="#3b82f6" fontWeight="600">COOL</text>
          <text x="88" y="15" fontSize="10" fill="#f59e0b" fontWeight="600">WARM</text>
          <text x="160" y="110" fontSize="10" fill="#ef4444" fontWeight="600">HOT</text>
        </svg>

        {/* Center score display */}
        <div className="gauge-score">
          <div className="score-value" style={{ color: config.color }}>
            {animatedScore}
          </div>
          <div className="score-label">Market Score</div>
        </div>
      </div>

      {/* Status card */}
      <div className="gauge-status" style={{ background: `${config.gradient}15`, borderColor: config.color }}>
        <div className="status-icon" style={{ background: config.gradient }}>
          {config.icon}
        </div>
        <div className="status-content">
          <div className="status-label" style={{ color: config.color }}>
            {config.label}
          </div>
          <div className="status-description">{config.description}</div>
        </div>
      </div>

      {/* Market indicators */}
      <div className="gauge-indicators">
        <div className="indicator">
          <div className="indicator-bar">
            <div 
              className="indicator-fill" 
              style={{ width: '85%', background: '#059669' }}
            ></div>
          </div>
          <div className="indicator-label">
            <span>Buyer Demand</span>
            <strong>85%</strong>
          </div>
        </div>
        <div className="indicator">
          <div className="indicator-bar">
            <div 
              className="indicator-fill" 
              style={{ width: '65%', background: '#f59e0b' }}
            ></div>
          </div>
          <div className="indicator-label">
            <span>Inventory Level</span>
            <strong>65%</strong>
          </div>
        </div>
        <div className="indicator">
          <div className="indicator-bar">
            <div 
              className="indicator-fill" 
              style={{ width: '92%', background: '#ef4444' }}
            ></div>
          </div>
          <div className="indicator-label">
            <span>Price Momentum</span>
            <strong>92%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
