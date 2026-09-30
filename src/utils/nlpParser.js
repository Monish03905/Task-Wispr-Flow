// Real-time Semantic Classifier and Voice Command Parser

export function parseSpokenInput(rawText) {
  if (!rawText || !rawText.trim()) return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Direct Spoken Voice Commands
  if (lower === 'clear canvas' || lower === 'clear all' || lower === 'reset board') {
    return { isCommand: true, command: 'CLEAR_CANVAS' };
  }
  if (lower.includes('export prd') || lower.includes('download prd')) {
    return { isCommand: true, command: 'EXPORT_PRD' };
  }
  if (lower.includes('export linear') || lower.includes('export github') || lower.includes('export tickets')) {
    return { isCommand: true, command: 'EXPORT_TICKETS' };
  }
  if (lower.includes('switch mode') || lower.includes('toggle theme')) {
    return { isCommand: true, command: 'TOGGLE_THEME' };
  }

  // 2. Classify Category
  let category = 'note';
  let priority = 'P2'; // Default medium

  const actionKeywords = [
    'action item', 'action:', 'todo', 'to do', 'need to', 'we must', 'we should',
    'implement', 'create', 'build', 'write', 'configure', 'deploy', 'ship',
    'assign', 'task', 'integrate', 'refactor'
  ];

  const archKeywords = [
    'architecture', 'architectural', 'decision', 'we will use', 'decouple',
    'database', 'postgres', 'redis', 'pub-sub', 'event-driven', 'microservice',
    'schema', 'graphql', 'rest api', 'webrtc', 'protocol', 'pattern', 'design',
    'migrate', 'infrastructure', 'serverless'
  ];

  const bugKeywords = [
    'bug', 'issue', 'defect', 'fails', 'broken', 'breaks', 'crash', 'crashing',
    'error', 'leak', 'starvation', 'vulnerability', 'regression', 'timeout',
    'flaky', 'exception'
  ];

  const insightKeywords = [
    'insight', 'hypothesis', 'discovered', 'noticed', 'metric shows',
    'user research', 'feedback', 'retention', 'data points', 'observed',
    'takeaway', 'root cause'
  ];

  if (bugKeywords.some(kw => lower.includes(kw))) {
    category = 'bug';
    priority = 'P1';
  } else if (archKeywords.some(kw => lower.includes(kw))) {
    category = 'architecture';
    priority = 'P1';
  } else if (actionKeywords.some(kw => lower.includes(kw))) {
    category = 'action';
    priority = 'P2';
  } else if (insightKeywords.some(kw => lower.includes(kw))) {
    category = 'insight';
    priority = 'P3';
  }

  // 3. Extract Priority Overrides
  if (lower.includes('p0') || lower.includes('blocker') || lower.includes('critical') || lower.includes('urgent') || lower.includes('asap')) {
    priority = 'P0';
  } else if (lower.includes('p1') || lower.includes('high priority') || lower.includes('important')) {
    priority = 'P1';
  } else if (lower.includes('p3') || lower.includes('low priority') || lower.includes('nice to have') || lower.includes('later')) {
    priority = 'P3';
  }

  // 4. Extract Smart Automatic Tags
  const detectedTags = [];
  const tagMappings = {
    auth: ['auth', 'login', 'jwt', 'oauth', 'session', 'security'],
    database: ['database', 'postgres', 'sql', 'redis', 'cache', 'storage'],
    api: ['api', 'endpoint', 'rest', 'graphql', 'http', 'webrtc'],
    frontend: ['frontend', 'ui', 'css', 'react', 'visual', 'client', 'browser'],
    backend: ['backend', 'server', 'worker', 'queue', 'proxy'],
    devops: ['deploy', 'docker', 'ci/cd', 'alert', 'monitoring', 'posthog', 'datadog'],
    growth: ['conversion', 'retention', 'sales', 'growth', 'launch', 'marketing']
  };

  Object.entries(tagMappings).forEach(([tag, matches]) => {
    if (matches.some(m => lower.includes(m))) {
      detectedTags.push(tag);
    }
  });

  if (detectedTags.length === 0) {
    detectedTags.push(category);
  }

  // 5. Clean up title vs description
  // Clean prefixes if speaker said "Action item:", "Critical decision:", "High priority bug:", etc.
  let cleanText = text
    .replace(/^(action item:?|action:?|todo:?|architecture decision:?|critical decision:?|architecture:?|decision:?|bug detected:?|high priority bug:?|urgent bug:?|bug:?|p0 bug:?|p1 bug:?|p0 action item:?|p1 action item:?|insight:?|root cause insight:?)\s*/i, '')
    .trim();

  // Capitalize first letter
  cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

  // Generate crisp title and expanded body
  let title = cleanText;
  let detail = cleanText;

  const sentenceSplit = cleanText.split(/(?<=[.?!])\s+/);
  if (sentenceSplit.length > 1) {
    title = sentenceSplit[0].replace(/[.?!]$/, '');
    detail = sentenceSplit.slice(1).join(' ');
  } else {
    // If single sentence, use full clean sentence as title, and full context as detail
    title = cleanText.replace(/[.?!]$/, '');
    detail = cleanText;
  }

  return {
    isCommand: false,
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    raw: text,
    title,
    detail,
    category,
    priority,
    status: category === 'action' ? 'todo' : 'active',
    tags: detectedTags.slice(0, 3),
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: Date.now()
  };
}
