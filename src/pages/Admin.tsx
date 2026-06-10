import { useState } from 'react';
import {
  Settings, Palette, Shield, Database, Download, Plus, Trash2, AlertTriangle,
  Check, Sun, Moon, Sparkles, RefreshCw, FileText,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/types';

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
    clearTemporaryData, exportSummary, posts, questions, votes,
  } = useStore();
  const [newWord, setNewWord] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

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

  const handleExport = (format: 'json' | 'txt') => {
    const summary = exportSummary();
    const content = format === 'json' ? summary : JSON.stringify(JSON.parse(summary), null, 2);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-forum-summary-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(`已成功导出 ${format.toUpperCase()} 文件！`);
    setTimeout(() => setExportSuccess(''), 3000);
  };

  const stats = [
    { label: '总帖子数', value: posts.length, icon: <FileText size={20} />, color: 'from-tech-500 to-cyber-500' },
    { label: '问题总数', value: questions.length, icon: <Database size={20} />, color: 'from-purple-500 to-pink-500' },
    { label: '投票总数', value: votes.reduce((sum, v) => sum + v.totalVotes, 0), icon: <Check size={20} />, color: 'from-accent-500 to-amber-500' },
    { label: '敏感词数', value: sensitiveWords.length, icon: <Shield size={20} />, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-cyber-400" size={28} />
          管理员面板
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Palette className="text-purple-400" size={22} />
            展示主题设置
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div className={cn('h-24', t.preview, 'relative')}>
                  <div className="absolute inset-2 rounded-lg bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-2 h-6 rounded bg-tech-500/80" />
                      <div className="w-2 h-8 rounded bg-cyber-500/80" />
                      <div className="w-2 h-5 rounded bg-accent-500/80" />
                    </div>
                  </div>
                  {theme === t.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyber-500 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <div className={cn('p-3', theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50')}>
                  <div className={cn('font-semibold flex items-center gap-2', textColor)}>
                    {t.icon}
                    {t.name}
                  </div>
                  <p className={cn('text-xs mt-1', secondaryText)}>{t.desc}</p>
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
              placeholder="输入需要过滤的敏感词..."
              className={cn('flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20')}
            />
            <button type="submit" className={cn('px-5 py-2.5 rounded-xl bg-emerald-500/90 text-white font-medium flex items-center gap-2 hover:bg-emerald-500 transition-all')}>
              <Plus size={16} />
              添加
            </button>
          </form>

          <div className={cn('rounded-xl border p-4 max-h-64 overflow-y-auto scrollbar-thin', inputBg)}>
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
        </section>

        {/* Data Management */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Database className="text-accent-500" size={22} />
            临时数据管理
          </h2>
          <div className="space-y-4">
            <p className={cn('text-sm', secondaryText)}>
              清空所有临时产生的用户数据，包括投票记录、用户提问和评论。原始示例数据将被恢复。
            </p>
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
                清空所有临时数据
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
                      确认要清空所有临时数据吗？
                    </p>
                    <p className={cn('text-sm mt-1', theme === 'light' ? 'text-red-600' : 'text-red-300/80')}>
                      此操作不可撤销，所有投票、提问和评论将被清除。
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
          <p className={cn('text-sm mb-4', secondaryText)}>
            导出当前论坛的讨论摘要，包含热门帖子、活跃用户、投票结果等统计数据。
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleExport('json')}
              className="gradient-btn flex items-center justify-center gap-2 py-4"
            >
              <Download size={18} />
              导出 JSON
            </button>
            <button
              onClick={() => handleExport('txt')}
              className="gradient-btn-accent flex items-center justify-center gap-2 py-4"
            >
              <Download size={18} />
              导出 TXT
            </button>
          </div>
          {exportSuccess && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
              <Check size={16} />
              {exportSuccess}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
