import { useState } from 'react';
import { HelpCircle, Send, Pin, MessageCircle, CheckCircle } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function Questions() {
  const { questions, addQuestion, answerQuestion, togglePinQuestion, containsSensitiveWord, theme } = useStore();
  const [questionText, setQuestionText] = useState('');
  const [questionAuthor, setQuestionAuthor] = useState('');
  const [answerInput, setAnswerInput] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const pinnedQuestions = questions.filter((q) => q.isPinned).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const otherQuestions = questions.filter((q) => !q.isPinned).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!questionText.trim()) {
      setError('请输入问题内容');
      return;
    }
    if (questionText.length < 5) {
      setError('问题内容至少5个字');
      return;
    }
    if (containsSensitiveWord(questionText)) {
      setError('问题内容包含敏感词，请修改后重试');
      return;
    }
    addQuestion(questionText, questionAuthor || '匿名访客');
    setQuestionText('');
    setQuestionAuthor('');
  };

  const handleAnswer = (qid: string) => {
    const answer = answerInput[qid];
    if (!answer?.trim()) return;
    answerQuestion(qid, answer, '导购专家');
    setAnswerInput((prev) => ({ ...prev, [qid]: '' }));
  };

  const QuestionCard = ({ q }: { q: typeof questions[number] }) => (
    <div className={cn(
      'rounded-2xl p-5 border transition-all hover:-translate-y-1 cursor-pointer relative overflow-hidden bg-gradient-to-br',
      q.color,
      theme === 'light' ? 'border-slate-200' : 'border-white/10'
    )}>
      {q.isPinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-500/90 text-white text-xs font-medium">
          <Pin size={10} fill="currentColor" /> 置顶
        </div>
      )}
      {q.isAnswered && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
          <CheckCircle size={10} fill="currentColor" /> 已回答
        </div>
      )}
      <div className={cn('pt-4')}>
        <p className={cn('text-base font-medium mb-3 leading-relaxed', textColor)}>{q.content}</p>
        <div className={cn('flex items-center gap-3 text-xs mb-4 pb-4 border-b', secondaryText, theme === 'light' ? 'border-slate-200' : 'border-white/10')}>
          <span>👤 {q.author}</span>
          <span>·</span>
          <span>{q.createdAt}</span>
        </div>
      </div>

      {q.isAnswered && q.answer && (
        <div className={cn('p-4 rounded-xl', theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-500/10')}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-500 font-medium text-sm">💡 {q.answerAuthor || '专家'}</span>
          </div>
          <p className={cn('text-sm leading-relaxed', theme === 'light' ? 'text-slate-700' : 'text-emerald-100')}>{q.answer}</p>
        </div>
      )}

      {!q.isAnswered && (
        <div className="space-y-2">
          <textarea
            value={answerInput[q.id] || ''}
            onChange={(e) => setAnswerInput((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="管理员可以在此输入回答..."
            className={cn('w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500')}
            rows={2}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnswer(q.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/90 text-white text-xs font-medium hover:bg-emerald-500 transition-all"
            >
              提交回答
            </button>
            <button
              onClick={() => togglePinQuestion(q.id)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', q.isPinned ? 'bg-accent-500/90 text-white' : inputBg, secondaryText)}
            >
              {q.isPinned ? '取消置顶' : '置顶'}
            </button>
          </div>
        </div>
      )}

      {q.isAnswered && (
        <button
          onClick={() => togglePinQuestion(q.id)}
          className={cn('mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full', q.isPinned ? 'bg-accent-500/90 text-white' : inputBg, secondaryText)}
        >
          {q.isPinned ? '取消置顶' : '置顶此回答'}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="text-cyber-400" size={28} />
          购机提问墙
        </h1>
        <div className={cn('flex items-center gap-4 text-sm', secondaryText)}>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} /> {questions.length} 个问题
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle size={16} /> {questions.filter((q) => q.isAnswered).length} 已回答
          </span>
        </div>
      </div>

      {/* Submit Form */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h2 className={cn('text-lg font-bold mb-4', textColor)}>📝 提交你的购机问题</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-4">
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="描述你的购机需求或疑问，例如：预算3000元，拍照好的手机有哪些推荐？"
                className={cn('w-full px-4 py-3 rounded-xl border text-base outline-none resize-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
                rows={3}
              />
            </div>
            <div className="md:col-span-3">
              <input
                type="text"
                value={questionAuthor}
                onChange={(e) => setQuestionAuthor(e.target.value)}
                placeholder="你的昵称（选填，默认匿名访客）"
                className={cn('w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
              />
            </div>
            <div>
              <button type="submit" className="gradient-btn w-full h-full flex items-center justify-center gap-2">
                <Send size={18} />
                提交问题
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </form>
      </section>

      {/* Pinned Questions */}
      {pinnedQuestions.length > 0 && (
        <section>
          <h3 className={cn('text-lg font-bold mb-4 flex items-center gap-2', textColor)}>
            <Pin className="text-accent-500" size={20} />
            精选回答
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pinnedQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        </section>
      )}

      {/* All Questions */}
      <section>
        <h3 className={cn('text-lg font-bold mb-4', textColor)}>
          全部问题 <span className={secondaryText}>（{otherQuestions.length}）</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {otherQuestions.map((q) => (
            <QuestionCard key={q.id} q={q} />
          ))}
        </div>
        {questions.length === 0 && (
          <div className={cn('rounded-2xl p-16 text-center border', cardBg)}>
            <HelpCircle size={64} className={cn('mx-auto mb-4', secondaryText)} />
            <p className={cn('text-lg', secondaryText)}>还没有问题，快来提问吧！</p>
          </div>
        )}
      </section>
    </div>
  );
}
