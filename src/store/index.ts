import { create } from 'zustand';
import type { Post, Brand, PhoneModel, Vote, Question, User, Comment, ThemeMode, SensitiveWordHit, QuestionStatus, ExportSummary } from '@/types';
import {
  mockPosts, mockBrands, mockModels, mockVotes, mockQuestions, mockUsers, defaultSensitiveWords,
} from '@/data/mockData';

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

const isTempId = (id: string) => {
  return id.startsWith('temp_') || (id.length > 8 && !isNaN(Number(id.slice(1))));
};

interface AppState {
  posts: Post[];
  brands: Brand[];
  models: PhoneModel[];
  votes: Vote[];
  questions: Question[];
  users: User[];
  sensitiveWords: string[];
  sensitiveWordHits: SensitiveWordHit[];
  theme: ThemeMode;
  selectedBrand: string | null;
  compareModels: string[];
  searchKeyword: string;
  filterWaterPost: boolean;
  userVotes: Record<string, string[]>;
  questionFilter: { brand?: string; budget?: string; status?: QuestionStatus };
  featuredVoteId: string | null;

  setTheme: (theme: ThemeMode) => void;
  setSelectedBrand: (brandId: string | null) => void;
  toggleCompareModel: (modelId: string) => void;
  clearCompareModels: () => void;
  setSearchKeyword: (keyword: string) => void;
  setFilterWaterPost: (filter: boolean) => void;
  setQuestionFilter: (filter: { brand?: string; budget?: string; status?: QuestionStatus }) => void;

  addComment: (postId: string, content: string, author: string, avatar: string) => void;
  toggleCommentLike: (postId: string, commentId: string) => void;
  toggleFeaturedComment: (postId: string, commentId: string) => void;
  incrementPostHeat: (postId: string) => void;

  submitVote: (voteId: string, optionIds: string[]) => void;
  createVote: (title: string, description: string, type: 'single' | 'multiple', options: string[]) => void;
  toggleVotePause: (voteId: string) => void;
  setFeaturedVote: (voteId: string) => void;
  deleteVote: (voteId: string) => void;

  addQuestion: (content: string, author: string, brand?: string, budget?: string, tags?: string[]) => void;
  approveQuestion: (questionId: string) => void;
  rejectQuestion: (questionId: string) => void;
  answerQuestion: (questionId: string, answer: string, answerAuthor: string) => void;
  togglePinQuestion: (questionId: string) => void;
  toggleFeaturedQuestion: (questionId: string) => void;

  addSensitiveWord: (word: string) => void;
  removeSensitiveWord: (word: string) => void;
  containsSensitiveWord: (text: string) => boolean;
  filterSensitiveWords: (text: string) => string;

  clearTemporaryData: () => void;
  generateSummary: (startDate?: Date) => ExportSummary;
}

const loadUserVotes = (): Record<string, string[]> => {
  try {
    const saved = localStorage.getItem('userVotes');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveUserVotes = (votes: Record<string, string[]>) => {
  try {
    localStorage.setItem('userVotes', JSON.stringify(votes));
  } catch {
    // ignore
  }
};

export const useStore = create<AppState>((set, get) => ({
  posts: mockPosts,
  brands: mockBrands,
  models: mockModels,
  votes: mockVotes,
  questions: mockQuestions,
  users: mockUsers,
  sensitiveWords: defaultSensitiveWords,
  sensitiveWordHits: [],
  theme: 'dark',
  selectedBrand: null,
  compareModels: [],
  searchKeyword: '',
  filterWaterPost: false,
  userVotes: loadUserVotes(),
  questionFilter: { status: 'approved' },
  featuredVoteId: mockVotes.find((v) => v.isFeatured)?.id || null,

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

  setQuestionFilter: (filter) => set({ questionFilter: filter }),

  addComment: (postId, content, author, avatar) => {
    const filteredContent = get().filterSensitiveWords(content);
    const newComment: Comment = {
      id: `temp_${Date.now()}`,
      postId,
      content: filteredContent,
      author,
      avatar,
      isFeatured: false,
      likes: 0,
      createdAt: new Date().toLocaleString('zh-CN'),
      isTemp: true,
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
    const vote = state.votes.find((v) => v.id === voteId);
    if (!vote || vote.isPaused) return;

    const newUserVotes = { ...state.userVotes, [voteId]: optionIds };
    saveUserVotes(newUserVotes);

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
      userVotes: newUserVotes,
    });
  },

  createVote: (title, description, type, options) => {
    const newVote: Vote = {
      id: `temp_v_${Date.now()}`,
      title,
      description,
      type,
      options: options.map((label, i) => ({ id: `temp_o_${Date.now()}_${i}`, label, votes: 0 })),
      isActive: true,
      isPaused: false,
      isFeatured: false,
      order: Date.now(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      totalVotes: 0,
      isTemp: true,
    };
    set((state) => ({ votes: [newVote, ...state.votes] }));
  },

  toggleVotePause: (voteId) => {
    set((state) => ({
      votes: state.votes.map((v) =>
        v.id === voteId ? { ...v, isPaused: !v.isPaused } : v
      ),
    }));
  },

  setFeaturedVote: (voteId) => {
    set((state) => ({
      votes: state.votes.map((v) => ({ ...v, isFeatured: v.id === voteId })),
      featuredVoteId: voteId,
    }));
  },

  deleteVote: (voteId) => {
    set((state) => ({
      votes: state.votes.filter((v) => v.id !== voteId),
      featuredVoteId: state.featuredVoteId === voteId ? null : state.featuredVoteId,
    }));
  },

  addQuestion: (content, author, brand, budget, tags = []) => {
    const filteredContent = get().filterSensitiveWords(content);
    const newQuestion: Question = {
      id: `temp_q_${Date.now()}`,
      content: filteredContent,
      author: author || '匿名访客',
      status: 'pending',
      isAnswered: false,
      isPinned: false,
      isFeatured: false,
      createdAt: new Date().toLocaleString('zh-CN'),
      color: getRandomColor(),
      tags,
      brand,
      budget,
      isTemp: true,
    };
    set((state) => ({ questions: [...state.questions, newQuestion] }));
  },

  approveQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'approved' as QuestionStatus } : q
      ),
    }));
  },

  rejectQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, status: 'rejected' as QuestionStatus } : q
      ),
    }));
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

  toggleFeaturedQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, isFeatured: !q.isFeatured } : q
      ),
    }));
  },

  addSensitiveWord: (word) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    set((state) => ({
      sensitiveWords: state.sensitiveWords.includes(trimmed)
        ? state.sensitiveWords
        : [...state.sensitiveWords, trimmed],
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
    const { sensitiveWords, sensitiveWordHits } = get();
    const newHits = [...sensitiveWordHits];
    let hasHits = false;

    sensitiveWords.forEach((word) => {
      const escaped = escapeRegExp(word);
      const regex = new RegExp(escaped, 'g');
      const matches = result.match(regex);
      if (matches && matches.length > 0) {
        hasHits = true;
        const hitIndex = newHits.findIndex((h) => h.word === word);
        if (hitIndex >= 0) {
          newHits[hitIndex] = {
            ...newHits[hitIndex],
            count: newHits[hitIndex].count + matches.length,
            lastHitAt: new Date().toLocaleString('zh-CN'),
          };
        } else {
          newHits.push({
            word,
            count: matches.length,
            lastHitAt: new Date().toLocaleString('zh-CN'),
          });
        }
        result = result.replace(regex, '*'.repeat(word.length));
      }
    });

    if (hasHits) {
      set({ sensitiveWordHits: newHits });
    }

    return result;
  },

  clearTemporaryData: () => {
    set({
      votes: mockVotes.map((v) => ({ ...v })),
      questions: mockQuestions.map((q) => ({ ...q })),
      posts: mockPosts.map((p) => ({
        ...p,
        comments: p.comments.filter((c) => !isTempId(c.id)).map((c) => ({ ...c })),
      })),
      userVotes: {},
      sensitiveWordHits: [],
      featuredVoteId: mockVotes.find((v) => v.isFeatured)?.id || null,
    });
    localStorage.removeItem('userVotes');
  },

  generateSummary: (startDate) => {
    const state = get();
    const now = new Date();
    const earliestDate = new Date(0);

    const rangeStart = startDate || earliestDate;

    const isInRange = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d >= rangeStart && d <= now;
      } catch {
        return true;
      }
    };

    const filteredComments = state.posts.flatMap((p) =>
      p.comments.filter((c) => isInRange(c.createdAt))
    );
    const filteredQuestions = state.questions.filter((q) => isInRange(q.createdAt));

    const tempComments = filteredComments.filter((c) => isTempId(c.id)).length;
    const tempQuestions = filteredQuestions.filter((q) => isTempId(q.id)).length;

    const totalVotesCast = state.votes.reduce((sum, v) => sum + v.totalVotes, 0);
    const totalVoters = Object.keys(state.userVotes).length;

    const summary: ExportSummary = {
      exportTime: now.toLocaleString('zh-CN'),
      timeRange: {
        start: rangeStart.toLocaleString('zh-CN'),
        end: now.toLocaleString('zh-CN'),
      },
      statistics: {
        totalPosts: state.posts.length,
        totalComments: filteredComments.length,
        tempComments,
        totalVotes: totalVotesCast,
        totalVoters,
        totalQuestions: filteredQuestions.length,
        pendingQuestions: filteredQuestions.filter((q) => q.status === 'pending').length,
        approvedQuestions: filteredQuestions.filter((q) => q.status === 'approved').length,
        answeredQuestions: filteredQuestions.filter((q) => q.isAnswered).length,
        tempQuestions,
        sensitiveWordHits: state.sensitiveWordHits.reduce((sum, h) => sum + h.count, 0),
      },
      hotPosts: [...state.posts]
        .sort((a, b) => b.heat - a.heat)
        .slice(0, 10)
        .map((p) => ({
          title: p.title,
          heat: p.heat,
          author: p.author,
          comments: p.comments.length,
          tags: p.tags,
        })),
      topUsers: [...state.users]
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 10)
        .map((u) => ({
          name: u.name,
          interactions: u.interactions,
          posts: u.posts,
          level: u.level,
          badge: u.badge,
        })),
      voteResults: state.votes.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        type: v.type,
        totalVotes: v.totalVotes,
        isFeatured: v.isFeatured,
        isPaused: v.isPaused,
        isTemp: !!v.isTemp,
        options: v.options.map((o) => ({
          label: o.label,
          votes: o.votes,
          percentage: v.totalVotes > 0 ? Number(((o.votes / v.totalVotes) * 100).toFixed(2)) : 0,
        })),
      })),
      featuredQuestions: state.questions
        .filter((q) => q.isFeatured && q.isAnswered && isInRange(q.createdAt))
        .map((q) => ({
          content: q.content,
          author: q.author,
          answer: q.answer,
          answerAuthor: q.answerAuthor,
          tags: q.tags || [],
          brand: q.brand,
          budget: q.budget,
        })),
      allQuestions: filteredQuestions
        .filter((q) => q.status === 'approved')
        .map((q) => ({
          content: q.content,
          author: q.author,
          isAnswered: q.isAnswered,
          answer: q.answer,
          answerAuthor: q.answerAuthor,
          isPinned: q.isPinned,
          createdAt: q.createdAt,
          tags: q.tags || [],
        })),
      sensitiveWordStats: [...state.sensitiveWordHits]
        .sort((a, b) => b.count - a.count)
        .map((h) => ({ word: h.word, hits: h.count, lastHitAt: h.lastHitAt })),
    };

    return summary;
  },
}));
