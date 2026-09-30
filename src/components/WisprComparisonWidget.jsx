import React, { useState } from 'react';
import { Zap, Clock, TrendingUp, Sparkles, Award } from 'lucide-react';

export default function WisprComparisonWidget({ currentWpm }) {
  const [minutesPerDay, setMinutesPerDay] = useState(30);

  // Math: 
  // Typing = 40 words/min
  // Wispr Flow = 160 words/min
  // For 'M' minutes of voice dictation:
  // Words generated = M * 160
  // Time needed to type those words = (M * 160) / 40 = M * 4 minutes
  // Minutes saved per day = (M * 4) - M = 3 * M minutes
  // Hours saved per month (22 work days) = (3 * M * 22) / 60 = 1.1 * M hours
  const hoursSavedMonth = Math.round((3 * minutesPerDay * 22) / 60);
  const wordsDictated = minutesPerDay * 160;

  return (
    <div className="wispr-roi-card">
      <div className="roi-header">
        <div className="roi-title-row">
          <div className="roi-badge">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Wispr Flow Advantage</span>
          </div>
          <span className="roi-stat-tag">4.0x Speed Multiplier</span>
        </div>
        <h3>Spoken Cognition vs. Manual Typing</h3>
        <p className="roi-subtitle">
          Human speech naturally flows at 150–180 words per minute. Wispr Flow eliminates the mechanical keyboard bottleneck.
        </p>
      </div>

      <div className="velocity-comparison-bars">
        <div className="velocity-row">
          <div className="velocity-label">
            <span>Wispr Flow Voice</span>
            <span className="velocity-number voice-text">{currentWpm || 160} WPM</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill voice-bar" style={{ width: '92%' }}>
              <span className="bar-glow" />
            </div>
          </div>
        </div>

        <div className="velocity-row">
          <div className="velocity-label">
            <span>Average Keyboard Typing</span>
            <span className="velocity-number typing-text">40 WPM</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill typing-bar" style={{ width: '25%' }} />
          </div>
        </div>
      </div>

      <div className="roi-calculator">
        <div className="calc-slider-header">
          <span>Daily Voice Brainstorming Time:</span>
          <span className="calc-minutes-val">{minutesPerDay} mins/day</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="120" 
          step="5" 
          value={minutesPerDay}
          onChange={(e) => setMinutesPerDay(Number(e.target.value))}
          className="roi-slider"
        />

        <div className="roi-output-grid">
          <div className="roi-metric-box">
            <Clock size={16} className="text-cyan-400 mb-1" />
            <span className="roi-metric-num">~{hoursSavedMonth} hrs</span>
            <span className="roi-metric-desc">Saved / Month</span>
          </div>
          <div className="roi-metric-box">
            <TrendingUp size={16} className="text-emerald-400 mb-1" />
            <span className="roi-metric-num">{wordsDictated.toLocaleString()}</span>
            <span className="roi-metric-desc">Words Expressed / Day</span>
          </div>
          <div className="roi-metric-box">
            <Zap size={16} className="text-amber-400 mb-1" />
            <span className="roi-metric-num">75%</span>
            <span className="roi-metric-desc">Friction Reduced</span>
          </div>
        </div>
      </div>

      <div className="wispr-quote-footer">
        <Award size={14} className="text-emerald-400 flex-shrink-0" />
        <p>
          "Thinking out loud preserves natural cognitive momentum. You design systems at the speed of thought."
        </p>
      </div>
    </div>
  );
}
