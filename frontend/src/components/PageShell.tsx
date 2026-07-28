import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';
import Background3D from './Background3D';
import { useLanguage } from '../contexts/LanguageContext';
import logoImg from '../../assets/Logo.png';

function PublicNavbar() {
  const { language, setLanguage, isArabic } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-2xl border-b border-border-subtle/10 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Million Technologies Logo"
            className="w-9 h-9 object-contain rounded-xl shadow-lg shadow-primary/20"
          />
          <span className="font-semibold text-xl tracking-tight group-hover:text-primary transition-colors">
            Million
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <Link to="/#services" className="hover:text-white transition-colors">
            {isArabic ? 'خدماتنا' : 'Services'}
          </Link>
          <Link to="/#projects" className="hover:text-white transition-colors">
            {isArabic ? 'المشاريع' : 'Projects'}
          </Link>
          <Link to="/#posts" className="hover:text-white transition-colors">
            {isArabic ? 'المقالات' : 'Insights'}
          </Link>
          <Link to="/#contact" className="hover:text-white transition-colors">
            {isArabic ? 'تواصل معنا' : 'Contact'}
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all"
            title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'EN' : 'AR'}</span>
          </button>
          <Link
            to="/#contact"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary hover:bg-primary/90 text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(26,156,221,0.4)] text-white"
          >
            {isArabic ? 'ابدأ الآن' : 'Get Access'}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PublicFooter() {
  const { isArabic } = useLanguage();

  return (
    <footer className="border-t border-border-subtle/10 bg-surface/80 backdrop-blur-xl pt-12 pb-8 px-6 relative z-10 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Million Technologies Logo" className="w-8 h-8 object-contain rounded-xl" />
          <span className="font-semibold text-white/80 tracking-tight">Million Technologies</span>
        </div>
        <Link
          to="/#contact"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {isArabic ? 'ابدأ مشروعك' : 'Start a project'}{' '}
          <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    </footer>
  );
}

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen selection:bg-primary selection:text-white overflow-hidden text-white">
      <Background3D />
      <PublicNavbar />
      <div className="pt-16">
        {children}
      </div>
      <PublicFooter />
    </main>
  );
}
