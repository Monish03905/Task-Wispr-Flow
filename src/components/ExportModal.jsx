import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  CheckSquare, 
  Mail, 
  GitBranch, 
  Code,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  generatePRDMarkdown, 
  generateLinearIssues, 
  generateExecutiveEmail, 
  generateMermaidDiagram 
} from '../utils/exportFormats';
import { sound } from '../utils/audioSynthesizer';

export default function ExportModal({ isOpen, onClose, items, wpm }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('prd');
  const [copied, setCopied] = useState(false);

  const sessionStats = {
    wpm: wpm || 160,
    timeSaved: `${Math.round(items.length * 1.5)} minutes`
  };

  const getExportContent = () => {
    switch (activeTab) {
      case 'prd':
        return {
          text: generatePRDMarkdown(items, sessionStats),
          filename: 'VOXFLOW_PRD.md',
          mime: 'text/markdown'
        };
      case 'linear':
        return {
          text: generateLinearIssues(items),
          filename: 'LINEAR_GITHUB_ISSUES.md',
          mime: 'text/markdown'
        };
      case 'email':
        return {
          text: generateExecutiveEmail(items, sessionStats),
          filename: 'EXECUTIVE_BRIEF.txt',
          mime: 'text/plain'
        };
      case 'mermaid':
        return {
          text: generateMermaidDiagram(items),
          filename: 'ARCHITECTURE_DIAGRAM.mmd',
          mime: 'text/plain'
        };
      case 'json':
        return {
          text: JSON.stringify({ items, exportedAt: new Date().toISOString(), stats: sessionStats }, null, 2),
          filename: 'voxflow_session.json',
          mime: 'application/json'
        };
      default:
        return { text: '', filename: 'export.txt', mime: 'text/plain' };
    }
  };

  const currentExport = getExportContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExport.text);
    setCopied(true);
    sound.playExportSuccess();

    // Trigger celebratory confetti burst!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    const blob = new Blob([currentExport.text], { type: currentExport.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentExport.filename;
    a.click();
    URL.revokeObjectURL(url);
    sound.playExportSuccess();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={18} className="text-emerald-400" />
            <div>
              <h3>Voice Export & Action Hub</h3>
              <p>Dispatch your synthesized speech to production assets</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'prd' ? 'active' : ''}`}
            onClick={() => setActiveTab('prd')}
          >
            <FileText size={14} />
            <span>PRD Document (.md)</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'linear' ? 'active' : ''}`}
            onClick={() => setActiveTab('linear')}
          >
            <CheckSquare size={14} />
            <span>Linear / GitHub Batch</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={14} />
            <span>Executive Email</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'mermaid' ? 'active' : ''}`}
            onClick={() => setActiveTab('mermaid')}
          >
            <GitBranch size={14} />
            <span>Mermaid Diagram</span>
          </button>
          <button 
            className={`modal-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            <Code size={14} />
            <span>JSON Backup</span>
          </button>
        </div>

        {/* Modal Content Preview */}
        <div className="modal-body">
          <pre className="export-code-preview">
            <code>{currentExport.text}</code>
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <span className="export-summary-text">
            Ready to export <strong>{items.length} items</strong> as <strong>{currentExport.filename}</strong>
          </span>

          <div className="modal-actions-row">
            <button className="export-action-btn secondary" onClick={handleDownload}>
              <Download size={14} />
              <span>Download File</span>
            </button>
            <button className="export-action-btn primary" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
