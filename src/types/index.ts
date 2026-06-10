export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: string;
  avatar: string;
  isFeatured: boolean;
  likes: number;
  createdAt: string;
  isTemp?: boolean;
  sessionId?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  heat: number;
  brand: string;
  model: string;
  isPinned: boolean;
  isWaterPost: boolean;
  comments: Comment[];
  createdAt: string;
  tags: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface PhoneSpecs {
  screen: string;
  processor: string;
  ram: string;
  storage: string;
  battery: string;
  charging: string;
  camera: string;
  frontCamera: string;
  weight: string;
  os: string;
  connectivity: string;
}

export interface PhoneRatings {
  performance: number;
  camera: number;
  battery: number;
  display: number;
  value: number;
  design: number;
}

export interface PhoneModel {
  id: string;
  brandId: string;
  name: string;
  image: string;
  price: number;
  releaseDate: string;
  isNew: boolean;
  specs: PhoneSpecs;
  ratings: PhoneRatings;
}

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  type: 'single' | 'multiple';
  options: VoteOption[];
  isActive: boolean;
  isPaused: boolean;
  isFeatured: boolean;
  order: number;
  endAt: string;
  totalVotes: number;
  isTemp?: boolean;
  sessionId?: string;
}

export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface Question {
  id: string;
  content: string;
  author: string;
  status: QuestionStatus;
  isAnswered: boolean;
  answer?: string;
  answerAuthor?: string;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  color: string;
  tags: string[];
  brand?: string;
  budget?: string;
  isTemp?: boolean;
  sessionId?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  posts: number;
  interactions: number;
  level: number;
  badge: string;
}

export type ThemeMode = 'dark' | 'light' | 'cyber';

export interface SensitiveWordHit {
  word: string;
  count: number;
  lastHitAt: string;
}

export interface Session {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  color: string;
}

export interface HostPlaylistItem {
  id: string;
  type: 'vote' | 'question';
  refId: string;
  order: number;
  title: string;
}

export interface LiveMetricPoint {
  time: string;
  newQuestions: number;
  voterCount: number;
  commentHeat: number;
  sensitiveHits: number;
}

export interface ExportSummary {
  exportTime: string;
  sessionId?: string;
  sessionName?: string;
  timeRange: { start: string; end: string };
  statistics: {
    totalPosts: number;
    totalComments: number;
    tempComments: number;
    totalVotes: number;
    totalVoters: number;
    totalQuestions: number;
    pendingQuestions: number;
    approvedQuestions: number;
    answeredQuestions: number;
    tempQuestions: number;
    sensitiveWordHits: number;
  };
  hotPosts: Array<{ title: string; heat: number; author: string; comments: number; tags: string[] }>;
  topUsers: Array<{ name: string; interactions: number; posts: number; level: number; badge: string }>;
  voteResults: Array<{
    id: string;
    title: string;
    description: string;
    type: 'single' | 'multiple';
    totalVotes: number;
    isFeatured: boolean;
    isPaused: boolean;
    isTemp: boolean;
    options: Array<{ label: string; votes: number; percentage: number }>;
  }>;
  featuredQuestions: Array<{
    content: string;
    author: string;
    answer?: string;
    answerAuthor?: string;
    tags: string[];
    brand?: string;
    budget?: string;
  }>;
  allQuestions: Array<{
    content: string;
    author: string;
    isAnswered: boolean;
    answer?: string;
    answerAuthor?: string;
    isPinned: boolean;
    createdAt: string;
    tags: string[];
  }>;
  sensitiveWordStats: Array<{ word: string; hits: number; lastHitAt: string }>;
}
