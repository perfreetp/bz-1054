import { useState, useEffect } from 'react';
import {
  HelpCircle, Send, Star, MessageCircle, CheckCircle, XCircle, Clock,
  Filter, ChevronLeft, ChevronRight, Tag, DollarSign, Smartphone,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { brandTags, budgetTags } from '@/data/mockData';

export default function Questions() {
  const {
    questions, addQuestion, answerQuestion, toggleFeaturedQuestion,
    approveQuestion, rejectQuestion, questionFilter, setQuestionFilter,
    filterSensitiveWords, theme,
  } = useStore();
  const [questionText, setQuestionText] = useState('');
  const [questionAuthor, setQuestionAuthor] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('全部');
  const [selectedBudget, setSelectedBudget] = useState('全部');
  const [answerInput, setAnswerInput] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  const approvedQuestions = questions.filter((q) => q.status === 'approved');
  const pendingQuestions = questions.filter((q) => q.status === 'pending');
  const featuredQuestions = approvedQuestions.filter((q) => q.isFeatured);

  const filteredQuestions = approvedQuestions.filter((q) => {
    const brandMatch = selectedBrand === '全部' || q.brand === selectedBrand;
    const budgetMatch = selectedBudget === '全部' || q.budget === selectedBudget;
    return brandMatch && budgetMatch;
  }).sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  useEffect(() => {
    if (featuredQuestions.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredQuestions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredQuestions.length]);

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + featuredQuestions.length) % featuredQuestions.length);
  };
  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % featuredQuestions.length);
  };

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
    const brand = selectedBrand !== '全部' ? selectedBrand : undefined;
    const budget = selectedBudget !== '全部' ? selectedBudget : undefined;
    addQuestion(questionText, questionAuthor || '匿名访客', brand, budget);
    setQuestionText('');
    setQuestionAuthor('');
    setSelectedBrand('全部');
    setSelectedBudget('全部');
  };

  const handleAnswer = (qid: string) => {
    const answer = answerInput[qid];
    if (!answer?.trim()) return;
    answerQuestion(qid, answer, '导购专家');
    setAnswerInput((prev) => ({ ...prev, [qid]: '' }));
  };

  const QuestionCard = ({
    q,
    showControls = false,
  }: {
    q: typeof questions[number];
    showControls?: boolean;
  }) => (
    <div className={cn(
      'rounded-2xl p-5 border transition-all relative overflow-hidden bg-gradient-to-br',
      q.color,
      theme === 'light' ? 'border-slate-200' : 'border-white/10'
    )}>
      {q.isFeatured && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-medium">
          <Star size={10} fill="currentColor" /> 精选
        </div>
      )}
      {q.status === 'pending' && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-xs font-medium">
          <Clock size={10} /> 待审核
        </div>
      )}
      {q.isAnswered && (
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
          <CheckCircle size={10} fill="currentColor" /> 已回答
        </div>
      )}

      <div className={cn('pt-4')}>
        <p className={cn('text-base font-medium mb-3 leading-relaxed', textColor)}>{q.content}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {q.brand && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs flex items-center gap-1',
              theme === 'light' ? 'bg-tech-100 text-tech-700' : 'bg-tech-500/20 text-tech-400'
            )}>
              <Smartphone size={10} /> {q.brand}
            </span>
          )}
          {q.budget && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs flex items-center gap-1',
              theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
            )}>
              <DollarSign size={10} /> {q.budget}
            </span>
          )}
        </div>
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

      {showControls && q.status === 'pending' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => approveQuestion(q.id)}
            className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-1"
          >
            <CheckCircle size={14} /> 通过
          </button>
          <button
            onClick={() => rejectQuestion(q.id)}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-1"
          >
            <XCircle size={14} /> 拒绝
          </button>
        </div>
      )}

      {showControls && q.status === 'approved' && !q.isAnswered && (
        <div className="space-y-2 mt-3">
          <textarea
            value={answerInput[q.id] || ''}
            onChange={(e) => setAnswerInput((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="输入回答..."
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
              onClick={() => toggleFeaturedQuestion(q.id)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', q.isFeatured ? 'bg-amber-500 text-white' : inputBg, secondaryText)}
            >
              <Star size={12} className="inline mr-1" />
              {q.isFeatured ? '取消精选' : '设为精选'}
            </button>
          </div>
        </div>
      )}

      {showControls && q.status === 'approved' && q.isAnswered && (
        <button
          onClick={() => toggleFeaturedQuestion(q.id)}
          className={cn('mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1', q.isFeatured ? 'bg-amber-500 text-white' : inputBg, secondaryText)}
        >
          <Star size={14} />
          {q.isFeatured ? '取消精选' : '设为精选问答'}
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
            <MessageCircle size={16} /> {approvedQuestions.length} 个已上墙
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <Clock size={16} /> {pendingQuestions.length} 待审核
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle size={16} /> {approvedQuestions.filter((q) => q.isAnswered).length} 已回答
          </span>
        </div>
      </div>

      {/* Featured Carousel */}
      {featuredQuestions.length > 0 && (
        <section className="relative">
          <h3 className={cn('text-lg font-bold mb-4 flex items-center gap-2', textColor)}>
            <Star className="text-amber-400" fill="currentColor" size={20} />
            精选问答轮播
          </h3>
          <div className={cn('rounded-2xl p-6 border relative overflow-hidden', cardBg)}>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>

            <div className="relative h-56 overflow-hidden">
              {featuredQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className={cn(
                    'absolute inset-0 transition-all duration-500 flex items-center justify-center px-12',
                    i === carouselIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                  )}
                  style={{ transform: i === carouselIndex ? 'translateX(0)' : i < carouselIndex ? 'translateX(-100%)' : 'translateX(100%)' }}
                >
                  <div className="max-w-3xl w-full text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="text-amber-400" size={18} fill="currentColor" />
                      <span className="text-amber-400 font-medium text-sm">精选问答</span>
                    </div>
                    <p className={cn('text-xl font-medium mb-4 leading-relaxed', textColor)}>❓ {q.content}</p>
                    {q.answer && (
                      <div className={cn('inline-block text-left p-5 rounded-2xl', theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-500/10')}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-500 font-medium">💡 {q.answerAuthor || '专家解答'}</span>
                        </div>
                        <p className={cn('text-base leading-relaxed', theme === 'light' ? 'text-slate-700' : 'text-emerald-100')}>{q.answer}</p>
                      </div>
                    )}
                    <div className={cn('mt-4 text-sm', secondaryText)}>
                      —— {q.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {featuredQuestions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === carouselIndex ? 'bg-cyber-400 w-6' : theme === 'light' ? 'bg-slate-300' : 'bg-slate-600'
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Submit Form */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <h2 className={cn('text-lg font-bold mb-4', textColor)}>📝 提交你的购机问题</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="描述你的购机需求或疑问，例如：预算3000元，拍照好的手机有哪些推荐？"
            className={cn('w-full px-4 py-3 rounded-xl border text-base outline-none resize-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20')}
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={cn('block text-xs font-medium mb-1.5', secondaryText)}>品牌倾向</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={cn('w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'focus:border-cyber-500')}
              >
                <option value="全部">全部品牌</option>
                {brandTags.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={cn('block text-xs font-medium mb-1.5', secondaryText)}>预算范围</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className={cn('w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'focus:border-cyber-500')}
              >
                <option value="全部">全部预算</option>
                {budgetTags.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={cn('block text-xs font-medium mb-1.5', secondaryText)}>昵称（选填）</label>
              <input
                type="text"
                value={questionAuthor}
                onChange={(e) => setQuestionAuthor(e.target.value)}
                placeholder="匿名访客"
                className={cn('w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all', inputBg, textColor, 'placeholder-slate-500 focus:border-cyber-500')}
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="gradient-btn w-full h-10 flex items-center justify-center gap-2">
                <Send size={16} />
                提交问题
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <p className={cn('text-xs', secondaryText)}>
            💡 问题提交后需要管理员审核才能上墙展示，请耐心等待
          </p>
        </form>
      </section>

      {/* Pending Review Section */}
      {pendingQuestions.length > 0 && (
        <section>
          <h3 className={cn('text-lg font-bold mb-4 flex items-center gap-2', textColor)}>
            <Clock className="text-amber-400" size={20} />
            待审核问题
            <span className={cn('text-sm font-normal', secondaryText)}>
              （{pendingQuestions.length} 个）
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} showControls />
            ))}
          </div>
        </section>
      )}

      {/* Filter Tags */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Filter className={secondaryText} size={18} />
          <span className={cn('text-sm font-medium', secondaryText)}>筛选：</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedBrand('全部'); setSelectedBudget('全部'); }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all',
                selectedBrand === '全部' && selectedBudget === '全部'
                  ? 'bg-cyber-500 text-white'
                  : inputBg + ' ' + secondaryText
              )}
            >
              全部
            </button>
            {brandTags.slice(0, 4).map((brand) => (
              <button
                key={brand}
                onClick={() => { setSelectedBrand(brand); setSelectedBudget('全部'); }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                  selectedBrand === brand && selectedBudget === '全部'
                    ? 'bg-tech-500 text-white'
                    : inputBg + ' ' + secondaryText
                )}
              >
                <Smartphone size={10} /> {brand}
              </button>
            ))}
            {budgetTags.slice(0, 3).map((budget) => (
              <button
                key={budget}
                onClick={() => { setSelectedBudget(budget); setSelectedBrand('全部'); }}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                  selectedBudget === budget && selectedBrand === '全部'
                    ? 'bg-emerald-500 text-white'
                    : inputBg + ' ' + secondaryText
                )}
              >
                <DollarSign size={10} /> {budget}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Approved Questions */}
      <section>
        <h3 className={cn('text-lg font-bold mb-4', textColor)}>
          上墙问题 <span className={secondaryText}>（{filteredQuestions.length}）</span>
        </h3>
        {filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuestions.map((q) => (
              <QuestionCard key={q.id} q={q} showControls />
            ))}
          </div>
        ) : (
          <div className={cn('rounded-2xl p-16 text-center border', cardBg)}>
            <HelpCircle size={64} className={cn('mx-auto mb-4', secondaryText)} />
            <p className={cn('text-lg', secondaryText)}>暂无符合条件的问题</p>
          </div>
        )}
      </section>
    </div>
  );
}
