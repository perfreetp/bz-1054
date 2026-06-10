import { useState } from 'react';
import {
  Vote as VoteIcon, Users, Check, Clock, Pause, Play, Star, Plus, Trash2, Monitor,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function VotePage() {
  const {
    votes, submitVote, userVotes, toggleVotePause, setFeaturedVote, deleteVote,
    createVote, theme,
  } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newVote, setNewVote] = useState({
    title: '',
    description: '',
    type: 'single' as 'single' | 'multiple',
    options: ['', ''],
  });

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const chartColors = ['#06B6D4', '#F97316', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

  const featuredVote = votes.find((v) => v.isFeatured);
  const otherVotes = votes.filter((v) => !v.isFeatured);

  const handleOptionToggle = (voteId: string, optionId: string, type: 'single' | 'multiple') => {
    setSelectedOptions((prev) => {
      if (type === 'single') {
        return { ...prev, [voteId]: [optionId] };
      }
      const current = prev[voteId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [voteId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [voteId]: [...current, optionId] };
    });
  };

  const handleSubmitVote = (voteId: string) => {
    const options = selectedOptions[voteId] || [];
    if (options.length === 0) return;
    submitVote(voteId, options);
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newVote.options.filter((o) => o.trim());
    if (!newVote.title.trim() || validOptions.length < 2) return;
    createVote(newVote.title, newVote.description, newVote.type, validOptions);
    setNewVote({ title: '', description: '', type: 'single', options: ['', ''] });
    setShowCreate(false);
  };

  const addOption = () => {
    if (newVote.options.length < 8) {
      setNewVote({ ...newVote, options: [...newVote.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (newVote.options.length > 2) {
      setNewVote({
        ...newVote,
        options: newVote.options.filter((_, i) => i !== index),
      });
    }
  };

  const VoteCard = ({ vote, isFeatured = false }: { vote: typeof votes[0]; isFeatured?: boolean }) => {
    const hasVoted = !!userVotes[vote.id];
    const userSelected = userVotes[vote.id] || [];
    const options = selectedOptions[vote.id] || [];

    const chartData = vote.options.map((opt, i) => ({
      name: opt.label,
      票数: opt.votes,
      百分比: vote.totalVotes > 0 ? ((opt.votes / vote.totalVotes) * 100).toFixed(1) : 0,
      fill: chartColors[i % chartColors.length],
    }));

    return (
      <div
        className={cn(
          'rounded-2xl p-6 border relative overflow-hidden transition-all',
          isFeatured
            ? 'border-2 border-cyber-500 shadow-2xl shadow-cyber-500/20 scale-[1.02]'
            : cardBg
        )}
      >
        {isFeatured && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-tech-500 via-cyber-400 to-tech-500" />
        )}
        {vote.isPaused && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1">
            <Pause size={12} /> 暂停中
          </div>
        )}
        {isFeatured && !vote.isPaused && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyber-500/20 text-cyber-400 text-xs font-medium flex items-center gap-1 animate-pulse">
            <Monitor size={12} /> 大屏展示中
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className={cn('text-xl font-bold', textColor)}>{vote.title}</h3>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0',
              vote.type === 'single' ? 'bg-tech-500/20 text-tech-400' : 'bg-purple-500/20 text-purple-400'
            )}>
              {vote.type === 'single' ? '单选' : '多选'}
            </span>
          </div>
          <p className={cn('text-sm mb-3', secondaryText)}>{vote.description}</p>
          <div className={cn('flex items-center gap-4 text-xs', secondaryText)}>
            <span className="flex items-center gap-1">
              <Users size={12} /> {vote.totalVotes} 人参与
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> 截止 {vote.endAt}
            </span>
          </div>
        </div>

        {hasVoted || vote.isPaused ? (
          <div className="space-y-4">
            <div className={isFeatured ? 'h-72' : 'h-52'}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} horizontal={false} />
                  <XAxis type="number" stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: isFeatured ? 14 : 12 }} stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                      border: 'none',
                      borderRadius: '12px',
                      color: theme === 'light' ? '#0f172a' : '#fff',
                    }}
                    formatter={(value: number, _name: string, props: { payload: { 百分比: string } }) => [
                      `${value} 票 (${props.payload.百分比}%)`,
                      '得票',
                    ]}
                  />
                  <Bar dataKey="票数" radius={[0, 6, 6, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
              {vote.options.map((opt, i) => (
                <span
                  key={opt.id}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs flex items-center gap-2',
                    userSelected.includes(opt.id) ? 'ring-2 ring-offset-2' : ''
                  )}
                  style={{
                    backgroundColor: `${chartColors[i % chartColors.length]}20`,
                    color: chartColors[i % chartColors.length],
                    ...(userSelected.includes(opt.id)
                      ? { boxShadow: `0 0 0 2px ${chartColors[i % chartColors.length]}` }
                      : {}),
                  }}
                >
                  {userSelected.includes(opt.id) && <Check size={12} />}
                  {opt.label}
                </span>
              ))}
            </div>
            {hasVoted && (
              <p className="text-center text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <Check size={16} />
                您已成功投票
              </p>
            )}
            {vote.isPaused && !hasVoted && (
              <p className="text-center text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
                <Pause size={16} />
                投票已暂停，等待主持人开启
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {vote.options.map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => handleOptionToggle(vote.id, opt.id, vote.type)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3',
                  options.includes(opt.id)
                    ? 'border-cyber-500 bg-cyber-500/10'
                    : theme === 'light'
                    ? 'border-slate-200 hover:border-tech-400 hover:bg-tech-50'
                    : 'border-white/10 hover:border-cyber-500/50 hover:bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    options.includes(opt.id)
                      ? 'border-cyber-500 bg-cyber-500'
                      : theme === 'light' ? 'border-slate-300' : 'border-slate-600'
                  )}
                >
                  {options.includes(opt.id) && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <span className={cn('font-medium', textColor)}>{opt.label}</span>
                </div>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: chartColors[i % chartColors.length] }}
                />
              </button>
            ))}
            <button
              onClick={() => handleSubmitVote(vote.id)}
              disabled={options.length === 0}
              className={cn(
                'w-full py-3 rounded-xl font-medium transition-all mt-4',
                options.length > 0
                  ? 'gradient-btn-accent'
                  : theme === 'light'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              )}
            >
              提交投票
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <VoteIcon className="text-accent-500" size={28} />
            现场投票
          </h1>
          <p className={cn('text-sm mt-1', secondaryText)}>
            共 {votes.length} 场投票，{votes.reduce((sum, v) => sum + v.totalVotes, 0).toLocaleString()} 人次参与
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="gradient-btn flex items-center gap-2"
        >
          <Plus size={18} />
          新建投票
        </button>
      </div>

      {/* Create Vote Form */}
      {showCreate && (
        <form onSubmit={handleCreateVote} className={cn('rounded-2xl p-6 border', cardBg)}>
          <h3 className={cn('text-lg font-bold mb-4', textColor)}>新建临时投票</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={cn('block text-sm font-medium mb-2', secondaryText)}>投票标题</label>
              <input
                type="text"
                value={newVote.title}
                onChange={(e) => setNewVote({ ...newVote, title: e.target.value })}
                placeholder="例如：你最喜欢哪个品牌？"
                className={cn('w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
              />
            </div>
            <div>
              <label className={cn('block text-sm font-medium mb-2', secondaryText)}>投票类型</label>
              <select
                value={newVote.type}
                onChange={(e) => setNewVote({ ...newVote, type: e.target.value as 'single' | 'multiple' })}
                className={cn('w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
              >
                <option value="single">单选投票</option>
                <option value="multiple">多选投票</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className={cn('block text-sm font-medium mb-2', secondaryText)}>描述（选填）</label>
            <input
              type="text"
              value={newVote.description}
              onChange={(e) => setNewVote({ ...newVote, description: e.target.value })}
              placeholder="简单描述一下这个投票..."
              className={cn('w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
            />
          </div>
          <div className="mb-4">
            <label className={cn('block text-sm font-medium mb-2', secondaryText)}>
              选项（至少2个，最多8个）
            </label>
            <div className="space-y-2">
              {newVote.options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={cn('text-sm w-6', secondaryText)}>{index + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...newVote.options];
                      newOptions[index] = e.target.value;
                      setNewVote({ ...newVote, options: newOptions });
                    }}
                    placeholder={`选项 ${index + 1}`}
                    className={cn('flex-1 px-4 py-2 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500')}
                  />
                  {newVote.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className={cn('p-2 rounded-lg transition-colors', theme === 'light' ? 'text-red-500 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10')}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {newVote.options.length < 8 && (
              <button
                type="button"
                onClick={addOption}
                className={cn('mt-2 text-sm flex items-center gap-1', theme === 'light' ? 'text-tech-600 hover:text-tech-700' : 'text-cyber-400 hover:text-cyber-300')}
              >
                <Plus size={14} /> 添加选项
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="submit" className="gradient-btn flex-1">创建投票</button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className={cn('px-6 py-3 rounded-full font-medium transition-all', theme === 'light' ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* Featured Vote - Big Screen Display */}
      {featuredVote && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-amber-400" fill="currentColor" size={20} />
            <h2 className="text-lg font-bold" style={{ color: theme === 'light' ? '#1e293b' : '#fff' }}>
              当前大屏展示
            </h2>
          </div>
          <VoteCard vote={featuredVote} isFeatured />
        </section>
      )}

      {/* All Votes List */}
      <section>
        <h2 className={cn('text-lg font-bold mb-4', textColor)}>全部投票</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherVotes.map((vote) => (
            <div key={vote.id} className="relative group">
              <VoteCard vote={vote} />
              {/* Admin Controls */}
              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => toggleVotePause(vote.id)}
                  className={cn(
                    'p-2 rounded-lg backdrop-blur transition-colors',
                    vote.isPaused
                      ? 'bg-emerald-500/80 text-white hover:bg-emerald-500'
                      : 'bg-amber-500/80 text-white hover:bg-amber-500'
                  )}
                  title={vote.isPaused ? '恢复投票' : '暂停投票'}
                >
                  {vote.isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  onClick={() => setFeaturedVote(vote.id)}
                  className={cn(
                    'p-2 rounded-lg backdrop-blur transition-colors',
                    vote.isFeatured
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800/80 text-white hover:bg-slate-700'
                  )}
                  title="设为大屏展示"
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => deleteVote(vote.id)}
                  className="p-2 rounded-lg bg-red-500/80 text-white backdrop-blur hover:bg-red-500 transition-colors"
                  title="删除投票"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
