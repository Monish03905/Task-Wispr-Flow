import React, { useState, useEffect, useRef } from 'react';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

const CATEGORY_COLORS = {
  action: { bg: 'rgba(16, 185, 129, 0.2)', bgLight: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', textDark: '#34d399', glow: 'rgba(16, 185, 129, 0.4)' },
  architecture: { bg: 'rgba(59, 130, 246, 0.2)', bgLight: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', text: '#2563eb', textDark: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
  bug: { bg: 'rgba(239, 68, 68, 0.2)', bgLight: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#dc2626', textDark: '#f87171', glow: 'rgba(239, 68, 68, 0.4)' },
  insight: { bg: 'rgba(234, 179, 8, 0.2)', bgLight: 'rgba(234, 179, 8, 0.15)', border: '#eab308', text: '#d97706', textDark: '#facc15', glow: 'rgba(234, 179, 8, 0.4)' },
  note: { bg: 'rgba(148, 163, 184, 0.2)', bgLight: 'rgba(148, 163, 184, 0.15)', border: '#94a3b8', text: '#64748b', textDark: '#cbd5e1', glow: 'rgba(148, 163, 184, 0.4)' }
};

export default function ConceptGraphCanvas({ items, selectedId, onSelectNode, theme = 'light' }) {
  const isLight = theme === 'light';
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState({});

  // Compute layout positions for nodes
  useEffect(() => {
    const center = { x: 340, y: 220 };
    const radius = 175;
    const positions = {};

    items.forEach((item, index) => {
      const angle = (index / Math.max(1, items.length)) * 2 * Math.PI - Math.PI / 2;
      // Stagger radius slightly for organic visual rhythm
      const r = radius + (index % 2 === 0 ? 25 : -15);
      positions[item.id] = {
        x: center.x + r * Math.cos(angle),
        y: center.y + r * Math.sin(angle)
      };
    });

    setNodePositions(positions);
  }, [items]);

  const handleMouseDown = (e) => {
    // Only pan if clicking canvas background
    if (e.target.tagName === 'svg' || e.target.classList.contains('graph-canvas-bg')) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const centerNode = { x: 340, y: 220 };

  return (
    <div 
      className="concept-graph-wrapper"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="graph-toolbar">
        <div className="toolbar-title">
          <Layers size={14} />
          <span>Cognitive Node Graph</span>
          <span className="node-count-badge">{items.length} Nodes</span>
        </div>

        <div className="toolbar-controls">
          <button onClick={() => setZoom(z => Math.min(1.6, z + 0.15))} title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.6, z - 0.15))} title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <button onClick={resetView} title="Reset View">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <svg 
        className="graph-canvas-svg graph-canvas-bg"
        viewBox="0 0 680 440"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          {/* Radial gradient for center glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          {/* Filter for glowing node borders */}
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated Connecting Beziers */}
        {items.map((item) => {
          const pos = nodePositions[item.id] || centerNode;
          const styles = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.note;
          const isSelected = selectedId === item.id;

          const dx = pos.x - centerNode.x;
          const dy = pos.y - centerNode.y;
          const cx1 = centerNode.x + dx * 0.4;
          const cy1 = centerNode.y;
          const cx2 = centerNode.x + dx * 0.6;
          const cy2 = pos.y;
          const pathD = `M ${centerNode.x} ${centerNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pos.x} ${pos.y}`;

          return (
            <g key={`edge-${item.id}`}>
              <path
                d={pathD}
                stroke={isSelected ? styles.border : isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isSelected ? 2.5 : 1.2}
                fill="none"
                strokeDasharray={isSelected ? '4,4' : 'none'}
                className={isSelected ? 'pulsing-edge' : ''}
              />
              {/* Little moving photon packet */}
              <circle r="2" fill={styles.border}>
                <animateMotion path={pathD} dur={`${2 + (item.timestamp % 3)}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Central Core Wispr Node */}
        <g transform={`translate(${centerNode.x}, ${centerNode.y})`} className="core-hub-node">
          <circle r="36" fill="url(#centerGlow)" className="hub-pulse-halo" opacity={isLight ? 0.35 : 0.8} />
          <circle r="24" fill={isLight ? '#ffffff' : '#090d16'} stroke={isLight ? '#0284c7' : '#06b6d4'} strokeWidth="2.5" />
          <text 
            textAnchor="middle" 
            dy="-4" 
            fill={isLight ? '#0f172a' : '#e2e8f0'} 
            fontSize="10" 
            fontWeight="bold"
            fontFamily="Outfit, sans-serif"
          >
            VOXFLOW
          </text>
          <text 
            textAnchor="middle" 
            dy="10" 
            fill={isLight ? '#059669' : '#10b981'} 
            fontSize="8" 
            fontFamily="JetBrains Mono, monospace"
          >
            CORE
          </text>
        </g>

        {/* Radiating Concept Nodes */}
        {items.map((item) => {
          const pos = nodePositions[item.id] || centerNode;
          const styles = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.note;
          const isSelected = selectedId === item.id;
          const label = item.title.length > 20 ? item.title.slice(0, 18) + '...' : item.title;

          return (
            <g
              key={`node-${item.id}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="concept-node"
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(item.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x="-64"
                y="-18"
                width="128"
                height="36"
                rx="8"
                fill={isSelected ? (isLight ? styles.bgLight : styles.bg) : isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.88)'}
                stroke={styles.border}
                strokeWidth={isSelected ? 2 : 1.2}
                filter="url(#glowEffect)"
              />
              {/* Category indicator pip */}
              <circle cx="-52" cy="0" r="4" fill={styles.border} />

              {/* Title */}
              <text
                x="-42"
                y="3"
                fill={isLight ? '#0f172a' : '#f1f5f9'}
                fontSize="9"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {label}
              </text>

              {/* Priority badge */}
              <rect x="36" y="-12" width="22" height="12" rx="3" fill={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.4)'} />
              <text
                x="47"
                y="-3"
                textAnchor="middle"
                fill={isLight ? styles.text : styles.textDark}
                fontSize="7"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
              >
                {item.priority}
              </text>
            </g>
          );
        })}

        {items.length === 0 && (
          <text
            x="340"
            y="310"
            textAnchor="middle"
            fill={isLight ? '#64748b' : 'rgba(148, 163, 184, 0.6)'}
            fontSize="12"
            fontFamily="Inter, sans-serif"
          >
            Speak or simulate voice to watch concepts dynamically connect in real-time
          </text>
        )}
      </svg>
    </div>
  );
}
