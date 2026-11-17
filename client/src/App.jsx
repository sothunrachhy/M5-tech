import { useCallback, useState } from 'react';
import { useI18n } from './i18n/LanguageContext.jsx';
import { api } from './lib/api.js';
import { useApi } from './lib/useApi.js';
import Navbar from './components/Navbar.jsx';
import Hero, { HeroBackdrop } from './components/Hero.jsx';
import DashboardPreview from './components/DashboardPreview.jsx';
import Capabilities from './components/Capabilities.jsx';
import Services from './components/Services.jsx';
import Solutions from './components/Solutions.jsx';
import Portfolio from './components/Portfolio.jsx';
import WhyUs from './components/WhyUs.jsx';
import Process from './components/Process.jsx';
import Faq from './components/Faq.jsx';
import Testimonials from './components/Testimonials.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import NightBackdrop from './components/NightBackdrop.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import { FEATURES } from './lib/features.js';

export default function App() {
  const { lang, t } = useI18n();
  const content = useApi(api.content, lang);
  const modules = useApi(api.modules, FEATURES.dashboardPreview ? lang : null);
  const [activeModule, setActiveModule] = useState(null);
  const [prefill, setPrefill] = useState(null);

  /** Jump to the project request form, optionally pre-selecting fields. */
  const requestProject = useCallback((fields = {}) => {
    setPrefill({ ...fields, at: Date.now() });
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const showModule = useCallback((slug) => {
    setActiveModule(slug);
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const data = content.data;
  const contact = data?.contact ?? {};
  const section = { loading: content.loading && !data, error: !data ? content.error : null, retry: content.retry };

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-white px-4 py-2 font-semibold text-brand-700 shadow-lift focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t.common.skip}
      </a>
      <Navbar modules={modules.data ?? []} onSelectModule={showModule} onStart={() => requestProject()} contact={contact} />

      <main id="main">
        {/* night-themed opening: hero, optional dashboard, capabilities */}
        <div className="relative isolate overflow-hidden">
          <HeroBackdrop />
          <Hero onStart={() => requestProject()} />
          {FEATURES.dashboardPreview && <DashboardPreview modules={modules} activeSlug={activeModule} onSelect={setActiveModule} />}
          <Capabilities />
        </div>
        {/* Services → Contact share one moving night background (sticky, so no overflow-hidden here) */}
        <div className="relative isolate bg-night-950">
          <NightBackdrop />
          {/* blend the moving layer into the hero above and the footer below */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-night-950 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-night-950 to-transparent" />
          <Services items={data?.services} {...section} onInquire={requestProject} />
          <Solutions items={data?.industries} {...section} onRequest={requestProject} />
          {FEATURES.portfolio && <Portfolio items={data?.projects} {...section} onBuildSimilar={requestProject} />}
          <WhyUs items={data?.why} {...section} onStart={() => requestProject()} />
          <Process items={data?.process} {...section} />
          <Testimonials items={data?.testimonials} />
          <Faq items={data?.faqs} {...section} contact={contact} />
          <Contact contact={contact} prefill={prefill} />
        </div>
      </main>

      <Footer contact={contact} services={data?.services ?? []} />
      <FloatingActions contact={contact} />
    </div>
  );
}
