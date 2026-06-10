import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, ThumbsUp, MessageCircle, Flame, Pin, Send, Share2, Bookmark, Star,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    posts, brands, addComment, toggleCommentLike, toggleFeaturedComment, incrementPostHeat, theme,
  } = useStore();
  const [commentText, setCommentText] = useState('');
  const [showQR, setShowQR] = useState(false);

  const post = posts.find((p) => p.id === id);
  const brand = brands.find((b) => b.id === post?.brand);

  const cardBg = theme === 'light' ? 'bg-white border-slate-200' : 'glass-card-dark';
  const secondaryText = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/10';
  const textColor = theme === 'light' ? 'text-slate-800' : 'text-white';

  if (!post) {
    return (
      <div className={cn('rounded-2xl p-16 text-center border', cardBg)}>
        <p className={cn('text-lg', secondaryText)}>帖子不存在</p>
        <Link to="/" className="gradient-btn inline-block mt-4">返回首页</Link>
      </div>
    );
  }

  const featuredComments = post.comments.filter((c) => c.isFeatured);
  const normalComments = post.comments.filter((c) => !c.isFeatured);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText, '现场访客', '👤');
    setCommentText('');
    incrementPostHeat(post.id);
  };

  const shareUrl = `${window.location.origin}/post/${post.id}`;

  return (
    <div className="space-y-6">
      <Link to="/" className={cn('inline-flex items-center gap-2 transition-colors hover:text-cyber-400', textColor)}>
        <ArrowLeft size={20} />
        返回讨论列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Content */}
          <article className={cn('rounded-2xl p-8 border', cardBg)}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tech-500 to-cyber-500 flex items-center justify-center text-3xl shadow-lg shadow-cyber-500/30 shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  {post.isPinned && (
                    <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium flex items-center gap-1">
                      <Pin size={12} /> 置顶
                    </span>
                  )}
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs bg-cyber-500/10 text-cyber-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h1 className={cn('text-2xl md:text-3xl font-bold mb-3', textColor)}>{post.title}</h1>
                <div className={cn('flex items-center gap-4 text-sm', secondaryText)}>
                  <span className="font-semibold" style={{ color: brand?.color }}>
                    {post.author}
                  </span>
                  <span>·</span>
                  <span>{post.createdAt}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-accent-500">
                    <Flame size={14} /> {post.heat.toLocaleString()} 热度
                  </span>
                </div>
              </div>
            </div>

            <div className={cn('prose prose-lg max-w-none leading-relaxed', theme === 'light' ? 'text-slate-700' : 'text-slate-300')}>
              <p className="text-base md:text-lg">{post.content}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="flex-1 flex items-center gap-6">
                <span className={cn('flex items-center gap-2', secondaryText)}>
                  <MessageCircle size={18} /> {post.comments.length} 评论
                </span>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all', inputBg, 'hover:bg-cyber-500/10')}
              >
                <Share2 size={18} className="text-cyber-400" />
                <span className={secondaryText}>分享</span>
              </button>
              <button className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all', inputBg, 'hover:bg-accent-500/10')}>
                <Bookmark size={18} className="text-accent-500" />
                <span className={secondaryText}>收藏</span>
              </button>
            </div>

            {/* QR Code Share */}
            {showQR && (
              <div className="mt-6 p-6 rounded-xl border border-dashed border-cyber-500/30 bg-cyber-500/5 flex flex-col sm:flex-row items-center gap-6">
                <div className={cn('p-4 rounded-xl bg-white shrink-0')}>
                  <QRCodeSVG value={shareUrl} size={120} level="M" />
                </div>
                <div>
                  <h4 className={cn('font-semibold mb-2', textColor)}>扫码收藏分享</h4>
                  <p className={cn('text-sm mb-3', secondaryText)}>
                    手机扫描二维码即可收藏此帖子并在手机上查看详情
                  </p>
                  <p className={cn('text-xs font-mono break-all', secondaryText)}>{shareUrl}</p>
                </div>
              </div>
            )}
          </article>

          {/* Featured Comments */}
          {featuredComments.length > 0 && (
            <section className={cn('rounded-2xl p-6 border-2 border-amber-500/30', theme === 'light' ? 'bg-amber-50/50' : 'bg-amber-500/5')}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-500">
                <Star fill="currentColor" size={20} />
                精选回答
              </h3>
              <div className="space-y-4">
                {featuredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn('p-4 rounded-xl border', theme === 'light' ? 'bg-white border-amber-200' : 'bg-amber-500/10 border-amber-500/20')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0', inputBg)}>
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('font-semibold', textColor)}>{comment.author}</span>
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-500">精选</span>
                        </div>
                        <p className={cn('text-sm leading-relaxed', theme === 'light' ? 'text-slate-700' : 'text-slate-200')}>
                          {comment.content}
                        </p>
                        <div className={cn('flex items-center gap-4 mt-3 text-xs', secondaryText)}>
                          <span>{comment.createdAt}</span>
                          <button
                            onClick={() => toggleCommentLike(post.id, comment.id)}
                            className="flex items-center gap-1 hover:text-accent-500 transition-colors"
                          >
                            <ThumbsUp size={12} /> {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className={cn('text-lg font-bold mb-4', textColor)}>发表评论</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="输入你的评论..."
                className={cn('flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all', theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-tech-500 focus:ring-2 focus:ring-tech-500/20 text-slate-800' : 'bg-slate-800/50 border-white/10 focus:border-cyber-500 focus:ring-2 focus:ring-cyber-500/20 text-white placeholder-slate-500')}
              />
              <button type="submit" className="gradient-btn px-6 flex items-center gap-2">
                <Send size={16} />
                发送
              </button>
            </div>
          </form>

          {/* All Comments */}
          <section className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className={cn('text-lg font-bold mb-4', textColor)}>
              全部评论 <span className={secondaryText}>（{normalComments.length}）</span>
            </h3>
            <div className="space-y-4">
              {normalComments.map((comment) => (
                <div key={comment.id} className={cn('p-4 rounded-xl', theme === 'light' ? 'bg-slate-50' : 'bg-white/5')}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0', inputBg)}>
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('font-semibold', textColor)}>{comment.author}</span>
                      </div>
                      <p className={cn('text-sm leading-relaxed', theme === 'light' ? 'text-slate-700' : 'text-slate-200')}>
                        {comment.content}
                      </p>
                      <div className={cn('flex items-center gap-4 mt-3 text-xs', secondaryText)}>
                        <span>{comment.createdAt}</span>
                        <button
                          onClick={() => toggleCommentLike(post.id, comment.id)}
                          className="flex items-center gap-1 hover:text-accent-500 transition-colors"
                        >
                          <ThumbsUp size={12} /> {comment.likes}
                        </button>
                        <button
                          onClick={() => toggleFeaturedComment(post.id, comment.id)}
                          className={cn('flex items-center gap-1 transition-colors', comment.isFeatured ? 'text-amber-500' : 'hover:text-amber-500')}
                        >
                          <Star size={12} /> 设为精选
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {normalComments.length === 0 && featuredComments.length === 0 && (
                <p className={cn('text-center py-8', secondaryText)}>暂无评论，快来抢沙发！</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className={cn('rounded-2xl p-6 border', cardBg)}>
            <h3 className={cn('text-lg font-bold mb-4', textColor)}>帖子信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={secondaryText}>作者</span>
                <span className={cn('font-medium', textColor)}>{post.author}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={secondaryText}>发布时间</span>
                <span className={cn('text-sm', textColor)}>{post.createdAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={secondaryText}>热度</span>
                <span className="font-bold text-accent-500">{post.heat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={secondaryText}>评论数</span>
                <span className={cn('font-medium', textColor)}>{post.comments.length}</span>
              </div>
              {brand && (
                <div className="flex justify-between items-center">
                  <span className={secondaryText}>相关品牌</span>
                  <span className="font-medium" style={{ color: brand.color }}>
                    {brand.logo} {brand.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={cn('rounded-2xl p-6 border text-center', cardBg)}>
            <h4 className={cn('font-semibold mb-3', textColor)}>扫码收藏本帖</h4>
            <div className={cn('inline-block p-4 rounded-xl bg-white mb-3')}>
              <QRCodeSVG value={shareUrl} size={140} level="M" />
            </div>
            <p className={cn('text-xs', secondaryText)}>手机扫码即可在手机上查看</p>
          </div>
        </div>
      </div>
    </div>
  );
}
