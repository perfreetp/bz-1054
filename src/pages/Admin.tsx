import { useState } from 'react';
import {
  Settings, Palette, Shield, Database, Download, Plus, Trash2, AlertTriangle,
  Check, Sun, Moon, Sparkles, RefreshCw, FileText, Vote as VoteIcon,
  HelpCircle, Clock, CheckCircle, XCircle, Star, Pause, Play, Monitor,
  Eye, Calendar, BarChart3, MessageSquare, Users, TrendingUp, AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { ThemeMode, ExportSummary } from '@/types';

const themeOptions: { id: ThemeMode; name: string; icon: React.ReactNode; preview: string; desc: string }[] = [
  {
    id: 'dark',
    name: '科技暗黑',
    icon: <Moon size={20} />,
    preview: 'bg-gradient-to-br from-slate-950 via-tech-950 to-slate-950',
    desc: '深邃科技蓝黑主题，大屏展示首选',
  },
  {
    id: 'light',
    name: '简洁明亮',
    icon: <Sun size={20} />,
    preview: 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50',
    desc: '清新明亮，适合光线充足环境',
  },
  {
    id: 'cyber',
    name: '赛博朋克',
    icon: <Sparkles size={20} />,
    preview: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950',
    desc: '紫电霓虹，科技感拉满',
  },
];

export default function Admin() {
  const {
    theme, setTheme, sensitiveWords, addSensitiveWord, removeSensitiveWord,
    clearTemporaryData, generateSummary, posts, questions, votes,
    toggleVotePause, setFeaturedVote, deleteVote, createVote,
    approveQuestion, rejectQuestion, toggleFeaturedQuestion,
    sensitiveWordHits,
  } = useStore();

  const [newWord, setNewWord] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSummaryPreview, setShowSummaryPreview] = useState(false);
  const [summaryData, setSummaryData] = useState<ExportSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [exportSuccess, setExportSuccess] = useState('');

  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteType, setNewVoteType] = useState<'single' | 'multiple'>('single');
  const [newVoteOptions, setNewVoteOptions] = useState(['', '']);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const pendingQuestions = questions.filter((q) => q.status === 'pending');
  const approvedQuestions = questions.filter((q) => q.status === 'approved');
  const featuredQuestions = approvedQuestions.filter((q) => q.isFeatured);
  const totalVoteCount = votes.reduce((sum, v) => sum + v.totalVotes, 0);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    addSensitiveWord(newWord.trim());
    setNewWord('');
  };

  const handleClearData = () => {
    clearTemporaryData();
    setShowClearConfirm(false);
  };

  const handlePreviewSummary = () => {
    let startDate: Date | undefined;
    const now = new Date();
    if (timeRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    const summary = generateSummary(startDate);
    setSummaryData(summary);
    setShowSummaryPreview(true);
  };

  const handleExportSummary = (format: 'json' | 'txt') => {
    const data = summaryData || generateSummary();
    let content: string;
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else {
      content = formatSummaryAsText(data);
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-forum-summary-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(`已成功导出 ${format.toUpperCase()} 文件！`);
    setTimeout(() => setExportSuccess(''), 3000);
  };

  const formatSummaryAsText = (data: ExportSummary): string => {
    const lines: string[] = [];
    lines.push('========================================');
    lines.push('  手机交流论坛 - 活动讨论摘要报告');
    lines.push('========================================');
    lines.push('');
    lines.push(`📅 生成时间：${data.exportTime}`);
    lines.push(`⏱️ 时间范围：${data.timeRange.start} ~ ${data.timeRange.end}`);
    lines.push('');
    lines.push('────────── 数据概览 ──────────');
    lines.push(`  总帖子数：${data.statistics.totalPosts}`);
    lines.push(`  总问题数：${data.statistics.totalQuestions}`);
    lines.push(`  待审核：${data.statistics.pendingQuestions}`);
    lines.push(`  已上墙：${data.statistics.approvedQuestions}`);
    lines.push(`  已回答：${data.statistics.answeredQuestions}`);
    lines.push(`  总投票人次：${data.statistics.totalVotes}`);
    lines.push(`  投票用户数：${data.statistics.totalVoters}`);
    lines.push(`  总评论数：${data.statistics.totalComments}`);
    lines.push(`  敏感词命中：${data.statistics.sensitiveWordHits} 次`);
    lines.push('');
    lines.push('────────── 热门帖子 TOP 10 ──────────');
    data.hotPosts.forEach((post, i) => {
      lines.push(`  ${i + 1}. ${post.title}`);
      lines.push(`     作者：${post.author} | 热度：${post.heat} | 评论：${post.comments}`);
    });
    lines.push('');
    lines.push('────────── 投票结果 ──────────');
    data.voteResults.forEach((vote) => {
      lines.push(`  📊 ${vote.title}`);
      lines.push(`     参与人数：${vote.totalVotes}人 | ${vote.type === 'single' ? '单选' : '多选'} | ${vote.isPaused ? '已暂停' : '进行中'}`);
      vote.options.forEach((opt) => {
        lines.push(`       ${opt.label}：${opt.votes}票 (${opt.percentage}%)`);
      });
      lines.push('');
    });
    lines.push('────────── 精选问答 ──────────');
    if (data.featuredQuestions.length === 0) {
      lines.push('  暂无精选问答');
    } else {
      data.featuredQuestions.forEach((qa, i) => {
        lines.push(`  ${i + 1}. 问：${qa.content}`);
        lines.push(`     答：${qa.answer || '（待回答）'}`);
        lines.push(`     提问者：${qa.author}`);
        if (qa.brand) lines.push(`     品牌：${qa.brand}`);
        if (qa.budget) lines.push(`     预算：${qa.budget}`);
        lines.push('');
      });
    }
    lines.push('────────── 敏感词命中统计 TOP 10 ──────────');
    if (data.sensitiveWordStats.length === 0) {
      lines.push('  暂无敏感词命中记录');
    } else {
      data.sensitiveWordStats.slice(0, 10).forEach((hit, i) => {
        lines.push(`  ${i + 1}. "${hit.word}"：命中 ${hit.hits} 次（最后命中：${hit.lastHitAt}）`);
      });
    }
    lines.push('');
    lines.push('========================================');
    lines.push('  报告结束');
    lines.push('========================================');
    return lines.join('\n');
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newVoteOptions.filter((o) => o.trim());
    if (!newVoteTitle.trim() || validOptions.length < 2) return;
    createVote(newVoteTitle, '', newVoteType, validOptions);
    setNewVoteTitle('');
    setNewVoteType('single');
    setNewVoteOptions(['', '']);
  };

  const addVoteOption = () => {
    if (newVoteOptions.length < 8) {
      setNewVoteOptions([...newVoteOptions, '']);
    }
  };

  const removeVoteOption = (index: number) => {
    if (newVoteOptions.length > 2) {
      setNewVoteOptions(newVoteOptions.filter((_, i) => i !== index));
    }
  };

  const stats = [
    { label: '总帖子数', value: posts.length, icon: <FileText size={20} />, color: 'from-tech-500 to-cyber-500' },
    { label: '上墙问题', value: approvedQuestions.length, icon: <HelpCircle size={20} />, color: 'from-purple-500 to-pink-500' },
    { label: '投票人次', value: totalVoteCount, icon: <VoteIcon size={20} />, color: 'from-accent-500 to-amber-500' },
    { label: '敏感词数', value: sensitiveWords.length, icon: <Shield size={20} />, color: 'from-emerald-500 to-teal-500' },
  ];

  const timeRangeOptions = [
    { id: 'all' as const, label: '全部' },
    { id: 'today' as const, label: '今日' },
    { id: 'week' as const, label: '近7天' },
    { id: 'month' as const, label: '近30天' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-cyber-400" size={28} />
          管理员面板
        </h1>
        <div className={cn('text-sm', secondaryText)}>
          <span className="text-amber-400">{pendingQuestions.length}</span> 个问题待审核
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cn('rounded-2xl p-5 border', cardBg)}>
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center text-white', stat.color)}>
              {stat.icon}
            </div>
            <div className={cn('text-3xl font-bold mb-1 gradient-text')}>{stat.value}</div>
            <div className={cn('text-sm', secondaryText)}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Vote Management */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <VoteIcon className="text-accent-500" size={22} />
          投票管理
        </h2>

        {/* Create Vote */}
        <form onSubmit={handleCreateVote} className={cn('p-4 rounded-xl mb-6', inputBg)}>
          <h3 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
            <Plus size={16} /> 新建临时投票
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newVoteTitle}
                onChange={(e) => setNewVoteTitle(e.target.value)}
                placeholder="投票标题..."
                className={cn('w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500')}
              />
            </div>
            <select
              value={newVoteType}
              onChange={(e) => setNewVoteType(e.target.value as 'single' | 'multiple')}
              className={cn('px-3 py-2 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'focus:border-cyber-500')}
            >
              <option value="single">单选投票</option>
              <option value="multiple">多选投票</option>
            </select>
          </div>
          <div className="space-y-2 mb-3">
            {newVoteOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={cn('text-xs w-6 text-right', secondaryText)}>{i + 1}</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...newVoteOptions];
                    newOpts[i] = e.target.value;
                    setNewVoteOptions(newOpts);
                  }}
                  placeholder={`选项 ${i + 1}`}
                  className={cn('flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500')}
                />
                {newVoteOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeVoteOption(i)}
                    className={cn('p-1.5 rounded-lg transition-colors', theme === 'light' ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10')}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="gradient-btn text-sm py-2 px-4 flex-1">创建投票</button>
            {newVoteOptions.length < 8 && (
              <button
                type="button"
                onClick={addVoteOption}
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', inputBg, secondaryText)}
              >
                + 添加选项
              </button>
            )}
          </div>
        </form>

        {/* Vote List */}
        <div className="space-y-3">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className={cn(
                'p-4 rounded-xl border flex items-center gap-4 transition-all',
                vote.isFeatured ? 'border-cyber-500/50 bg-cyber-500/5' : ''
              )}
              style={{ borderColor: vote.isFeatured ? undefined : theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={cn('font-medium truncate', textColor)}>{vote.title}</h4>
                  {vote.isTemp && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">临时</span>
                  )}
                  {vote.isFeatured && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-cyber-500/20 text-cyber-400 flex items-center gap-1">
                      <Monitor size={10} /> 大屏
                    </span>
                  )}
                  {vote.isPaused && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 flex items-center gap-1">
                      <Pause size={10} /> 暂停
                    </span>
                  )}
                </div>
                <p className={cn('text-xs mt-1', secondaryText)}>
                  {vote.totalVotes} 人参与 · {vote.options.length} 个选项 · {vote.type === 'single' ? '单选' : '多选'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleVotePause(vote.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    vote.isPaused
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  )}
                  title={vote.isPaused ? '恢复投票' : '暂停投票'}
                >
                  {vote.isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  onClick={() => setFeaturedVote(vote.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    vote.isFeatured
                      ? 'bg-cyber-500/20 text-cyber-400'
                      : theme === 'light' ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  )}
                  title="设为大屏展示"
                >
                  <Monitor size={16} />
                </button>
                {vote.isTemp && (
                  <button
                    onClick={() => deleteVote(vote.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="删除投票"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {votes.length === 0 && (
            <p className={cn('text-center py-8 text-sm', secondaryText)}>暂无投票</p>
          )}
        </div>
      </section>

      {/* Question Review */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
          <HelpCircle className="text-purple-400" size={22} />
          问题审核管理
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
            {pendingQuestions.length} 待审核
          </span>
        </h2>

        {/* Pending Questions */}
        {pendingQuestions.length > 0 && (
          <div className="mb-6">
            <h3 className={cn('text-sm font-bold mb-3 flex items-center gap-2', secondaryText)}>
              <Clock size={14} /> 待审核问题
            </h3>
            <div className="space-y-2">
              {pendingQuestions.slice(0, 5).map((q) => (
                <div key={q.id} className={cn('p-4 rounded-xl border', inputBg)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', textColor)}>{q.content}</p>
                      <p className={cn('text-xs mt-1', secondaryText)}>
                        {q.author} · {q.createdAt}
                        {q.brand && ` · ${q.brand}`}
                        {q.budget && ` · ${q.budget}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => approveQuestion(q.id)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="通过"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => rejectQuestion(q.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="拒绝"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingQuestions.length > 5 && (
                <p className={cn('text-xs text-center pt-2', secondaryText)}>
                  还有 {pendingQuestions.length - 5} 个待审核问题，请到提问墙页面查看全部
                </p>
              )}
            </div>
          </div>
        )}

        {/* Featured Questions */}
        <div>
          <h3 className={cn('text-sm font-bold mb-3 flex items-center gap-2', secondaryText)}>
            <Star size={14} className="text-amber-400" fill="currentColor" /> 精选问答（{featuredQuestions.length}）
          </h3>
          {featuredQuestions.length > 0 ? (
            <div className="space-y-2">
              {featuredQuestions.slice(0, 3).map((q) => (
                <div key={q.id} className={cn('p-3 rounded-xl border', theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/5 border-amber-500/20')}>
                  <p className={cn('text-sm font-medium', textColor)}>❓ {q.content}</p>
                  {q.answer && (
                    <p className={cn('text-xs mt-2', theme === 'light' ? 'text-emerald-700' : 'text-emerald-400')}>
                      💡 {q.answer}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn('text-xs', secondaryText)}>—— {q.author}</span>
                    <button
                      onClick={() => toggleFeaturedQuestion(q.id)}
                      className={cn('text-xs px-2 py-1 rounded transition-colors', theme === 'light' ? 'text-amber-600 hover:bg-amber-100' : 'text-amber-400 hover:bg-amber-500/10')}
                    >
                      取消精选
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={cn('text-sm py-4 text-center', secondaryText)}>暂无精选问答</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Palette className="text-purple-400" size={22} />
            展示主题设置
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'rounded-xl overflow-hidden border-2 transition-all text-left',
                  theme === t.id
                    ? 'border-cyber-500 shadow-lg shadow-cyber-500/30 ring-2 ring-cyber-500/20'
                    : theme === 'light'
                    ? 'border-slate-200 hover:border-tech-400'
                    : 'border-white/10 hover:border-cyber-500/50'
                )}
              >
                <div className={cn('h-20', t.preview, 'relative')}>
                  <div className="absolute inset-2 rounded-lg bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-4 rounded bg-tech-500/80" />
                      <div className="w-1.5 h-6 rounded bg-cyber-500/80" />
                      <div className="w-1.5 h-3.5 rounded bg-accent-500/80" />
                    </div>
                  </div>
                  {theme === t.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyber-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <div className={cn('p-2 text-center', theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50')}>
                  <div className={cn('font-semibold text-sm', textColor)}>{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Sensitive Words */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Shield className="text-emerald-400" size={22} />
            敏感词管理
          </h2>
          <form onSubmit={handleAddWord} className="flex gap-3 mb-4">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="输入敏感词，支持特殊符号..."
              className={cn('flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20')}
            />
            <button type="submit" className={cn('px-5 py-2.5 rounded-xl bg-emerald-500/90 text-white font-medium flex items-center gap-2 hover:bg-emerald-500 transition-all')}>
              <Plus size={16} />
              添加
            </button>
          </form>

          <div className={cn('rounded-xl border p-4 max-h-48 overflow-y-auto scrollbar-thin', inputBg)}>
            {sensitiveWords.length === 0 ? (
              <p className={cn('text-center py-4 text-sm', secondaryText)}>暂无敏感词</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sensitiveWords.map((word) => (
                  <span
                    key={word}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
                      theme === 'light' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    )}
                  >
                    {word}
                    <button
                      onClick={() => removeSensitiveWord(word)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {sensitiveWordHits.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
              <h4 className={cn('text-xs font-bold mb-2 flex items-center gap-1.5', secondaryText)}>
                <AlertCircle size={12} /> 命中统计 TOP 5
              </h4>
              <div className="space-y-1">
                {sensitiveWordHits.slice(0, 5).map((hit) => (
                  <div key={hit.word} className="flex items-center justify-between text-xs">
                    <span className={textColor}>"{hit.word}"</span>
                    <span className={cn('font-medium', hit.count > 5 ? 'text-red-400' : secondaryText)}>
                      {hit.count} 次
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Data Management */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Database className="text-accent-500" size={22} />
            临时数据管理
          </h2>
          <div className="space-y-4">
            <div className={cn('p-4 rounded-xl text-sm', inputBg)}>
              <p className={cn('font-medium mb-2', textColor)}>💡 清空范围说明</p>
              <ul className={cn('space-y-1 text-xs', secondaryText)}>
                <li>✓ 清除：现场新增的提问、评论、观众投票记录</li>
                <li>✓ 清除：临时创建的投票</li>
                <li>✗ 保留：示例帖子、示例问题、原始投票热度</li>
                <li>✗ 保留：敏感词配置、主题设置</li>
              </ul>
            </div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className={cn(
                  'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                  theme === 'light'
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                )}
              >
                <RefreshCw size={18} />
                清空现场临时数据
              </button>
            ) : (
              <div className={cn(
                'p-4 rounded-xl border',
                theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/20'
              )}>
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className={cn('font-medium', theme === 'light' ? 'text-red-700' : 'text-red-400')}>
                      确认要清空现场临时数据吗？
                    </p>
                    <p className={cn('text-sm mt-1', theme === 'light' ? 'text-red-600' : 'text-red-300/80')}>
                      基础示例数据将保留，清完后页面仍有数据展示。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearData}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                  >
                    确认清空
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl font-medium transition-all',
                      theme === 'light' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Export Summary */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Download className="text-cyber-400" size={22} />
            讨论摘要导出
          </h2>

          <div className="mb-4">
            <label className={cn('block text-sm font-medium mb-2', secondaryText)}>
              <Calendar size={14} className="inline mr-1" /> 选择时间范围
            </label>
            <div className="flex gap-2">
              {timeRangeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTimeRange(opt.id)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                    timeRange === opt.id
                      ? 'bg-cyber-500 text-white'
                      : inputBg + ' ' + secondaryText
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePreviewSummary}
              className={cn(
                'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                theme === 'light'
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              )}
            >
              <Eye size={18} />
              预览摘要
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportSummary('json')}
                className="gradient-btn flex items-center justify-center gap-2 py-3"
              >
                <Download size={16} />
                导出 JSON
              </button>
              <button
                onClick={() => handleExportSummary('txt')}
                className="gradient-btn-accent flex items-center justify-center gap-2 py-3"
              >
                <Download size={16} />
                导出 TXT
              </button>
            </div>
          </div>

          {exportSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
              <Check size={16} />
              {exportSuccess}
            </div>
          )}
        </section>
      </div>

      {/* Summary Preview Modal */}
      {showSummaryPreview && summaryData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={cn('rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border', cardBg)}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
              <h3 className={cn('text-lg font-bold flex items-center gap-2', textColor)}>
                <BarChart3 className="text-cyber-400" size={20} />
                讨论摘要预览
              </h3>
              <button
                onClick={() => setShowSummaryPreview(false)}
                className={cn('p-2 rounded-lg transition-colors', theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-white/5')}
              >
                <XCircle size={20} className={secondaryText} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[65vh] space-y-6">
              {/* Overview */}
              <div>
                <h4 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
                  <TrendingUp className="text-cyber-400" size={16} /> 数据概览
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={cn('p-3 rounded-xl text-center', inputBg)}>
                    <div className="text-2xl font-bold gradient-text">{summaryData.statistics.totalPosts}</div>
                    <div className={cn('text-xs mt-1', secondaryText)}>总帖子</div>
                  </div>
                  <div className={cn('p-3 rounded-xl text-center', inputBg)}>
                    <div className="text-2xl font-bold gradient-text">{summaryData.statistics.totalQuestions}</div>
                    <div className={cn('text-xs mt-1', secondaryText)}>总问题</div>
                  </div>
                  <div className={cn('p-3 rounded-xl text-center', inputBg)}>
                    <div className="text-2xl font-bold gradient-text">{summaryData.statistics.totalVotes}</div>
                    <div className={cn('text-xs mt-1', secondaryText)}>投票人次</div>
                  </div>
                  <div className={cn('p-3 rounded-xl text-center', inputBg)}>
                    <div className="text-2xl font-bold gradient-text">{summaryData.statistics.totalComments}</div>
                    <div className={cn('text-xs mt-1', secondaryText)}>总评论</div>
                  </div>
                </div>
              </div>

              {/* Top Posts */}
              <div>
                <h4 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
                  <MessageSquare className="text-tech-400" size={16} /> 热门帖子 TOP 5
                </h4>
                <div className="space-y-2">
                  {summaryData.hotPosts.slice(0, 5).map((post, i) => (
                    <div key={i} className={cn('p-3 rounded-xl flex items-center gap-3', inputBg)}>
                      <span className="w-6 h-6 rounded-full bg-tech-500/20 text-tech-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', textColor)}>{post.title}</p>
                        <p className={cn('text-xs', secondaryText)}>{post.author}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn('text-sm font-bold text-accent-400')}>{post.heat}</p>
                        <p className={cn('text-xs', secondaryText)}>{post.comments} 评论</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vote Results */}
              <div>
                <h4 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
                  <VoteIcon className="text-accent-400" size={16} /> 投票结果
                </h4>
                <div className="space-y-3">
                  {summaryData.voteResults.map((vote, i) => (
                    <div key={i} className={cn('p-4 rounded-xl', inputBg)}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className={cn('font-medium text-sm', textColor)}>{vote.title}</h5>
                        <span className="text-xs text-accent-400">{vote.totalVotes} 人</span>
                      </div>
                      <div className="space-y-2">
                        {vote.options.map((opt, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <span className={cn('text-xs w-20 truncate', secondaryText)}>{opt.label}</span>
                            <div className="flex-1 h-2 rounded-full bg-slate-700/30 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-tech-500 to-cyber-500"
                                style={{ width: `${opt.percentage}%` }}
                              />
                            </div>
                            <span className={cn('text-xs w-14 text-right', secondaryText)}>{opt.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured QA */}
              <div>
                <h4 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
                  <Star className="text-amber-400" size={16} fill="currentColor" /> 精选问答
                </h4>
                {summaryData.featuredQuestions.length > 0 ? (
                  <div className="space-y-3">
                    {summaryData.featuredQuestions.map((qa, i) => (
                      <div key={i} className={cn('p-4 rounded-xl', theme === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/5 border border-amber-500/20')}>
                        <p className={cn('text-sm font-medium mb-2', textColor)}>❓ {qa.content}</p>
                        {qa.answer ? (
                          <p className={cn('text-sm', theme === 'light' ? 'text-emerald-700' : 'text-emerald-400')}>💡 {qa.answer}</p>
                        ) : (
                          <p className={cn('text-sm italic', secondaryText)}>（待回答）</p>
                        )}
                        <p className={cn('text-xs mt-2 text-right', secondaryText)}>—— {qa.author}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn('text-sm py-4 text-center', secondaryText)}>暂无精选问答</p>
                )}
              </div>

              {/* Sensitive Word Hits */}
              <div>
                <h4 className={cn('text-sm font-bold mb-3 flex items-center gap-2', textColor)}>
                  <Shield className="text-red-400" size={16} /> 敏感词命中统计
                </h4>
                {summaryData.sensitiveWordStats.length > 0 ? (
                  <div className={cn('rounded-xl p-4', inputBg)}>
                    <div className="space-y-2">
                      {summaryData.sensitiveWordStats.slice(0, 5).map((hit, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className={cn('text-sm', textColor)}>"{hit.word}"</span>
                          <div className="flex items-center gap-3">
                            <span className={cn('text-xs', secondaryText)}>最后命中：{hit.lastHitAt}</span>
                            <span className="text-sm font-bold text-red-400">{hit.hits} 次</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={cn('text-sm py-4 text-center', secondaryText)}>暂无敏感词命中记录</p>
                )}
              </div>
            </div>
            <div className="p-4 border-t flex gap-3" style={{ borderColor: theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => handleExportSummary('json')}
                className="flex-1 gradient-btn flex items-center justify-center gap-2 py-2.5"
              >
                <Download size={16} /> 导出 JSON
              </button>
              <button
                onClick={() => handleExportSummary('txt')}
                className="flex-1 gradient-btn-accent flex items-center justify-center gap-2 py-2.5"
              >
                <Download size={16} /> 导出 TXT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
