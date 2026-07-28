import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Layers, ChevronRight } from 'lucide-react';
import PageShell from '../components/PageShell';
import { serviceService } from '../services/serviceService';
import { Service } from '../models/service';
import { useLanguage } from '../contexts/LanguageContext';
import { STORAGE_URL } from '../lib/api';

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isArabic } = useLanguage();
  const [service, setService] = useState<Service | null>(null);
  const [parent, setParent] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setParent(null);

    serviceService.get(slug)
      .then(async r => {
        setService(r.service);
        // If it's a sub-service, also fetch parent for breadcrumb
        if (r.service.parent_id) {
          try {
            const parentRes = await serviceService.get(r.service.parent_id);
            setParent(parentRes.service);
          } catch {
            // parent fetch is non-critical
          }
        }
      })
      .catch(() => setError(isArabic ? 'الخدمة غير موجودة.' : 'Service not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const hasSubServices = service?.sub_services && service.sub_services.length > 0;

  return (
    <PageShell>
      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : error || !service ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <p className="text-white/50">{error || 'Not found'}</p>
          <Link to="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center flex-wrap gap-1.5 text-xs text-white/40 font-medium mb-10"
          >
            <Link to="/" className="hover:text-white transition-colors">{isArabic ? 'الرئيسية' : 'Home'}</Link>
            <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
            <Link to="/#services" className="hover:text-white transition-colors">{isArabic ? 'الخدمات' : 'Services'}</Link>
            {parent && (
              <>
                <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                <Link to={`/services/${parent.slug}`} className="hover:text-white transition-colors">
                  {t(parent.title, parent.title_ar)}
                </Link>
              </>
            )}
            <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
            <span className="text-white/60">{t(service.title, service.title_ar)}</span>
          </motion.div>

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link
              to={parent ? `/services/${parent.slug}` : '/#services'}
              className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors group"
            >
              <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
              {parent ? t(parent.title, parent.title_ar) : (isArabic ? 'العودة إلى الخدمات' : 'Back to Services')}
            </Link>
          </motion.div>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Icon / Image */}
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-lg shadow-primary/10">
              {service.image ? (
                <img src={STORAGE_URL + service.image} alt="" className="w-9 h-9 object-contain" />
              ) : (
                <Layers className="w-8 h-8" />
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {t(service.title, service.title_ar)}
            </h1>

            {(service.short_description || service.short_description_ar) && (
              <p className="text-white/60 text-xl leading-relaxed max-w-3xl">
                {t(service.short_description, service.short_description_ar)}
              </p>
            )}
          </motion.div>

          {/* Full Description */}
          {(service.description || service.description_ar) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-surface/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 mb-14"
            >
              <p className="text-white/70 leading-relaxed text-base whitespace-pre-wrap">
                {t(service.description, service.description_ar)}
              </p>
            </motion.div>
          )}

          {/* Sub-services grid (same panel style as landing page) */}
          {hasSubServices && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                {isArabic ? 'الخدمات الفرعية' : 'Sub-Services'}
              </h2>
              <p className="text-white/40 text-sm mb-8">
                {isArabic
                  ? 'اختر من الخدمات الفرعية المتاحة لمعرفة المزيد.'
                  : 'Explore the specific services within this area.'}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.sub_services!.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={`/services/${sub.slug}`}
                      className="group flex flex-col h-full bg-surface/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-surface/70 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1.5"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary group-hover:bg-primary/20 transition-colors">
                        {sub.image ? (
                          <img src={STORAGE_URL + sub.image} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <Layers className="w-5 h-5" />
                        )}
                      </div>

                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors flex-1">
                        {t(sub.title, sub.title_ar)}
                      </h3>

                      {(sub.short_description || sub.short_description_ar) && (
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                          {t(sub.short_description, sub.short_description_ar)}
                        </p>
                      )}

                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary/60 group-hover:text-primary group-hover:gap-2.5 transition-all mt-auto">
                        {isArabic ? 'اعرف المزيد' : 'Learn More'}
                        <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CTA section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface/40 backdrop-blur-2xl border border-primary/20 rounded-[2rem] p-10 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">
              {isArabic ? 'مهتم بهذه الخدمة؟' : 'Interested in this service?'}
            </h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">
              {isArabic
                ? 'تواصل معنا وسيساعدك فريقنا في تحديد الحل الأمثل لمشروعك.'
                : "Reach out and our team will help tailor the right solution for your project."}
            </p>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(26,156,221,0.3)]"
            >
              {isArabic ? 'تواصل معنا' : 'Get in Touch'}
              <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </motion.div>
        </div>
      )}
    </PageShell>
  );
}
