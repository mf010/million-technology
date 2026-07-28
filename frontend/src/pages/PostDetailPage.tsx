import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import PageShell from '../components/PageShell';
import { postService } from '../services/postService';
import { Post } from '../models/post';
import { useLanguage } from '../contexts/LanguageContext';
import { STORAGE_URL } from '../lib/api';

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isArabic } = useLanguage();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    postService.get(slug)
      .then(r => setPost(r.post))
      .catch(() => setError(isArabic ? 'المقال غير موجود.' : 'Post not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const content = post ? t(post.content, post.content_ar) : '';
  const mins = estimateReadTime(content);

  return (
    <PageShell>
      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : error || !post ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p className="text-white/50">{error || 'Not found'}</p>
          <Link to="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
        </div>
      ) : (
        <article className="relative z-10">
          {/* Hero */}
          {post.image && (
            <div className="w-full h-64 md:h-[440px] relative overflow-hidden">
              <img
                src={STORAGE_URL + post.image}
                alt={t(post.title, post.title_ar)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-[#05080a]/40 to-transparent" />
            </div>
          )}

          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 text-xs text-white/40 font-medium mb-10"
            >
              <Link to="/" className="hover:text-white transition-colors">{isArabic ? 'الرئيسية' : 'Home'}</Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              <Link to="/#posts" className="hover:text-white transition-colors">{isArabic ? 'المقالات' : 'Insights'}</Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              <span className="text-white/60 truncate max-w-[200px]">{t(post.title, post.title_ar)}</span>
            </motion.div>

            {/* Back button */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Link
                to="/#posts"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors group"
              >
                <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
                {isArabic ? 'العودة إلى المقالات' : 'Back to Insights'}
              </Link>
            </motion.div>

            {/* Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center gap-4 text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-5"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString(isArabic ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Draft'}
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary/60" />
                {mins} {isArabic ? 'دقيقة للقراءة' : 'min read'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6"
            >
              {t(post.title, post.title_ar)}
            </motion.h1>

            {/* Excerpt */}
            {(post.excerpt || post.excerpt_ar) && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white/60 text-lg leading-relaxed mb-10 border-l-2 border-primary/40 pl-5"
              >
                {t(post.excerpt, post.excerpt_ar)}
              </motion.p>
            )}

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="border-t border-white/5 mb-10"
            />

            {/* Content */}
            {content ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="
                  prose prose-invert prose-lg max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-5
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-strong:font-semibold
                  prose-code:text-primary/90 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl prose-pre:p-6
                  prose-blockquote:border-primary/50 prose-blockquote:text-white/60 prose-blockquote:italic prose-blockquote:bg-white/5 prose-blockquote:rounded-r-xl prose-blockquote:py-3
                  prose-ul:text-white/70 prose-ol:text-white/70
                  prose-li:marker:text-primary/60
                  prose-img:rounded-2xl prose-img:border prose-img:border-white/10
                  prose-hr:border-white/10
                "
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-white/30 italic text-sm">
                {isArabic ? 'لا يوجد محتوى متاح لهذا المقال.' : 'No content available for this article.'}
              </p>
            )}
          </div>
        </article>
      )}
    </PageShell>
  );
}
