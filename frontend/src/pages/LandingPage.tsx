import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Background3D from '../components/Background3D';
import {
  ArrowRight,
  Layers,
  ChevronDown,
  Star,
  Mail,
  Building,
  User,
  Briefcase,
  ChevronRight,
  Sparkles,
  Calendar,
  Code,
  ExternalLink,
  Globe,
} from 'lucide-react';

import { serviceService } from '../services/serviceService';
import { postService } from '../services/postService';
import { previousProjectService } from '../services/previousProjectService';
import { ourClientService } from '../services/ourClientService';
import { clientStatementService } from '../services/clientStatementService';
import { jobOpeningService } from '../services/jobOpeningService';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

import { Service } from '../models/service';
import { Post } from '../models/post';
import { PreviousProject } from '../models/previousProject';
import { OurClient } from '../models/ourClient';
import { ClientStatement } from '../models/clientStatement';
import { JobOpening } from '../models/jobOpening';
import logoImg from '../../assets/Logo.png';
import { STORAGE_URL } from '../lib/api';

function Navbar() {
  const { language, setLanguage, isArabic } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-2xl border-b border-border-subtle/10 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Million Technologies Logo"
            className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-primary/20"
          />
          <span className="font-semibold text-xl tracking-tight">Million</span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#services" className="hover:text-white transition-colors">{isArabic ? 'خدماتنا' : 'Services'}</a>
          <a href="#projects" className="hover:text-white transition-colors">{isArabic ? 'المشاريع' : 'Projects'}</a>
          <a href="#clients" className="hover:text-white transition-colors">{isArabic ? 'عملاؤنا' : 'Clients'}</a>
          <a href="#testimonials" className="hover:text-white transition-colors">{isArabic ? 'آراء العملاء' : 'Testimonials'}</a>
          <a href="#posts" className="hover:text-white transition-colors">{isArabic ? 'المقالات' : 'Insights'}</a>
          <a href="#careers" className="hover:text-white transition-colors">{isArabic ? 'الوظائف' : 'Careers'}</a>
          <a href="#contact" className="hover:text-white transition-colors">{isArabic ? 'تواصل معنا' : 'Contact'}</a>
        </div>
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all"
            title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
          >
            {isArabic ? 'لوحة التحكم' : 'Admin Portal'}
          </Link>
          <a
            href="#contact"
            className="px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(26,156,221,0.4)] text-white"
          >
            {isArabic ? 'ابدأ الآن' : 'Get Access'}
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { isArabic } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="max-w-4xl mx-auto text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="bg-surface/50 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] mb-10 shadow-2xl inline-block">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1]">
              {isArabic ? (
                <>
                  نصنع <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">المليون القادم</span>.
                </>
              ) : (
                <>
                  Engineering the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Next Million</span>.
                </>
              )}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="px-8 py-4 rounded-full bg-accent hover:bg-accent/90 text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,107,107,0.4)] flex items-center gap-2"
            >
              {isArabic ? 'ابدأ مشروعك' : 'Start Project'} <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            </a>
            <a
              href="#projects"
              className="px-8 py-4 rounded-full bg-surface/50 backdrop-blur-xl border border-border-subtle/20 hover:bg-surface/80 text-white font-semibold text-lg transition-all hover:scale-105 active:scale-95"
            >
              {isArabic ? 'عرض الأعمال' : 'View Showcase'}
            </a>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}

export default function LandingPage() {
  const { t, isArabic } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<PreviousProject[]>([]);
  const [clients, setClients] = useState<OurClient[]>([]);
  const [statements, setStatements] = useState<ClientStatement[]>([]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone_number: '',
    company_name: '',
    subject: '',
    message_type: 'request',
    message: '',
  });
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Eagerly fetch active, published entities for home display
    serviceService.list().then(r => setServices(r.services.slice(0, 4))).catch(() => {});
    postService.list({ page_size: 3 }).then(r => setPosts(r.data?.data ?? [])).catch(() => {});
    previousProjectService.list({ page_size: '3' }).then(r => setProjects(r.data?.data ?? [])).catch(() => {});
    ourClientService.list({ is_featured: true }).then(r => setClients(r.clients)).catch(() => {});
    clientStatementService.list().then(r => setStatements(r.statements)).catch(() => {});
    jobOpeningService.list({ page_size: '3' }).then(r => setJobs(r.data?.data ?? [])).catch(() => {});
  }, []);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactSuccess('');
    setContactError('');
    setIsSubmitting(true);
    try {
      await api.post('/client-reach', contactForm);
      setContactSuccess('Your message has been sent successfully. We will get back to you shortly.');
      setContactForm({
        name: '',
        email: '',
        phone_number: '',
        company_name: '',
        subject: '',
        message_type: 'request',
        message: '',
      });
    } catch (err: any) {
      setContactError(err.message ?? 'Failed to submit form. Please check your entries.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen selection:bg-primary selection:text-white overflow-hidden text-white">
      <Background3D />
      <Navbar />
      <Hero />

      {/* Services Section */}
      <section id="services" className="py-24 px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'خدماتنا الأساسية' : 'Core Services'}</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, i) => (
            <Link key={svc.id} to={`/services/${svc.slug}`} className="block group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface/50 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] hover:bg-surface/70 hover:border-primary/30 transition-all hover:-translate-y-1.5 duration-300 h-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{t(svc.title, svc.title_ar)}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{t(svc.short_description, svc.short_description_ar)}</p>
                {svc.sub_services && svc.sub_services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {svc.sub_services.map(sub => (
                      <span key={sub.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                        {t(sub.title, sub.title_ar)}
                      </span>
                    ))}
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary/50 group-hover:text-primary group-hover:gap-2 transition-all mt-5">
                  {isArabic ? 'اعرف المزيد' : 'Learn more'} <ChevronRight className={`w-3 h-3 ${isArabic ? 'rotate-180' : ''}`} />
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Previous Projects Section */}
      <section id="projects" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'دراسات حالة' : 'Case Studies'}</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            {isArabic ? 'عرض لمشاريع هندسية مختارة قمنا بتسليمها عالمياً.' : 'A showcase of selected engineering case studies we delivered globally.'}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((proj, i) => (
            <Link key={proj.id} to={`/projects/${proj.slug}`} className="block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col group hover:bg-surface/60 hover:border-white/20 transition-all duration-300"
            >
              {/* Cover */}
              <div className="h-48 overflow-hidden relative bg-white/5">
                {proj.cover_image ? (
                  <img
                    src={STORAGE_URL + proj.cover_image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <Code className="w-12 h-12" />
                  </div>
                )}
                {proj.is_featured && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/90 text-white text-xs font-semibold backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" /> {isArabic ? 'مميّز' : 'Featured'}
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                  {proj.client?.name ?? t(proj.client_display_name, proj.client_display_name_ar) ?? (isArabic ? 'عرض' : 'Showcase')}
                </p>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{t(proj.title, proj.title_ar)}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1">{t(proj.short_description, proj.short_description_ar)}</p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(isArabic && proj.technologies_ar ? proj.technologies_ar : proj.technologies)?.slice(0, 4).map(tech => (
                    <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/50">
                      {tech}
                    </span>
                  ))}
                </div>
                {proj.project_url && (
                  <a
                    href={proj.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-primary transition-colors"
                  >
                    {isArabic ? 'عرض المشروع' : 'View Project'} <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Clients Slider */}
      {clients.length > 0 && (
        <section id="clients" className="py-16 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/5">
          <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-widest mb-10">{isArabic ? 'موثوق من قبل علامات تجارية مبتكرة' : 'Trusted By Innovative Brands'}</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            {clients.map(client => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="h-10 opacity-40 hover:opacity-100 transition-opacity"
              >
                {client.logo ? (
                  <img src={STORAGE_URL + client.logo} alt={client.name} className="h-full object-contain filter grayscale invert" />
                ) : (
                  <span className="text-white text-lg font-bold tracking-tight">{client.name}</span>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Client Testimonials */}
      {statements.length > 0 && (
        <section id="testimonials" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'ماذا يقول القادة' : 'What Leaders Say'}</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              {isArabic ? 'شهادات من شركاء أطلقنا معهم منتجات ناجحة.' : 'Testimonials from partners we launched products alongside.'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statements.map((stmt, i) => (
              <motion.div
                key={stmt.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-4 h-4 ${idx < stmt.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-white/70 italic text-sm leading-relaxed mb-6">"{t(stmt.statement, stmt.statement_ar)}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  {stmt.client_image ? (
                    <img src={STORAGE_URL + stmt.client_image} className="w-10 h-10 rounded-full object-cover bg-white/5 border border-white/10" alt={stmt.client_name} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-white/30" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t(stmt.client_name, stmt.client_name_ar)}</h4>
                    <p className="text-[11px] text-white/40">{t(stmt.client_position, stmt.client_position_ar)} {isArabic ? 'في' : 'at'} {t(stmt.company_name, stmt.company_name_ar) ?? stmt.client?.name}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Insights / Posts Section */}
      {posts.length > 0 && (
        <section id="posts" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'آخر المقالات' : 'Latest Insights'}</h2>
              <p className="text-white/60 text-lg max-w-xl">
                {isArabic ? 'اقرأ آخر التحديثات الهندسية والتقنية من فريق بناة منتجاتنا.' : 'Read engineering, platform, and ecosystem updates from our product builders.'}
              </p>
            </div>
            <a href="#contact" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all mt-4 md:mt-0">
              {isArabic ? 'اشترك في المقالات' : 'Subscribe to Insights'} <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <Link key={post.id} to={`/posts/${post.slug}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col group hover:border-primary/20 hover:bg-surface/50 transition-all duration-300 h-full"
              >
                {post.image ? (
                  <div className="h-44 overflow-hidden relative bg-white/5">
                    <img src={STORAGE_URL + post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                  </div>
                ) : null}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-3 leading-snug">{t(post.title, post.title_ar)}</h3>
                    <p className="text-white/50 text-xs leading-relaxed mb-6">{t(post.excerpt, post.excerpt_ar)}</p>
                  </div>
                  <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                    {isArabic ? 'اقرأ المقال' : 'Read Article'} <ChevronRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform ${isArabic ? 'rotate-180' : ''}`} />
                  </span>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Careers Section */}
      {jobs.length > 0 && (
        <section id="careers" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'وظائف متاحة' : 'Open Roles'}</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              {isArabic ? 'انضم إلينا في بناء وحدات عالية الأداء لعملاء عالميين.' : 'Join us in building high-performance modules and microservices for global clients.'}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-surface/40 backdrop-blur-2xl border border-white/5 hover:border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group transition-colors duration-300"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{t(job.title, job.title_ar)}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-white/40 font-medium">
                    <span>{t(job.department, job.department_ar)}</span>
                    <span>•</span>
                    <span>{t(job.location, job.location_ar)} ({t(job.workplace_type, job.workplace_type_ar)})</span>
                    <span>•</span>
                    <span className="capitalize">{t(job.employment_type, job.employment_type_ar)}</span>
                  </div>
                </div>
                <a
                  href={job.application_url || `mailto:${job.application_email}`}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary group-hover:border-primary text-white text-xs font-semibold transition-all shrink-0"
                >
                  {isArabic ? 'قدّم الآن' : 'Apply Now'}
                </a>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 relative z-10 max-w-5xl mx-auto border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{isArabic ? 'لنبني معاً.' : "Let's build."}</h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              {isArabic
                ? 'هل أنت جاهز لبدء مشروع، أو استشارة حول التوسع، أو استكشاف شراكات استراتيجية؟ اكتب لنا وسنرد خلال 24 ساعة.'
                : "Ready to initialize a project, consult on scaling, or explore strategic partnerships? Write to us, and we'll reply inside 24 hours."}
            </p>

            <div className="space-y-4 text-sm font-medium text-white/70">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary"><Mail className="w-4 h-4" /></div>
                <span>contact@millionmobile.ly</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary"><Building className="w-4 h-4" /></div>
                <span>Libya, Tripoli</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-surface/50 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-xl">
            {contactSuccess ? (
              <p className="text-green-400 text-sm font-semibold">{contactSuccess}</p>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactError && <p className="text-accent text-xs font-semibold">{contactError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Name *</label>
                    <input required type="text" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Email *</label>
                    <input required type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Phone</label>
                    <input type="text" value={contactForm.phone_number} onChange={e => setContactForm(f => ({ ...f, phone_number: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Company</label>
                    <input type="text" value={contactForm.company_name} onChange={e => setContactForm(f => ({ ...f, company_name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Subject *</label>
                    <input required type="text" value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Type *</label>
                    <select value={contactForm.message_type} onChange={e => setContactForm(f => ({ ...f, message_type: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm outline-none focus:border-primary/50 transition-all">
                      <option value="request">Project Request</option>
                      <option value="question">General Inquiry</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="complaint">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-1">Message *</label>
                  <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/50 transition-all" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(26,156,221,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : (isArabic ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle/10 bg-surface/80 backdrop-blur-xl pt-16 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Million Technologies Logo" className="w-8 h-8 object-contain rounded-xl" />
            <span className="font-semibold text-white/80 tracking-tight">Million Technologies</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
