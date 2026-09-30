import React from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Download, 
  HelpCircle, 
  Trash2, 
  Zap, 
  Activity,
  Play,
  Award,
  ShieldCheck
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../utils/speechEngine';

export default function Navbar({
  isListening,
  isSimulating,
  onToggleMic,
  onStartScenario,
  onOpenExport,
  onOpenGuide,
  onOpenAccount,
  userWisprEmail,
  onClear,
  wpm,
  itemCount
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <div className="logo-icon-wrap">
          <div className="pulse-beacon" />
          <Mic className="logo-mic-icon" size={22} />
        </div>
        <div>
          <div className="brand-title-row">
            <span className="brand-name">VoxFlow</span>
            <span className="brand-tag">Studio</span>
            <button 
              className="wispr-badge clickable-badge"
              onClick={onOpenAccount}
              title="View Wispr Flow Account & Voice Integration"
            >
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>{userWisprEmail ? `Wispr: ${userWisprEmail.split('@')[0]}` : 'Wispr Flow Linked'}</span>
            </button>
          </div>
          <p className="brand-subtitle">Voice-Native Cognitive Command Center</p>
        </div>
      </div>

      <div className="navbar-center-metrics">
        <div className={`status-pill ${isListening ? 'listening' : 'idle'}`}>
          <span className="status-dot" />
          <span>{isSimulating ? 'Voice Stream Active' : isListening ? 'Listening Live' : 'Voice Standby'}</span>
        </div>

        <div className="metric-pill">
          <Activity size={14} className="metric-icon" />
          <span className="metric-val">{wpm > 0 ? `${wpm} WPM` : '160 WPM est.'}</span>
          <span className="metric-sub">Velocity</span>
        </div>

        <div className="metric-pill">
          <Zap size={14} className="metric-icon gold" />
          <span className="metric-val">{itemCount}</span>
          <span className="metric-sub">Concepts</span>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Preset scenario dropdown */}
        <div className="preset-selector-wrap">
          <select 
            className="preset-select"
            onChange={(e) => {
              if (e.target.value) {
                onStartScenario(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            aria-label="Load curated voice scenario"
          >
            <option value="" disabled>▶ Try Preset Scenario...</option>
            {PRESET_SCENARIOS.map(sc => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="nav-btn secondary-btn"
          onClick={onOpenGuide}
          title="Voice-Driven Development Build Guide"
        >
          <Award size={16} />
          <span>Build Script</span>
        </button>

        <button 
          className="nav-btn primary-btn"
          onClick={onOpenExport}
          title="Export PRD, Linear Tickets, Email Brief"
        >
          <Download size={16} />
          <span>Export Hub</span>
        </button>

        {itemCount > 0 && (
          <button 
            className="nav-btn danger-icon-btn"
            onClick={onClear}
            title="Clear all cards"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
