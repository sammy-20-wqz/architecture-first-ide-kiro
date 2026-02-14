export interface SkillData {
  name: string;
  key: string;
  score: number;
  evidence: string[];
  improvement: string;
  icon: string;
}

export interface SkillProfile {
  user_id: string;
  username: string;
  level: string;
  overall_score: number;
  skills: SkillData[];
  recent_activity: Activity[];
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'challenge_completed' | 'error_fixed' | 'pattern_detected' | 'skill_improved';
  description: string;
  skill_change: number;
  skill_name: string;
}

export interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starter_code: string;
  objectives: string[];
  hints: string[];
  test_cases: Array<{ input: string; expected: string; passed?: boolean }>;
}

export interface HeatmapIssue {
  id: string;
  line_start: number;
  line_end: number;
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  impact: string;
  suggestion: string;
  auto_fix_available: boolean;
}

export interface HeatmapFile {
  file_path: string;
  code: string;
  issues: HeatmapIssue[];
  overall_accessibility_score: number;
}

export interface DesignNode {
  id: string;
  type: 'client' | 'api' | 'db' | 'cache' | 'queue' | 'service' | 'external';
  label: string;
  position: { x: number; y: number };
}

export interface DesignEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProgressData {
  timestamp: string;
  error_handling: number;
  system_design: number;
  security: number;
  decoupling: number;
  performance: number;
  inclusion: number;
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  skill_points: number;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: 'analyzer' | 'adversary' | 'critic' | 'tutor';
}

export type ChatMode = 'analyzer' | 'adversary' | 'critic' | 'tutor';
