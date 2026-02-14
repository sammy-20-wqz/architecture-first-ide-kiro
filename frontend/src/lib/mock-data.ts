import { SkillProfile, Challenge, HeatmapFile, ProgressData, Milestone, ChatMessage } from './types';

export const mockSkillProfile: SkillProfile = {
  user_id: 'usr_001',
  username: 'DevForge User',
  level: 'Intermediate',
  overall_score: 68,
  skills: [
    {
      name: 'Error Handling',
      key: 'error_handling',
      score: 72,
      evidence: ['Implemented retry logic in API client', 'Added circuit breaker pattern', 'Created custom error hierarchy'],
      improvement: 'Practice graceful degradation patterns',
      icon: 'AlertTriangle',
    },
    {
      name: 'System Design',
      key: 'system_design',
      score: 65,
      evidence: ['Designed microservice architecture', 'Implemented event-driven communication'],
      improvement: 'Study CAP theorem trade-offs',
      icon: 'Layers',
    },
    {
      name: 'Security',
      key: 'security',
      score: 45,
      evidence: ['Added input validation on API endpoints'],
      improvement: 'Learn about OWASP Top 10 vulnerabilities',
      icon: 'Shield',
    },
    {
      name: 'Decoupling',
      key: 'decoupling',
      score: 78,
      evidence: ['Used dependency injection', 'Implemented observer pattern', 'Created plugin architecture'],
      improvement: 'Explore hexagonal architecture',
      icon: 'Unplug',
    },
    {
      name: 'Performance',
      key: 'performance',
      score: 55,
      evidence: ['Added caching layer', 'Optimized database queries'],
      improvement: 'Profile and optimize hot paths',
      icon: 'Zap',
    },
    {
      name: 'Inclusion',
      key: 'inclusion',
      score: 38,
      evidence: ['Added basic i18n support'],
      improvement: 'Implement offline-first patterns and reduce bundle size',
      icon: 'Globe',
    },
  ],
  recent_activity: [
    { id: '1', timestamp: '2026-02-12T14:30:00Z', type: 'challenge_completed', description: 'Completed "Rate Limiter" challenge', skill_change: 15, skill_name: 'System Design' },
    { id: '2', timestamp: '2026-02-12T11:00:00Z', type: 'error_fixed', description: 'Fixed unhandled promise rejection in auth flow', skill_change: 8, skill_name: 'Error Handling' },
    { id: '3', timestamp: '2026-02-11T16:45:00Z', type: 'pattern_detected', description: 'Detected singleton anti-pattern in logger', skill_change: -5, skill_name: 'Decoupling' },
    { id: '4', timestamp: '2026-02-11T09:20:00Z', type: 'skill_improved', description: 'Learned about SQL injection prevention', skill_change: 12, skill_name: 'Security' },
    { id: '5', timestamp: '2026-02-10T15:00:00Z', type: 'challenge_completed', description: 'Completed "Cache Invalidation" challenge', skill_change: 10, skill_name: 'Performance' },
  ],
};

export const mockChallenges: Challenge[] = [
  {
    id: 'ch_001',
    type: 'rate_limit',
    title: 'Rate Limiter Design',
    description: 'Design and implement a distributed rate limiter that can handle 10,000 requests per second across multiple API gateway instances. The system must be fair, configurable, and handle edge cases like clock skew.',
    difficulty: 'hard',
    starter_code: `// Rate Limiter Implementation
class RateLimiter {
  constructor(config) {
    this.maxRequests = config.maxRequests || 100;
    this.windowMs = config.windowMs || 60000;
    // TODO: Implement distributed state
  }

  async isAllowed(clientId) {
    // TODO: Implement rate limiting logic
    return true;
  }

  async getRemainingRequests(clientId) {
    // TODO: Return remaining requests
    return this.maxRequests;
  }
}

module.exports = { RateLimiter };`,
    objectives: ['Implement sliding window algorithm', 'Add distributed state with Redis', 'Handle clock skew between nodes', 'Add configurable rate limits per client'],
    hints: ['Consider using a sliding window log or counter', 'Redis MULTI/EXEC for atomic operations', 'Use Lua scripts for atomic rate limit checks'],
    test_cases: [
      { input: '100 requests in 1 second', expected: 'First 100 pass, rest rejected' },
      { input: 'Requests across 2 nodes', expected: 'Consistent counting' },
      { input: 'Window expiry', expected: 'Counter resets after window' },
    ],
  },
  {
    id: 'ch_002',
    type: 'sql_injection',
    title: 'SQL Injection Defense',
    description: 'Your e-commerce API has a critical SQL injection vulnerability in the product search endpoint. Fix the vulnerability without breaking existing functionality.',
    difficulty: 'medium',
    starter_code: `// Vulnerable Product Search API
app.get('/api/products', async (req, res) => {
  const { search, category, sort } = req.query;
  
  // WARNING: This is vulnerable!
  const query = \`
    SELECT * FROM products 
    WHERE name LIKE '%\${search}%'
    AND category = '\${category}'
    ORDER BY \${sort}
  \`;
  
  const results = await db.query(query);
  res.json(results);
});`,
    objectives: ['Identify all injection points', 'Use parameterized queries', 'Validate and sanitize input', 'Add query builder pattern'],
    hints: ['Use prepared statements', 'Whitelist allowed sort columns'],
    test_cases: [
      { input: "search='; DROP TABLE products;--", expected: 'Query safely rejected' },
      { input: 'search=laptop&category=electronics', expected: 'Valid results returned' },
    ],
  },
  {
    id: 'ch_003',
    type: 'latency',
    title: 'Database Latency Fix',
    description: 'Your dashboard API endpoint is taking 8 seconds to load. Users are complaining. Optimize the queries and add caching to bring response time under 200ms.',
    difficulty: 'easy',
    starter_code: `// Slow Dashboard API
app.get('/api/dashboard', async (req, res) => {
  const userId = req.user.id;
  
  // These queries run sequentially - very slow!
  const profile = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
  const reviews = await db.query('SELECT * FROM reviews WHERE user_id = ?', [userId]);
  const recommendations = await getRecommendations(userId);
  
  res.json({ profile, orders, reviews, recommendations });
});`,
    objectives: ['Parallelize independent queries', 'Add caching layer', 'Optimize query with proper indexes', 'Add response compression'],
    hints: ['Use Promise.all for parallel queries', 'Consider Redis for caching'],
    test_cases: [
      { input: 'GET /api/dashboard', expected: 'Response < 200ms' },
      { input: 'Repeated requests', expected: 'Cache hit on second request' },
    ],
  },
];

export const mockHeatmapFile: HeatmapFile = {
  file_path: 'src/api/userService.js',
  code: `import axios from 'axios';
import { format } from 'date-fns';

const API_URL = 'https://api.example.com';

export async function fetchUserProfile(userId) {
  const response = await axios.get(\`\${API_URL}/users/\${userId}\`);
  return response.data;
}

export function formatUserDate(date) {
  return format(new Date(date), 'MM/dd/yyyy hh:mm a');
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await axios.post(\`\${API_URL}/upload\`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export function getGreeting() {
  return "Welcome back! Here's your dashboard.";
}

export async function fetchAnalytics() {
  const response = await axios.get(\`\${API_URL}/analytics\`, {
    params: { range: '30d', timezone: 'America/New_York' },
  });
  return response.data;
}

export function calculatePrice(amount) {
  return '$' + amount.toFixed(2);
}

export async function searchProducts(query) {
  const response = await axios.get(\`\${API_URL}/search?q=\${query}\`);
  return response.data;
}`,
  issues: [
    { id: 'i1', line_start: 11, line_end: 13, severity: 'medium', type: 'Timezone Naive', description: 'Hardcoded date format assumes US locale', impact: 'Excludes 60% of non-US users', suggestion: 'Use Intl.DateTimeFormat with user locale', auto_fix_available: true },
    { id: 'i2', line_start: 15, line_end: 22, severity: 'high', type: 'Bandwidth Heavy', description: 'File upload has no size limit or compression', impact: 'Excludes 50% of users on 3G connections', suggestion: 'Add file size limit and image compression before upload', auto_fix_available: false },
    { id: 'i3', line_start: 25, line_end: 27, severity: 'medium', type: 'Localization Blind', description: 'Hardcoded English greeting string', impact: 'Excludes non-English speaking users', suggestion: 'Use i18n library with translation keys', auto_fix_available: true },
    { id: 'i4', line_start: 29, line_end: 33, severity: 'high', type: 'Timezone Naive', description: 'Hardcoded timezone in analytics query', impact: 'Shows wrong data for 75% of global users', suggestion: "Pass user's timezone from client", auto_fix_available: true },
    { id: 'i5', line_start: 36, line_end: 38, severity: 'low', type: 'Localization Blind', description: 'Hardcoded dollar sign currency format', impact: 'Confusing for non-USD users', suggestion: 'Use Intl.NumberFormat with user currency', auto_fix_available: true },
    { id: 'i6', line_start: 6, line_end: 9, severity: 'high', type: 'Offline Fragile', description: 'No error handling or caching for user profile fetch', impact: 'App crashes when offline', suggestion: 'Add try/catch, retry logic, and cache-first strategy', auto_fix_available: false },
    { id: 'i7', line_start: 40, line_end: 43, severity: 'medium', type: 'Mobile Hostile', description: 'Search query not debounced, fires on every keystroke', impact: 'Drains battery and data on mobile devices', suggestion: 'Add debounce and minimum query length', auto_fix_available: true },
  ],
  overall_accessibility_score: 42,
};

export const mockProgressData: ProgressData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-01-14');
  date.setDate(date.getDate() + i);
  const noise = () => Math.floor(Math.random() * 8 - 4);
  return {
    timestamp: date.toISOString().split('T')[0],
    error_handling: Math.min(100, Math.max(0, 45 + Math.floor(i * 0.9) + noise())),
    system_design: Math.min(100, Math.max(0, 40 + Math.floor(i * 0.85) + noise())),
    security: Math.min(100, Math.max(0, 25 + Math.floor(i * 0.7) + noise())),
    decoupling: Math.min(100, Math.max(0, 55 + Math.floor(i * 0.8) + noise())),
    performance: Math.min(100, Math.max(0, 35 + Math.floor(i * 0.7) + noise())),
    inclusion: Math.min(100, Math.max(0, 20 + Math.floor(i * 0.6) + noise())),
  };
});

export const mockMilestones: Milestone[] = [
  { id: 'm1', date: '2026-01-20', title: 'First Challenge Completed', description: 'Completed your first adversarial challenge', skill_points: 25, icon: 'Trophy' },
  { id: 'm2', date: '2026-01-28', title: 'Security Awareness', description: 'Detected and fixed first SQL injection', skill_points: 30, icon: 'Shield' },
  { id: 'm3', date: '2026-02-03', title: '7-Day Streak', description: 'Practiced for 7 consecutive days', skill_points: 50, icon: 'Flame' },
  { id: 'm4', date: '2026-02-08', title: 'Architecture Pro', description: 'Designed a complete microservice system', skill_points: 40, icon: 'Layers' },
  { id: 'm5', date: '2026-02-11', title: 'Inclusion Champion', description: 'Fixed 10 accessibility issues', skill_points: 35, icon: 'Globe' },
];

export const mockChatMessages: ChatMessage[] = [
  { id: 'c1', role: 'system', content: 'DevForge AI initialized. Select a mode to get started.', timestamp: '2026-02-12T10:00:00Z' },
  { id: 'c2', role: 'user', content: 'Analyze my rate limiter implementation', timestamp: '2026-02-12T10:05:00Z' },
  { id: 'c3', role: 'assistant', content: "Your rate limiter uses a fixed window counter, which has a burst problem at window boundaries. Consider using a sliding window log or token bucket algorithm for smoother rate limiting.\n\n```typescript\n// Suggested: Token Bucket\nclass TokenBucket {\n  tokens: number;\n  lastRefill: number;\n  \n  consume(): boolean {\n    this.refill();\n    if (this.tokens > 0) {\n      this.tokens--;\n      return true;\n    }\n    return false;\n  }\n}\n```", timestamp: '2026-02-12T10:05:30Z', mode: 'analyzer' },
  { id: 'c4', role: 'user', content: 'What about distributed scenarios?', timestamp: '2026-02-12T10:08:00Z' },
  { id: 'c5', role: 'assistant', content: "Great question! In distributed systems, you need centralized state. Redis is ideal:\n\n1. **Atomic operations** via Lua scripts\n2. **TTL-based expiry** for automatic cleanup\n3. **Cluster mode** for high availability\n\nBut here's the challenge: what happens during a Redis failover? Your rate limiter could briefly allow excess traffic. How would you handle that?", timestamp: '2026-02-12T10:08:30Z', mode: 'adversary' },
];
