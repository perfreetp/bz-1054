import { useState } from 'react';
import { Vote as VoteIcon, Users, Check, Clock } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function VotePage() {
  const { votes, submitVote, userVotes, theme } = useStore();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const chartColors = ['#06B6D4', '#F97316', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B'];

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <VoteIcon className="text-accent-500" size={28} />
          现场投票
        </h1>
        <div className={cn('text-sm flex items-center gap-2', secondaryText)}>
          <Users size={16} />
          共 {votes.reduce((sum, v) => sum + v.totalVotes, 0).toLocaleString()} 人参与
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {votes.map((vote) => {
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
            <div key={vote.id} className={cn('rounded-2xl p-6 border', cardBg)}>
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className={cn('text-lg font-bold', textColor)}>{vote.title}</h3>
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

              {hasVoted ? (
                <div className="space-y-4">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#334155'} horizontal={false} />
                        <XAxis type="number" stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                        <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} stroke={theme === 'light' ? '#64748b' : '#94a3b8'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                            border: 'none',
                            borderRadius: '12px',
                            color: theme === 'light' ? '#0f172a' : '#fff',
                          }}
                          formatter={(value: number, name: string, props: { payload: { 百分比: string } }) => [
                            `${value} 票 (${props.payload.百分比}%)`,
                            name,
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
                          userSelected.includes(opt.id) ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                        )}
                        style={{
                          backgroundColor: `${chartColors[i % chartColors.length]}20`,
                          color: chartColors[i % chartColors.length],
                          ...(userSelected.includes(opt.id) ? { boxShadow: `0 0 0 2px ${chartColors[i % chartColors.length]}` } : {}),
                        }}
                      >
                        {userSelected.includes(opt.id) && <Check size={12} />}
                        {opt.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-emerald-400 text-sm font-medium">
                    ✓ 您已成功投票
                  </p>
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
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
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
        })}
      </div>
    </div>
  );
}
