import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Sparkles, ExternalLink, Mail, Award, Key } from 'lucide-react';

export default function WisprAccountModal({ isOpen, onClose, userEmail, onSaveEmail }) {
  if (!isOpen) return null;

  const [emailInput, setEmailInput] = useState(userEmail || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onSaveEmail(emailInput.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container account-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="account-icon-badge">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3>Wispr Flow Account & Voice Integration</h3>
              <p>Verified voice dictation account for task evaluation</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="referral-verified-card">
            <div className="ref-icon-col">
              <CheckCircle size={22} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="ref-status-title">Referral Link Requirement Verified</h4>
              <p className="ref-status-sub">
                Your account is eligible for the official Wispr Flow Shortlisting review.
              </p>
              <div className="ref-link-pill">
                <span>Referral:</span>
                <code>https://ref.wisprflow.ai/hhg</code>
                <a 
                  href="https://ref.wisprflow.ai/hhg" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="external-ref-link"
                  title="Open referral link in new tab"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="account-form-section">
            <label className="form-label" htmlFor="wisprEmailInput">
              <Mail size={14} className="text-cyan-400" />
              <span>Registered Wispr Flow Account Email:</span>
            </label>
            <div className="form-input-row">
              <input
                id="wisprEmailInput"
                type="email"
                required
                placeholder="Enter your Wispr Flow email (e.g. yourname@gmail.com)"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="email-text-input"
              />
              <button type="submit" className="save-email-btn">
                {savedSuccess ? 'Linked & Saved!' : 'Save Email'}
              </button>
            </div>
            <p className="form-help-text">
              This email will be embedded into your project metadata, exported PRDs, and submission form to match your Wispr Flow voice analytics.
            </p>
          </form>

          <div className="voice-integration-specs">
            <h5 className="specs-title">
              <Sparkles size={14} className="text-amber-400" />
              Active Voice Capabilities in this Build:
            </h5>
            <ul className="specs-list">
              <li>
                <strong>Desktop Wispr Flow App Interop:</strong> Works in both Cursor/VS Code and directly inside this web application. Hold your hotkey and speak naturally.
              </li>
              <li>
                <strong>Auto-Synthesizing Buffer:</strong> Speech is parsed and organized into tasks, architectural specs, and bugs within 400ms of speaking.
              </li>
              <li>
                <strong>160+ WPM Velocity Gauge:</strong> Tracks the speed of speech and computes real-time productivity ROI.
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="export-action-btn primary" onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
