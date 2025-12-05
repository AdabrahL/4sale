import '../styles/investment-score.css';

export default function InvestmentScoreCard({ score = 4.2, roi = 15.5, risk = 'medium' }) {
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const getRiskConfig = (riskLevel) => {
    switch(riskLevel.toLowerCase()) {
      case 'low':
        return {
          color: '#059669',
          bg: 'rgba(5, 150, 105, 0.1)',
          label: 'Low Risk',
          icon: '🛡️'
        };
      case 'medium':
        return {
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.1)',
          label: 'Moderate Risk',
          icon: '⚖️'
        };
      case 'high':
        return {
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.1)',
          label: 'High Risk',
          icon: '⚠️'
        };
      default:
        return {
          color: '#6b7280',
          bg: 'rgba(107, 114, 128, 0.1)',
          label: 'Unknown Risk',
          icon: '❓'
        };
    }
  };

  const riskConfig = getRiskConfig(risk);

  const getScoreLabel = (scoreValue) => {
    if (scoreValue >= 4.5) return 'Excellent Investment';
    if (scoreValue >= 4.0) return 'Very Good Investment';
    if (scoreValue >= 3.5) return 'Good Investment';
    if (scoreValue >= 3.0) return 'Fair Investment';
    return 'Moderate Investment';
  };

  return (
    <div className="investment-score-container">
      <div className="investment-header">
        <h3>
          <i className="fa fa-chart-pie"></i>
          Investment Analysis
        </h3>
        <div className="score-badge">
          <i className="fa fa-trophy"></i>
          {getScoreLabel(score)}
        </div>
      </div>

      {/* Star Rating */}
      <div className="star-rating-section">
        <div className="star-display">
          {[...Array(fullStars)].map((_, i) => (
            <i key={`full-${i}`} className="fa fa-star star-icon full"></i>
          ))}
          {hasHalfStar && <i className="fa fa-star-half-alt star-icon half"></i>}
          {[...Array(emptyStars)].map((_, i) => (
            <i key={`empty-${i}`} className="fa fa-star star-icon empty"></i>
          ))}
        </div>
        <div className="score-number">{score.toFixed(1)}<span>/5.0</span></div>
      </div>

      {/* Key Metrics Grid */}
      <div className="investment-metrics">
        <div className="metric-card highlight">
          <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <i className="fa fa-percentage"></i>
          </div>
          <div className="metric-content">
            <div className="metric-label">Expected ROI</div>
            <div className="metric-value positive">+{roi}%</div>
            <div className="metric-sublabel">Per year</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: riskConfig.bg, color: riskConfig.color }}>
            {riskConfig.icon}
          </div>
          <div className="metric-content">
            <div className="metric-label">Risk Level</div>
            <div className="metric-value" style={{ color: riskConfig.color }}>{riskConfig.label}</div>
            <div className="metric-sublabel">Investment grade</div>
          </div>
        </div>
      </div>

      {/* Investment Factors */}
      <div className="investment-factors">
        <h4>Key Investment Factors</h4>
        <div className="factors-grid">
          <div className="factor-item">
            <div className="factor-header">
              <span>Location Growth</span>
              <strong className="positive">92%</strong>
            </div>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '92%', background: '#10b981' }}></div>
            </div>
          </div>

          <div className="factor-item">
            <div className="factor-header">
              <span>Market Demand</span>
              <strong className="positive">85%</strong>
            </div>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '85%', background: '#059669' }}></div>
            </div>
          </div>

          <div className="factor-item">
            <div className="factor-header">
              <span>Infrastructure</span>
              <strong className="positive">78%</strong>
            </div>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '78%', background: '#34d399' }}></div>
            </div>
          </div>

          <div className="factor-item">
            <div className="factor-header">
              <span>Price Appreciation</span>
              <strong className="positive">88%</strong>
            </div>
            <div className="factor-bar">
              <div className="factor-fill" style={{ width: '88%', background: '#0d9488' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Tips */}
      <div className="investment-tips">
        <div className="tip-header">
          <i className="fa fa-lightbulb"></i>
          <span>Investment Insights</span>
        </div>
        <ul className="tips-list">
          <li>
            <i className="fa fa-check-circle"></i>
            High growth area with strong rental demand
          </li>
          <li>
            <i className="fa fa-check-circle"></i>
            Infrastructure development planned for 2025
          </li>
          <li>
            <i className="fa fa-check-circle"></i>
            Property values increased 15% year-over-year
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <button className="investment-cta">
        <i className="fa fa-calculator"></i>
        Calculate Your Returns
      </button>
    </div>
  );
}
