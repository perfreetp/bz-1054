import { useEffect } from 'react';
import {
  Activity, Users, MessageSquare, Shield, HelpCircle, CheckCircle,
  Radio, ArrowRightLeft,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function LiveDashboard() {
  const {
    sessions, currentSessionId, switchSession,
    liveMetrics, recordLiveMetric,
    getSessionFilteredQuestions, getSessionFilteredVotes,
    theme, sensitiveWordHits, questions, votes,
  } = useStore();

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const sessionQuestions = getSessionFilteredQuestions();
  const sessionVotes = getSessionFilteredVotes();
  const pendingCount = sessionQuestions.filter((q) => q.status === 'pending').length;
  const approvedCount = sessionQuestions.filter((q) => q.status === 'approved').length;

  const oneMinuteAgo = Date.now() - 60000;
  const newQuestionsLastMin = sessionQuestions.filter((q) => {
    try {
      return new Date(q.createdAt).getTime() > oneMinuteAgo;
    } catch {
      return false;
    }
  }).length;
  const totalVoterCount = sessionVotes.reduce((sum, v) => sum + v.totalVotes, 0);
  const commentHeat = questions.reduce(
    (sum, q) => sum + (q.isAnswered ? 0 : 1), 0
  ) + votes.reduce((sum, v) => sum + v.totalVotes, 0);
  const sensitiveHitsCount = sensitiveWordHits.reduce((sum, h) => sum + h.count, 0);

  const metricCards = [
    {
      label: '新增提问（近1分钟）',
      value: newQuestionsLastMin,
      icon: <HelpCircle size={20} />,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
    },
    {
      label: '投票参与人次',
      value: totalVoterCount,
      icon: <Users size={20} />,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
    },
    {
      label: '评论热度',
      value: commentHeat,
      icon: <MessageSquare size={20} />,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
    },
    {
      label: '敏感词命中',
      value: sensitiveHitsCount,
      icon: <Shield size={20} />,
      color: 'from-red-500 to-rose-500',
      textColor: 'text-red-400',
    },
  ];

  useEffect(() => {
    recordLiveMetric();
    const timer = setInterval(() => {
      recordLiveMetric();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const chartData = liveMetrics.slice(-60);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className={cn('text-2xl font-bold flex items-center gap-2', textColor)}>
          <Activity className="text-cyan-400" size={28} />
          实时数据看板
        </h1>
        {currentSession && (
          <div className={cn('flex items-center gap-2 text-sm', secondaryText)}>
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            当前场次：
            <span className={cn('font-medium', textColor)}>{currentSession.name}</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', theme === 'light' ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20')}>
              进行中
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div key={card.label} className={cn('rounded-2xl p-5 border', cardBg)}>
            <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center text-white', card.color)}>
              {card.icon}
            </div>
            <div className={cn('text-3xl font-bold mb-1', card.textColor)}>{card.value}</div>
            <div className={cn('text-sm', secondaryText)}>{card.label}</div>
          </div>
        ))}
      </div>

      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h2 className={cn('text-lg font-bold flex items-center gap-2 mb-6', textColor)}>
          <Activity className="text-cyan-400" size={22} />
          实时趋势（近60分钟）
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.08)'} />
              <XAxis
                dataKey="time"
                stroke={theme === 'light' ? '#94a3b8' : '#64748b'}
                tick={{ fill: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                stroke={theme === 'light' ? '#94a3b8' : '#64748b'}
                tick={{ fill: theme === 'light' ? '#64748b' : '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
                  border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: theme === 'light' ? '#1e293b' : '#f1f5f9',
                }}
              />
              <Legend
                wrapperStyle={{ color: theme === 'light' ? '#475569' : '#cbd5e1', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="newQuestions" name="新增提问" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="voterCount" name="投票人次" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="commentHeat" name="评论热度" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sensitiveHits" name="敏感词命中" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={cn('flex items-center justify-center h-64 text-sm', secondaryText)}>
            暂无实时数据，将在下次记录时显示
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className={cn('text-lg font-bold flex items-center gap-2 mb-6', textColor)}>
            <HelpCircle className="text-purple-400" size={22} />
            当前场次问题统计
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className={cn('p-5 rounded-xl text-center', inputBg)}>
              <div className="text-3xl font-bold text-amber-400 mb-1">{pendingCount}</div>
              <div className={cn('text-sm', secondaryText)}>待审核问题</div>
            </div>
            <div className={cn('p-5 rounded-xl text-center', inputBg)}>
              <div className="text-3xl font-bold text-emerald-400 mb-1">{approvedCount}</div>
              <div className={cn('text-sm', secondaryText)}>已通过问题</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {sessionQuestions.filter((q) => q.status === 'pending').slice(0, 5).map((q) => (
              <div key={q.id} className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl', inputBg)}>
                <HelpCircle size={14} className="text-amber-400 shrink-0" />
                <span className={cn('text-sm truncate', textColor)}>{q.content}</span>
                <span className={cn('text-xs shrink-0', secondaryText)}>{q.author}</span>
              </div>
            ))}
            {pendingCount === 0 && (
              <p className={cn('text-center py-4 text-sm', secondaryText)}>暂无待审核问题</p>
            )}
          </div>
        </section>

        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className={cn('text-lg font-bold flex items-center gap-2 mb-6', textColor)}>
            <ArrowRightLeft className="text-cyber-400" size={22} />
            快速切换场次
          </h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => switchSession(session.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                  session.id === currentSessionId
                    ? 'border-cyber-500/50 bg-cyber-500/5 shadow-lg shadow-cyber-500/10'
                    : theme === 'light'
                      ? 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                      : 'border-white/10 hover:border-cyber-500/50 hover:bg-white/5'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                  session.color || 'from-cyan-500/20 to-blue-500/20'
                )}>
                  <Radio size={14} className={session.id === currentSessionId ? 'text-cyan-400' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn('text-sm font-medium truncate', textColor)}>{session.name}</div>
                  <div className={cn('text-xs', secondaryText)}>
                    {session.startTime} - {session.endTime}
                  </div>
                </div>
                {session.id === currentSessionId && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full shrink-0',
                    theme === 'light' ? 'bg-cyan-100 text-cyan-700' : 'bg-cyber-500/20 text-cyber-400'
                  )}>
                    当前
                  </span>
                )}
                {session.id !== currentSessionId && (
                  <CheckCircle size={16} className={cn('shrink-0', secondaryText)} />
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
