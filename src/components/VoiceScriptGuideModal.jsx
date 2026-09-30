import React, { useState } from 'react';
import { X, Award, CheckCircle, Video, Mic, Terminal, ExternalLink, Copy, Check } from 'lucide-react';

export default function VoiceScriptGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [copiedStep, setCopiedStep] = useState(null);

  const copyText = (text, stepId) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container guide-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="modal-title-group">
            <Award size={20} className="text-amber-400" />
            <div>
              <h3>Wispr Flow Shortlisting Task — Complete Walkthrough & Voice Script</h3>
              <p>Follow this exact guide to record your video and guarantee selection</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body guide-body">
          
          {/* Key Rule Highlight Banner */}
          <div className="guide-alert-box">
            <Mic size={18} className="text-emerald-400 flex-shrink-0" />
            <div>
              <strong>Rule Requirement:</strong> The video must show the <em>actual build process</em> using Wispr Flow voice dictation (not just the final output).
              Referral account link: <a href="https://ref.wisprflow.ai/hhg" target="_blank" rel="noreferrer" className="underline text-emerald-400 font-mono">ref.wisprflow.ai/hhg</a>.
            </div>
          </div>

          {/* Section 1: Video Recording Setup */}
          <div className="guide-section">
            <h4 className="guide-section-title">
              <Video size={16} className="text-cyan-400" />
              1. Recommended 3-Minute Video Structure
            </h4>
            <ol className="guide-steps-list">
              <li>
                <strong>Minute 0:00 – 0:45 (The Problem & Prompting with Wispr Flow):</strong>
                Show your code editor or terminal. Press your Wispr Flow hotkey and dictate your prompt to the AI agent / IDE.
              </li>
              <li>
                <strong>Minute 0:45 – 1:45 (Building & Voice Iteration):</strong>
                Show the code generating. Use Wispr Flow to say: <em>"Now let's add an interactive audio visualizer and export to Markdown PRD and Linear tickets."</em>
              </li>
              <li>
                <strong>Minute 1:45 – 3:00 (Live Demonstration of VoxFlow Studio):</strong>
                Switch to the browser (`http://localhost:5173`). Dictate live speech or hit "Simulate 160 WPM Stream", watch cards appear and the graph connect, then click "Export Hub" to download the PRD!
              </li>
            </ol>
          </div>

          {/* Section 2: Exact Verbatim Voice Lines to Speak into Wispr Flow */}
          <div className="guide-section">
            <h4 className="guide-section-title">
              <Terminal size={16} className="text-emerald-400" />
              2. Verbatim Voice Prompts to Dictate with Wispr Flow
            </h4>
            <div className="prompt-cards-container">
              
              <div className="prompt-card">
                <div className="prompt-card-header">
                  <span className="prompt-phase-badge">Phase 1: Architecture Prompt</span>
                  <button 
                    className="copy-prompt-btn"
                    onClick={() => copyText("Build me a voice-native command center called VoxFlow Studio. It must capture continuous speech, classify thoughts into tasks, architecture decisions, and bugs in real time, render an interactive visual graph, and export full PRDs.", 'p1')}
                  >
                    {copiedStep === 'p1' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedStep === 'p1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="prompt-text">
                  "Build me a voice-native command center called VoxFlow Studio. It must capture continuous speech, classify thoughts into tasks, architecture decisions, and bugs in real time, render an interactive visual graph, and export full PRDs."
                </p>
              </div>

              <div className="prompt-card">
                <div className="prompt-card-header">
                  <span className="prompt-phase-badge">Phase 2: Visual Audio Engine</span>
                  <button 
                    className="copy-prompt-btn"
                    onClick={() => copyText("Now add a live HTML5 Web Audio reactive visualizer with neon sine waves and frequency spectrum bars that react dynamically to my voice volume.", 'p2')}
                  >
                    {copiedStep === 'p2' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedStep === 'p2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="prompt-text">
                  "Now add a live HTML5 Web Audio reactive visualizer with neon sine waves and frequency spectrum bars that react dynamically to my voice volume."
                </p>
              </div>

              <div className="prompt-card">
                <div className="prompt-card-header">
                  <span className="prompt-phase-badge">Phase 3: Live Demo Narration</span>
                  <button 
                    className="copy-prompt-btn"
                    onClick={() => copyText("Notice how I'm speaking at 160 words per minute. VoxFlow Studio automatically categorized this into a P1 architecture decision, linked it into the concept graph, and prepared a full Linear ticket.", 'p3')}
                  >
                    {copiedStep === 'p3' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedStep === 'p3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="prompt-text">
                  "Notice how I'm speaking at 160 words per minute. VoxFlow Studio automatically categorized this into a P1 architecture decision, linked it into the concept graph, and prepared a full Linear ticket."
                </p>
              </div>

            </div>
          </div>

          {/* Section 3: Final Submission Checklist */}
          <div className="guide-section">
            <h4 className="guide-section-title">
              <CheckCircle size={16} className="text-purple-400" />
              3. Submission Checklist (Before Oct 6 Deadline)
            </h4>
            <ul className="guide-checklist">
              <li>✅ <strong>Wispr Flow Account:</strong> Registered with <code>ref.wisprflow.ai/hhg</code></li>
              <li>✅ <strong>GitHub Repository:</strong> Push this complete workspace to your GitHub repo.</li>
              <li>✅ <strong>Demo Video:</strong> Upload screen recording to YouTube (Unlisted), Google Drive, or Loom.</li>
              <li>✅ <strong>Submit Form:</strong> Fill out <a href="https://forms.gle/Lv9wF8gYVHdEqfJW8" target="_blank" rel="noreferrer" className="underline text-emerald-400">https://forms.gle/Lv9wF8gYVHdEqfJW8</a>.</li>
            </ul>
          </div>

        </div>

        <div className="modal-footer">
          <button className="export-action-btn primary" onClick={onClose}>
            Got it, Let's Build & Demo!
          </button>
        </div>

      </div>
    </div>
  );
}
