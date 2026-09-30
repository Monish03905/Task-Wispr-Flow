import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  ShieldAlert, 
  Cpu, 
  Lightbulb, 
  FileText,
  Filter,
  Search
} from 'lucide-react';

const CATEGORY_META = {
  action: { label: 'Action Items', icon: CheckCircle2, color: 'text-emerald-400', badgeClass: 'badge-action' },
  architecture: { label: 'Architecture', icon: Cpu, color: 'text-blue-400', badgeClass: 'badge-arch' },
  bug: { label: 'Bugs / Vulnerabilities', icon: ShieldAlert, color: 'text-rose-400', badgeClass: 'badge-bug' },
  insight: { label: 'Insights', icon: Lightbulb, color: 'text-amber-400', badgeClass: 'badge-insight' },
  note: { label: 'Notes', icon: FileText, color: 'text-slate-400', badgeClass: 'badge-note' }
};

export default function StructuredCardsGrid({
  items,
  selectedId,
  onSelectNode,
  onToggleStatus,
  onDeleteItem
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const counts = {
    all: items.length,
    action: items.filter(i => i.category === 'action').length,
    architecture: items.filter(i => i.category === 'architecture').length,
    bug: items.filter(i => i.category === 'bug').length,
    insight: items.filter(i => i.category === 'insight').length
  };

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.detail && item.detail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleCopyCard = (item) => {
    const text = `[${item.priority}] ${item.title}\n${item.detail || item.raw}\nTags: ${item.tags.map(t => `#${t}`).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="cards-grid-section">
      {/* Tabs and Search Header */}
      <div className="cards-controls-header">
        <div className="category-tabs">
          <button 
            className={`cat-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All <span className="tab-pill">{counts.all}</span>
          </button>
          <button 
            className={`cat-tab ${activeTab === 'action' ? 'active' : ''}`}
            onClick={() => setActiveTab('action')}
          >
            🎯 Tasks <span className="tab-pill">{counts.action}</span>
          </button>
          <button 
            className={`cat-tab ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            🏛️ Architecture <span className="tab-pill">{counts.architecture}</span>
          </button>
          <button 
            className={`cat-tab ${activeTab === 'bug' ? 'active' : ''}`}
            onClick={() => setActiveTab('bug')}
          >
            🐛 Bugs <span className="tab-pill">{counts.bug}</span>
          </button>
          <button 
            className={`cat-tab ${activeTab === 'insight' ? 'active' : ''}`}
            onClick={() => setActiveTab('insight')}
          >
            💡 Insights <span className="tab-pill">{counts.insight}</span>
          </button>
        </div>

        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Filter concepts or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
        </div>
      </div>

      {/* Cards List */}
      {filteredItems.length === 0 ? (
        <div className="empty-cards-state">
          <Filter size={32} className="empty-icon" />
          <h3>No matching synthesized concepts</h3>
          <p>Dictate using the microphone or select a preset scenario from the top menu.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredItems.map(item => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.note;
            const Icon = meta.icon;
            const isSelected = selectedId === item.id;
            const isDone = item.status === 'done';

            return (
              <div 
                key={item.id}
                className={`concept-card ${meta.badgeClass} ${isSelected ? 'highlighted-card' : ''} ${isDone ? 'completed-card' : ''}`}
                onClick={() => onSelectNode(item.id)}
              >
                <div className="card-top-row">
                  <div className="card-badge-group">
                    <span className={`category-tag ${meta.badgeClass}`}>
                      <Icon size={12} />
                      <span>{meta.label}</span>
                    </span>
                    <span className={`priority-tag priority-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="card-actions-group">
                    <button 
                      className="card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCard(item);
                      }}
                      title="Copy card text"
                    >
                      {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                    <button 
                      className="card-action-btn danger-hover"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      title="Delete card"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h4 className="card-title">{item.title}</h4>

                {item.detail && (
                  <p className="card-detail">{item.detail}</p>
                )}

                <div className="card-bottom-row">
                  <div className="card-tags">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="hash-tag">#{tag}</span>
                    ))}
                  </div>

                  <div className="card-meta-right">
                    {item.category === 'action' && (
                      <button 
                        className={`status-toggle-btn ${isDone ? 'done' : 'pending'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(item.id);
                        }}
                        title="Toggle task completion"
                      >
                        {isDone ? (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Circle size={13} />
                            <span>Todo</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className="card-time">
                      <Clock size={11} />
                      {item.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
