export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: string;
  avatar: string;
  isFeatured: boolean;
  likes: number;
  createdAt: string;
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
  endAt: string;
  totalVotes: number;
}

export interface Question {
  id: string;
  content: string;
  author: string;
  isAnswered: boolean;
  answer?: string;
  answerAuthor?: string;
  isPinned: boolean;
  createdAt: string;
  color: string;
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
