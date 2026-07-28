import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Code,
  ExternalLink,
  Calendar,
  Sparkles,
  Target,
  Lightbulb,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import PageShell from '../components/PageShell';
import { previousProjectService } from '../services/previousProjectService';
import { PreviousProject } from '../models/previousProject';
import { useLanguage } from '../contexts/LanguageContext';
import { STORAGE_URL } from '../lib/api';

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isArabic } = useLanguage();
  const [project, setProject] = useState<PreviousProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    previousProjectService.get(slug)
      .then(r => setProject(r.project))
      .catch(() => setError(isArabic ? 'المشروع غير موجود.' : 'Project not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PageShell>
      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : error || !project ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p className="text-white/50">{error || 'Not found'}</p>
          <Link to="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Hero */}
          {project.cover_image ? (
            <div className="w-full h-64 md:h-[480px] relative overflow-hidden">
              <img
                src={STORAGE_URL + project.cover_image}
                alt={t(project.title, project.title_ar)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-[#05080a]/30 to-transparent" />
              {project.is_featured && (
                <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/90 text-white text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isArabic ? 'مميّز' : 'Featured'}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full h-40 bg-white/5 border-b border-white/5 flex items-center justify-center text-white/10">
              <Code className="w-16 h-16" />
            </div>
          )}

          <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-xs text-white/40 font-medium mb-8"
            >
              <Link to="/" className="hover:text-white transition-colors">{isArabic ? 'الرئيسية' : 'Home'}</Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              <Link to="/#projects" className="hover:text-white transition-colors">{isArabic ? 'المشاريع' : 'Projects'}</Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              <span className="text-white/60 truncate max-w-[200px]">{t(project.title, project.title_ar)}</span>
            </motion.div>

            {/* Back */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Link
                to="/#projects"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors group"
              >
                <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
                {isArabic ? 'العودة إلى المشاريع' : 'Back to Projects'}
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                {project.client?.name
                  ?? t(project.client_display_name, project.client_display_name_ar)
                  ?? (isArabic ? 'عرض' : 'Showcase')}
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {t(project.title, project.title_ar)}
              </h1>
              {(project.short_description || project.short_description_ar) && (
                <p className="text-white/60 text-lg leading-relaxed max-w-3xl">
                  {t(project.short_description, project.short_description_ar)}
                </p>
              )}
            </motion.div>

            {/* Meta strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 mb-12 flex flex-wrap gap-8 items-start"
            >
              {project.completed_at && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {isArabic ? 'تاريخ الإنجاز' : 'Completed'}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {new Date(project.completed_at).toLocaleDateString(isArabic ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
              )}
              {project.project_url && (
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
                    {isArabic ? 'الرابط المباشر' : 'Live URL'}
                  </p>
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
                  >
                    {isArabic ? 'عرض المشروع' : 'View Live'} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
              {project.technologies?.length > 0 && (
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                    {isArabic ? 'التقنيات المستخدمة' : 'Technologies'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(isArabic && project.technologies_ar
                      ? project.technologies_ar
                      : project.technologies
                    ).map(tech => (
                      <span
                        key={tech}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary/90 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Content sections */}
            <div className="space-y-6">
              {/* Overview */}
              {(project.description || project.description_ar) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8"
                >
                  <h2 className="text-xl font-bold mb-5 text-white">
                    {isArabic ? 'نظرة عامة' : 'Project Overview'}
                  </h2>
                  <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                    {t(project.description, project.description_ar)}
                  </p>
                </motion.div>
              )}

              {/* Challenge / Solution / Results */}
              {((project.challenge || project.challenge_ar)
                || (project.solution || project.solution_ar)
                || (project.results || project.results_ar)) && (
                <div className="grid md:grid-cols-3 gap-6">
                  {(project.challenge || project.challenge_ar) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 }}
                      className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white">{isArabic ? 'التحدي' : 'The Challenge'}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {t(project.challenge, project.challenge_ar)}
                      </p>
                    </motion.div>
                  )}
                  {(project.solution || project.solution_ar) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white">{isArabic ? 'الحل' : 'Our Solution'}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {t(project.solution, project.solution_ar)}
                      </p>
                    </motion.div>
                  )}
                  {(project.results || project.results_ar) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 }}
                      className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-5">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold mb-3 text-white">{isArabic ? 'النتائج' : 'Results'}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {t(project.results, project.results_ar)}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Gallery */}
              {project.gallery_images && project.gallery_images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8"
                >
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    {isArabic ? 'معرض الصور' : 'Gallery'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery_images.map((img, i) => (
                      <div key={i} className="aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                        <img
                          src={STORAGE_URL + img}
                          alt={`${t(project.title, project.title_ar)} — ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* CTA */}
            {project.project_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-14 text-center"
              >
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(26,156,221,0.4)]"
                >
                  {isArabic ? 'عرض المشروع الحي' : 'View Live Project'}
                  <ExternalLink className="w-5 h-5" />
                </a>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
