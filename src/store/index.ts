import { create } from 'zustand';
import type { Post, Brand, PhoneModel, Vote, Question, User, Comment, ThemeMode } from '@/types';
import {
  mockPosts, mockBrands, mockModels, mockVotes, mockQuestions, mockUsers, defaultSensitiveWords,
} from '@/data/mockData';

interface AppState {
  posts: Post[];
  brands: Brand[];
  models: PhoneModel[];
  votes: Vote[];
  questions: Question[];
  users: User[];
  sensitiveWords: string[];
  theme: ThemeMode;
  selectedBrand: string | null;
  compareModels: string[];
  searchKeyword: string;
  filterWaterPost: boolean;
  userVotes: Record<string, string[]>;

  setTheme: (theme: ThemeMode) => void;
  setSelectedBrand: (brandId: string | null) => void;
  toggleCompareModel: (modelId: string) => void;
  clearCompareModels: () => void;
  setSearchKeyword: (keyword: string) => void;
  setFilterWaterPost: (filter: boolean) => void;

  addComment: (postId: string, content: string, author: string, avatar: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  toggleFeaturedComment: (postId: string, commentId: string) => void;
  incrementPostHeat: (postId: string) => void;

  submitVote: (voteId: string, optionIds: string[]) => void;

  addQuestion: (content: string, author: string) => void;
  answerQuestion: (questionId: string, answer: string, answerAuthor: string) => void;
  togglePinQuestion: (questionId: string) => void;

  addSensitiveWord: (word: string) => void;
  removeSensitiveWord: (word: string) => void;
  containsSensitiveWord: (text: string) => boolean;
  filterSensitiveWords: (text: string) => string;

  clearTemporaryData: () => void;
  exportSummary: () => string;
}

const getRandomColor = () => {
  const colors = [
    'from-pink-500/20 to-rose-500/20',
    'from-cyan-500/20 to-blue-500/20',
    'from-amber-500/20 to-orange-500/20',
    'from-emerald-500/20 to-green-500/20',
    'from-violet-500/20 to-purple-500/20',
    'from-sky-500/20 to-indigo-500/20',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useStore = create<AppState>((set, get) => ({
  posts: mockPosts,
  brands: mockBrands,
  models: mockModels,
  votes: mockVotes,
  questions: mockQuestions,
  users: mockUsers,
  sensitiveWords: defaultSensitiveWords,
  theme: 'dark',
  selectedBrand: null,
  compareModels: [],
  searchKeyword: '',
  filterWaterPost: false,
  userVotes: {},

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  },

  setSelectedBrand: (brandId) => set({ selectedBrand: brandId }),

  toggleCompareModel: (modelId) => {
    const current = get().compareModels;
    if (current.includes(modelId)) {
      set({ compareModels: current.filter((id) => id !== modelId) });
    } else if (current.length < 4) {
      set({ compareModels: [...current, modelId] });
    }
  },

  clearCompareModels: () => set({ compareModels: [] }),

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  setFilterWaterPost: (filter) => set({ filterWaterPost: filter }),

  addComment: (postId, content, author, avatar) => {
    const filteredContent = get().filterSensitiveWords(content);
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      content: filteredContent,
      author,
      avatar,
      isFeatured: false,
      likes: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
      ),
    }));
  },

  toggleCommentLike: (postId, commentId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId ? { ...c, likes: c.likes + 1 } : c
              ),
            }
          : post
      ),
    }));
  },

  toggleFeaturedComment: (postId, commentId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((c) =>
                c.id === commentId ? { ...c, isFeatured: !c.isFeatured } : c
              ),
            }
          : post
      ),
    }));
  },

  incrementPostHeat: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, heat: post.heat + 1 } : post
      ),
    }));
  },

  submitVote: (voteId, optionIds) => {
    const state = get();
    if (state.userVotes[voteId]) return;
    set({
      votes: state.votes.map((vote) =>
        vote.id === voteId
          ? {
              ...vote,
              totalVotes: vote.totalVotes + 1,
              options: vote.options.map((opt) =>
                optionIds.includes(opt.id) ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          : vote
      ),
      userVotes: { ...state.userVotes, [voteId]: optionIds },
    });
  },

  addQuestion: (content, author) => {
    const filteredContent = get().filterSensitiveWords(content);
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      content: filteredContent,
      author,
      isAnswered: false,
      isPinned: false,
      createdAt: new Date().toLocaleString('zh-CN'),
      color: getRandomColor(),
    };
    set((state) => ({ questions: [...state.questions, newQuestion] }));
  },

  answerQuestion: (questionId, answer, answerAuthor) => {
    const filteredAnswer = get().filterSensitiveWords(answer);
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId
          ? { ...q, isAnswered: true, answer: filteredAnswer, answerAuthor }
          : q
      ),
    }));
  },

  togglePinQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isPinned: !q.isPinned } : q
      ),
    }));
  },

  addSensitiveWord: (word) => {
    set((state) => ({
      sensitiveWords: state.sensitiveWords.includes(word)
        ? state.sensitiveWords
        : [...state.sensitiveWords, word],
    }));
  },

  removeSensitiveWord: (word) => {
    set((state) => ({
      sensitiveWords: state.sensitiveWords.filter((w) => w !== word),
    }));
  },

  containsSensitiveWord: (text) => {
    return get().sensitiveWords.some((word) => text.includes(word));
  },

  filterSensitiveWords: (text) => {
    let result = text;
    get().sensitiveWords.forEach((word) => {
      const regex = new RegExp(word, 'g');
      result = result.replace(regex, '*'.repeat(word.length));
    });
    return result;
  },

  clearTemporaryData: () => {
    set({
      votes: mockVotes.map((v) => ({
        ...v,
        totalVotes: 0,
        options: v.options.map((o) => ({ ...o, votes: 0 })),
      })),
      questions: mockQuestions.filter((q) => !q.id.startsWith('q') || q.id.length < 5),
      posts: mockPosts.map((p) => ({
        ...p,
        comments: p.comments.filter((c) => !c.id.startsWith('c') || c.id.length < 5),
      })),
      userVotes: {},
    });
  },

  exportSummary: () => {
    const state = get();
    const summary = {
      exportTime: new Date().toISOString(),
      statistics: {
        totalPosts: state.posts.length,
        totalComments: state.posts.reduce((sum, p) => sum + p.comments.length, 0),
        totalVotes: state.votes.reduce((sum, v) => sum + v.totalVotes, 0),
        totalQuestions: state.questions.length,
        answeredQuestions: state.questions.filter((q) => q.isAnswered).length,
      },
      hotPosts: [...state.posts]
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 5)
        .map((p) => ({ title: p.title, heat: p.heat, author: p.author })),
      topUsers: [...state.users]
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5)
        .map((u) => ({ name: u.name, interactions: u.interactions, posts: u.posts })),
      voteResults: state.votes.map((v) => ({
        title: v.title,
        totalVotes: v.totalVotes,
        options: v.options.map((o) => ({ label: o.label, votes: o.votes })),
      })),
    };
    return JSON.stringify(summary, null, 2);
  },
}));
