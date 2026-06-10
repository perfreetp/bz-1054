import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Flame, MessageCircle, ChevronLeft, ChevronRight, Filter, TrendingUp, Zap,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function Home() {
  const {
    posts, users, searchKeyword, setSearchKeyword, filterWaterPost, setFilterWaterPost, theme,
  } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const hotPosts = [...posts].sort((a, b) => b.heat - a.heat);
  const carouselPosts = hotPosts.filter((p) => !p.isWaterPost).slice(0, 5);
  const displayPosts = hotPosts
    .filter((p) => (filterWaterPost ? !p.isWaterPost : true))
    .filter((p) =>
      searchKeyword
        ? p.title.includes(searchKeyword) || p.content.includes(searchKeyword) || p.tags.some((t) => t.includes(searchKeyword))
        : true
    );
  const activeUsers = [...users].sort((a, b) => b.interactions - a.interactions).slice(0, 8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselPosts.length]);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
  };

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselPosts.length) % carouselPosts.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselPosts.length);

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <section className="relative">
        <div className="relative h-80 md:h-96 overflow-hidden rounded-3xl border border-white/10">
          {carouselPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className={cn(
                'absolute inset-0 transition-all duration-700',
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
              style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-tech-900/90 via-tech-900/60 to-transparent" />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.8) 0%, rgba(6, 182, 212, 0.6) 100%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center p-8 md:p-12">
                <div className="max-w-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-accent-500/90 text-white text-sm font-medium flex items-center gap-1">
                      <Flame size={14} /> 热门
                    </span>
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-white/80 text-lg line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-white/70">
                    <span className="flex items-center gap-1">
                      <span className="text-xl">{post.avatar}</span> {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={16} className="text-accent-400" /> {post.heat.toLocaleString()} 热度
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} /> {post.comments.length} 评论
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-all flex items-center justify-center z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-all flex items-center justify-center z-10"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {carouselPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentSlide ? 'w-8 bg-cyber-400 shadow-lg shadow-cyber-400/50' : 'w-2 bg-white/40 hover:bg-white/60'
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className={cn('rounded-2xl p-6 border', cardBg)}>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索帖子标题、内容或标签关键词..."
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-xl border text-base outline-none transition-all',
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 focus:border-tech-500 focus:ring-2 focus:ring-tech-500/20 text-slate-800'
                  : 'bg-slate-800/50 border-white/10 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20 text-white placeholder-slate-500'
              )}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setFilterWaterPost(!filterWaterPost)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all',
                  filterWaterPost
                    ? 'bg-tech-600 text-white border-tech-500'
                    : theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700/50'
                )}
              >
                <Filter size={18} />
                过滤水帖
              </button>
            </label>
            <button type="submit" className="gradient-btn px-8 flex items-center gap-2">
              <Search size={18} />
              搜索
            </button>
          </div>
        </form>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hot Posts List */}
        <section className={cn('lg:col-span-2 rounded-2xl p-6 border', cardBg)}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-accent-500" size={24} />
              热门讨论榜单
            </h3>
            <span className={cn('text-sm', secondaryText)}>共 {displayPosts.length} 条讨论</span>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin pr-2">
            {displayPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className={cn(
                  'flex gap-4 p-4 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer group',
                  theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0',
                    index === 0
                      ? 'bg-gradient-to-br from-accent-500 to-accent-600'
                      : index === 1
                      ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                      : index === 2
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                      : theme === 'light'
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-slate-700 text-slate-300'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h4 className={cn('font-semibold group-hover:text-cyber-400 transition-colors truncate', theme === 'light' ? 'text-slate-800' : 'text-white')}>
                      {post.title}
                    </h4>
                    {post.isWaterPost && (
                      <span className="px-2 py-0.5 text-xs rounded bg-slate-500/30 text-slate-400 shrink-0">水帖</span>
                    )}
                  </div>
                  <p className={cn('text-sm line-clamp-1 mb-2', secondaryText)}>{post.content}</p>
                  <div className={cn('flex items-center gap-4 text-xs', secondaryText)}>
                    <span className="flex items-center gap-1">
                      <span>{post.avatar}</span> {post.author}
                    </span>
                    <span className="flex items-center gap-1 text-accent-500">
                      <Flame size={12} /> {post.heat.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> {post.comments.length}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {displayPosts.length === 0 && (
              <div className={cn('text-center py-12', secondaryText)}>
                没有找到匹配的帖子
              </div>
            )}
          </div>
        </section>

        {/* Active Users */}
        <section className={cn('rounded-2xl p-6 border', cardBg)}>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Zap className="text-cyber-400" size={24} />
            活跃用户榜
          </h3>
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all',
                  theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                      theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'
                    )}
                  >
                    {user.avatar}
                  </div>
                  {index < 3 && (
                    <div
                      className={cn(
                        'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white',
                        index === 0 ? 'bg-accent-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'
                      )}
                    >
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-semibold truncate', theme === 'light' ? 'text-slate-800' : 'text-white')}>
                      {user.name}
                    </span>
                    <span>{user.badge}</span>
                  </div>
                  <div className={cn('flex items-center gap-3 text-xs', secondaryText)}>
                    <span>Lv.{user.level}</span>
                    <span>{user.posts} 帖</span>
                    <span>{user.interactions.toLocaleString()} 互动</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
