
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

// Full list of 10 expert mentors
const ALL_MENTORS = [
  { id: 'm1', name: 'Amit Kumar', specialty: 'Coding & AI', image: '/images/mentor1.jpg', initials: 'AK', color: '#5e6ad2' },
  { id: 'm2', name: 'Sneha Verma', specialty: 'Math Mystery', image: null, initials: 'SV', color: '#ec4899' },
  { id: 'm3', name: 'Rohit Sharma', specialty: 'Science', image: null, initials: 'RS', color: '#8b5cf6' },
  { id: 'm4', name: 'Priya Singh', specialty: 'English', image: null, initials: 'PS', color: '#10b981' },
  { id: 'm5', name: 'Karan Mehta', specialty: 'Vedic / Speed Math', image: null, initials: 'KM', color: '#f59e0b' },
  { id: 'm6', name: 'Rahul Verma', specialty: 'Coding & AI', image: null, initials: 'RV', color: '#06b6d4' },
  { id: 'm7', name: 'Ananya Iyer', specialty: 'Math Mystery', image: null, initials: 'AI', color: '#8b5cf6' },
  { id: 'm8', name: 'Vikram Malhotra', specialty: 'Science', image: null, initials: 'VM', color: '#6366f1' },
  { id: 'm9', name: 'Pooja Nair', specialty: 'English', image: null, initials: 'PN', color: '#14b8a6' },
  { id: 'm10', name: 'Divya Sen', specialty: 'Vedic / Speed Math', image: null, initials: 'DS', color: '#f43f5e' },
];

const TESTIMONIALS = [
  { id: 1, quote: 'My child loved the trial class! The mentor was very friendly and explained everything so well.', author: 'Sarah Jenkins', location: 'Parent from USA', rating: 5, avatar: '/images/parent-avatar.jpg' },
  { id: 2, quote: 'The 1:1 format made a huge difference. My 9-year-old built their first interactive game in 60 minutes!', author: 'David Richardson', location: 'Parent from UK', rating: 5, avatar: '/images/parent-avatar.jpg' },
  { id: 3, quote: "Super easy scheduling across timezones. The mentor matched my daughter's pace perfectly.", author: 'Emily Chen', location: 'Parent from Canada', rating: 5, avatar: '/images/parent-avatar.jpg' },
];

// FAQ questions
const FAQS = [
  { q: 'Is the trial class completely free?', a: 'Yes, 100% free! No credit card is required to book a 1:1 trial session. A dummy meeting link is generated instantly.' },
  { q: 'How are mentors assigned to students?', a: 'Our smart load-balancing engine matches your child with a certified expert mentor who has available capacity for your chosen date and timezone.' },
  { q: 'What age group are Codeyoung classes designed for?', a: 'Our curriculum is customized for kids aged 5 to 17, from complete beginners in block coding to advanced Python, AI, and Web Development.' },
  { q: 'What equipment do we need for the trial class?', a: 'All you need is a laptop or desktop computer with a working webcam, microphone, and a stable internet connection.' },
];

// Animated counter using IntersectionObserver
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (isNaN(parseInt(target, 10))) { setCount(target); return; }
    const numTarget = parseInt(target, 10);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = Math.max(1, Math.ceil(numTarget / 80));
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, numTarget);
          setCount(current);
          if (current >= numTarget) clearInterval(timer);
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{typeof count === 'number' ? count.toLocaleString() : count}{suffix}</span>;
};

// ── Embedded stylesheet — indigo/blue palette, covers every section below ──
const HOME_STYLES = `
html { scroll-behavior: smooth; }

.home-container {
  --ink: #111827;
  --muted: #6b7280;
  --paper: #f7f8fb;
  --white: #ffffff;
  --accent: #5e6ad2;
  --accent-dark: #4249b8;
  --accent-tint: #eeeffc;
  --border: #e7e8ef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
  color: var(--ink);
  background: var(--paper);
  overflow-x: hidden;
}
.home-container * { box-sizing: border-box; }

.btn {
  display: inline-flex; align-items: center; gap: 8px;
  border-radius: 999px; font-weight: 700; font-size: 0.95rem;
  padding: 13px 24px; border: 1px solid transparent; cursor: pointer;
  text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}
.btn-primary { background: var(--accent); color: var(--white); box-shadow: 0 10px 24px -12px rgba(94,106,210,0.5); }
.btn-primary:hover { transform: translateY(-2px); }
.btn-outline { background: transparent; color: var(--accent-dark); border-color: var(--accent); }
.btn-outline:hover { background: var(--accent-tint); }

/* ---------- nav bar ---------- */
.site-navbar {
  position: sticky; top: 0; z-index: 20;
  max-width: 1360px; margin: 0 auto; padding: 16px 32px;
  display: flex; align-items: center; gap: 28px;
  border-bottom: 1px solid var(--border);
  background: rgba(247,248,251,0.9); backdrop-filter: blur(6px);
}
.nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.1rem; color: var(--ink); text-decoration: none; margin-right: 8px; }
.nav-logo-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--accent); color: var(--white); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; }
.nav-links { display: flex; align-items: center; gap: 26px; flex: 1; font-size: 0.92rem; font-weight: 500; color: #374151; }
.nav-links a { color: inherit; text-decoration: none; cursor: pointer; }
.nav-link-active { color: var(--accent-dark); font-weight: 700; }
.nav-right { display: flex; align-items: center; gap: 12px; }

/* ---------- hero ---------- */
.hero-grid-section { display: grid; grid-template-columns: 1.05fr 1.1fr 0.85fr; gap: 36px; align-items: center; max-width: 1360px; margin: 0 auto; padding: 52px 32px 60px; scroll-margin-top: 80px; }
.hero-pill-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--accent-tint); padding: 8px 18px; border-radius: 999px; font-size: 0.82rem; font-weight: 700; color: var(--accent-dark); margin-bottom: 22px; }
.hero-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; }
.hero-headline { font-size: clamp(2.2rem, 3.6vw, 3.15rem); line-height: 1.12; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 20px; color: var(--ink); }
.hero-highlight { color: var(--accent); }
.hero-subheadline { font-size: 1.02rem; line-height: 1.65; color: var(--muted); max-width: 46ch; margin: 0 0 28px; }
.hero-cta-group { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
.hero-trust-row { display: flex; flex-wrap: wrap; gap: 10px 26px; }
.trust-item { display: flex; align-items: center; gap: 7px; font-size: 0.86rem; color: #374151; font-weight: 500; }
.trust-icon-sm { color: var(--accent); font-size: 0.9rem; }

.hero-center-col { display: flex; justify-content: center; }
.illustration-wrapper { position: relative; width: 100%; max-width: 400px; }
.hero-img-frame { position: relative; width: 100%; aspect-ratio: 4 / 4.6; border-radius: 26px; overflow: hidden; background: linear-gradient(160deg, #eef1fb, #e3e7f8); outline: 2px dashed #c7cdf3; outline-offset: 8px; }
.hero-kid-img { width: 100%; height: 100%; object-fit: cover; display: block; }

.hero-step-card {
  position: absolute; z-index: 3; background: var(--white); border-radius: 14px;
  padding: 12px 14px; box-shadow: 0 12px 26px -14px rgba(17,24,39,0.3); max-width: 200px;
  display: flex; gap: 10px; align-items: flex-start;
}
.step-card-top { top: -16px; left: -20px; }
.step-card-bottom { bottom: -16px; right: -20px; }
.step-badge-num { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: var(--accent); color: var(--white); font-size: 0.72rem; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.hero-step-card p { margin: 0; font-size: 0.74rem; color: var(--muted); line-height: 1.35; }

.floating-doodle-card { position: absolute; top: 40%; left: -18px; z-index: 3; display: flex; align-items: center; gap: 10px; background: var(--white); border-radius: 16px; padding: 10px 14px; box-shadow: 0 14px 28px -14px rgba(17,24,39,0.28); }
.doodle-bulb { font-size: 1.05rem; }
.doodle-text { display: flex; flex-direction: column; font-size: 0.72rem; font-weight: 700; color: var(--accent-dark); line-height: 1.35; }

/* hero right: quick highlights list */
.hero-highlights-list { display: flex; flex-direction: column; gap: 16px; }
.highlight-item { display: flex; align-items: center; gap: 16px; background: var(--white); border: 1px solid var(--border); border-radius: 18px; padding: 16px 20px; box-shadow: 0 14px 30px -20px rgba(17,24,39,0.25); }
.highlight-icon-wrap { flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
.icon-bg-pink { background: #fde3ec; }
.icon-bg-green { background: #d7f7e8; }
.icon-bg-purple { background: #ede9fe; }
.icon-bg-yellow { background: #fef3d7; }
.highlight-title { margin: 0 0 2px; font-size: 0.98rem; font-weight: 700; color: var(--ink); }
.highlight-sub { margin: 0; font-size: 0.82rem; color: var(--muted); }

/* ---------- feature highlight (curiosity → real skills) ---------- */
.feature-highlight-section { max-width: 1360px; margin: 0 auto; padding: 60px 32px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; align-items: center; scroll-margin-top: 80px; }
.fh-headline { font-size: clamp(1.7rem, 2.8vw, 2.3rem); font-weight: 800; margin: 0 0 16px; line-height: 1.2; }
.fh-subtext { color: var(--muted); line-height: 1.6; margin: 0 0 22px; max-width: 42ch; }
.course-orbit-wrap { position: relative; width: 100%; max-width: 320px; aspect-ratio: 1; margin: 0 auto; }
.course-center-hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 76px; height: 76px; border-radius: 50%; background: var(--accent); color: var(--white); display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 14px 30px -12px rgba(94,106,210,0.5); }
.hub-code { font-size: 1.1rem; }
.course-orbit-card { position: absolute; width: 120px; background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 10px 12px; text-align: center; box-shadow: 0 10px 22px -14px rgba(17,24,39,0.25); }
.course-orbit-card p { margin: 6px 0 0; font-size: 0.72rem; font-weight: 600; }
.orbit-tl { top: 6%; left: 2%; }
.orbit-tr { top: 6%; right: 2%; }
.orbit-bl { bottom: 6%; left: 2%; }
.orbit-br { bottom: 6%; right: 2%; }
.fh-feature-list { display: flex; flex-direction: column; gap: 18px; }
.fh-feature-item { display: flex; gap: 12px; align-items: flex-start; }
.fh-feat-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; }
.icon-blue { background: #e0edff; }
.icon-red { background: #ffe4e6; }
.icon-green { background: #d7f7e8; }
.icon-purple { background: #ede9fe; }
.fh-feature-item h4 { margin: 0 0 3px; font-size: 0.92rem; font-weight: 700; }
.fh-feature-item p { margin: 0; font-size: 0.8rem; color: var(--muted); }

/* ---------- stats bar ---------- */
.stats-ribbon-card { max-width: 1360px; margin: 8px auto 50px; background: var(--white); border: 1px solid var(--border); border-radius: 20px; padding: 26px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
.stat-block { display: flex; align-items: center; gap: 14px; }
.stat-icon-wrap { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; }
.blue-soft { background: #e0edff; }
.purple-soft { background: #ede9fe; }
.stat-number { margin: 0; font-size: 1.5rem; font-weight: 800; line-height: 1.1; color: var(--ink); }
.stat-sub { font-size: 0.95rem; font-weight: 600; color: var(--muted); }
.stat-label { margin: 2px 0 0; font-size: 0.78rem; color: var(--muted); }
.stat-divider { width: 1px; height: 34px; background: var(--border); }
.stats-cta-btn { margin-left: auto; }

/* ---------- mentors + testimonial ---------- */
.mentors-testimonial-grid { max-width: 1360px; margin: 0 auto 60px; padding: 0 32px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: stretch; scroll-margin-top: 80px; }
.expert-mentors-card, .testimonial-card { background: var(--white); border: 1px solid var(--border); border-radius: 20px; padding: 28px; }
.card-top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.card-top-bar h2 { font-size: 1.2rem; font-weight: 800; margin: 0; }
.view-all-btn { background: var(--white); border: 1px solid var(--accent); color: var(--accent-dark); border-radius: 999px; padding: 7px 16px; font-weight: 700; font-size: 0.82rem; cursor: pointer; }
.view-all-btn:hover { background: var(--accent-tint); }
.mentors-row-list { display: flex; gap: 22px; flex-wrap: wrap; }
.mentors-row-list:not(.expanded) { flex-wrap: nowrap; overflow-x: auto; }
.mentor-profile-item { flex: 0 0 auto; width: 92px; text-align: center; }
.mentor-avatar-container { width: 64px; height: 64px; margin: 0 auto 10px; }
.mentor-photo { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.mentor-initials-avatar { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--white); font-weight: 700; font-size: 0.95rem; }
.mentor-name { margin: 0 0 2px; font-size: 0.82rem; font-weight: 700; }
.mentor-specialty { margin: 0; font-size: 0.72rem; color: var(--muted); }
.testimonial-card { display: flex; flex-direction: column; }
.quote-icon { font-size: 2.2rem; font-weight: 800; color: #14b8a6; line-height: 1; margin-bottom: 10px; }
.quote-body { flex: 1; font-size: 1rem; font-style: italic; line-height: 1.65; color: var(--ink); margin: 0 0 20px; }
.testimonial-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border); }
.author-info-group { display: flex; align-items: center; gap: 10px; }
.author-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.author-location { margin: 0; font-size: 0.8rem; font-weight: 600; }
.star-rating { color: #f59e0b; font-size: 0.75rem; }
.testimonial-controls { display: flex; align-items: center; gap: 8px; }
.carousel-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--white); cursor: pointer; font-size: 0.95rem; line-height: 1; display: flex; align-items: center; justify-content: center; color: var(--ink); }
.carousel-btn:hover { border-color: var(--accent); color: var(--accent-dark); }
.dots-indicator { display: flex; gap: 6px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); cursor: pointer; }
.dot.active { background: var(--accent); width: 18px; border-radius: 999px; }

/* ---------- generic info sections ---------- */
.info-section { max-width: 1360px; margin: 0 auto; padding: 50px 32px; scroll-margin-top: 80px; }
.section-title-wrap { text-align: center; max-width: 560px; margin: 0 auto 40px; }
.sub-badge-pill { display: inline-block; background: var(--accent-tint); color: var(--accent-dark); font-weight: 700; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; padding: 6px 16px; border-radius: 999px; margin-bottom: 16px; }
.section-title-wrap h2 { font-size: clamp(1.6rem, 2.6vw, 2.15rem); font-weight: 800; margin: 0 0 10px; color: var(--ink); }
.section-title-wrap p { color: var(--muted); margin: 0; line-height: 1.6; }

.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.step-card { background: var(--white); border: 1px solid var(--border); border-radius: 18px; padding: 26px; }
.step-num { width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: var(--white); font-weight: 700; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
.step-card h3 { font-size: 1.02rem; font-weight: 700; margin: 0 0 8px; color: var(--ink); }
.step-card p { font-size: 0.88rem; color: var(--muted); line-height: 1.55; margin: 0; }

.why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.why-card { background: var(--paper); border: 1px solid var(--border); border-radius: 18px; padding: 28px; }
.why-icon { font-size: 1.7rem; margin-bottom: 14px; }
.why-card h3 { font-size: 1.02rem; font-weight: 700; margin: 0 0 8px; color: var(--ink); }
.why-card p { font-size: 0.88rem; color: var(--muted); line-height: 1.55; margin: 0; }

/* faq — text/colors made explicit so questions are always visible */
.faq-list { display: flex; flex-direction: column; gap: 12px; max-width: 760px; margin: 0 auto; }
.faq-item { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 18px 22px; cursor: pointer; }
.faq-question { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.faq-question h4 { margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--ink); line-height: 1.4; }
.faq-chevron { flex-shrink: 0; color: var(--accent); font-weight: 700; font-size: 1.1rem; }
.faq-answer { margin: 12px 0 0; font-size: 0.88rem; color: var(--muted); line-height: 1.6; }
.faq-item.open { border-color: var(--accent); }

/* ---------- responsive ---------- */
@media (max-width: 1080px) {
  .hero-grid-section { grid-template-columns: 1fr 1fr; }
  .hero-right-col { grid-column: 1 / -1; }
  .mentors-testimonial-grid { grid-template-columns: 1fr; }
  .feature-highlight-section { grid-template-columns: 1fr; }
  .nav-links { display: none; }
}
@media (max-width: 720px) {
  .hero-grid-section { grid-template-columns: 1fr; padding: 40px 20px 48px; }
  .hero-center-col { order: -1; }
  .illustration-wrapper { max-width: 300px; margin: 0 auto 30px; }
  .steps-grid, .why-grid { grid-template-columns: 1fr; }
  .stats-ribbon-card { justify-content: flex-start; }
  .stats-cta-btn { margin-left: 0; }
  .site-navbar { padding: 14px 20px; }
}
`;

export const HomePage = () => {
  const [mentors, setMentors] = useState([]);
  const [showAllMentors, setShowAllMentors] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.getMentors()
      .then((res) => { if (res.data && Array.isArray(res.data) && res.data.length > 0) setMentors(res.data); })
      .catch((err) => console.error('Failed to load mentors from API:', err));
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const currentTestimonial = TESTIMONIALS[testimonialIdx];
  const nextTestimonial = () => setTestimonialIdx(prev => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setTestimonialIdx(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="home-container" id="top">
      <style>{HOME_STYLES}</style>

      {/* ── Nav bar ──────────────────────────────────────────────────────
          In-page anchor links (Home / Our Mentors / Why Codeyoung / FAQ)
          scroll to that section instead of navigating to a new route. */}
      <header className="site-navbar">
        <a href="#top" className="nav-logo">
          <span className="nav-logo-mark">C</span>
          Codeyoung
        </a>
        <nav className="nav-links">
          <a href="#top" className="nav-link-active">Home</a>
          <a href="#mentors">Our Mentors</a>
          <a href="#why-codeyoung">Why Codeyoung</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-right">
          <Link to="/bookings" className="btn btn-outline" id="nav-dashboard-btn">Dashboard</Link>
          <Link to="/book" className="btn btn-primary" id="nav-book-trial-btn">Book a Free Trial →</Link>
        </div>
      </header>

      {/* ── 1. Hero Section ─────────────────────────────────────────────── */}
      <section className="hero-grid-section">

        {/* Left Column: Headline & CTA */}
        <div className="hero-left-col">
          <div className="hero-pill-badge">
            <span className="hero-live-dot" />
            <span>Online Coding Classes for Kids</span>
          </div>

          <h1 className="hero-headline">
            Future-Ready<br />
            Skills Start <span className="hero-highlight">Here.</span>
          </h1>

          <p className="hero-subheadline">
            Interactive, personalized and project-based coding classes to help kids aged 5-17 build real skills, creativity and confidence for tomorrow.
          </p>

          <div className="hero-cta-group">
            <Link to="/book" className="btn btn-primary hero-btn-main" id="hero-book-trial-btn">
              Book a Free Trial →
            </Link>
          </div>

          <div className="hero-trust-row">
            <div className="trust-item"><span className="trust-icon-sm">〰️</span><span>Live 1:1 or small group classes</span></div>
            <div className="trust-item"><span className="trust-icon-sm">⬡</span><span>Expert mentors from top universities</span></div>
            <div className="trust-item"><span className="trust-icon-sm">🛡️</span><span>Project-based learning with real skills</span></div>
          </div>
        </div>

        {/* Center Column: Hero Image with step badges */}
        <div className="hero-center-col">
          <div className="illustration-wrapper">
            <div className="hero-step-card step-card-top">
              <span className="step-badge-num">01</span>
              <p>Learn to code with real-world projects and fun learning paths.</p>
            </div>

            <div className="hero-img-frame">
              <img src="/images/hero-kid.jpg" alt="Cheerful child learning coding on laptop" className="hero-kid-img" />
            </div>

            <div className="hero-step-card step-card-bottom">
              <span className="step-badge-num">02</span>
              <p>Build creativity, problem-solving skills and confidence for the real world.</p>
            </div>

            <div className="floating-doodle-card">
              <span className="doodle-bulb">💡</span>
              <div className="doodle-text">
                <span>Learn</span>
                <span>Create</span>
                <span>Grow</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Highlights Card */}
        <div className="hero-right-col">
          <div className="hero-highlights-list">
            <div className="highlight-item">
              <div className="highlight-icon-wrap icon-bg-pink">🎓</div>
              <div className="highlight-text">
                <p className="highlight-title">Expert Mentors</p>
                <p className="highlight-sub">From INDIA</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon-wrap icon-bg-green">💻</div>
              <div className="highlight-text">
                <p className="highlight-title">Interactive Learning</p>
                <p className="highlight-sub">Real-world projects</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon-wrap icon-bg-purple">🎯</div>
              <div className="highlight-text">
                <p className="highlight-title">For Ages 5 – 17</p>
                <p className="highlight-sub">Beginner to Advanced</p>
              </div>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon-wrap icon-bg-yellow">🛡️</div>
              <div className="highlight-text">
                <p className="highlight-title">100% Free Trial class</p>
                <p className="highlight-sub">No payment required</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. Feature Highlight Section ────────────────────────────────── */}
      <section className="feature-highlight-section" id="feature-highlight">
        <div className="fh-left">
          <h2 className="fh-headline">
            Turning curiosity<br />into real skills.
          </h2>
          <p className="fh-subtext">
            CodeYoung helps kids learn to code through hands-on projects, interactive classes and personalized learning paths.
          </p>
          <a href="#how-it-works" className="btn btn-outline fh-cta-btn" id="feature-how-it-works-btn">
            How it works →
          </a>
        </div>

        <div className="fh-center">
          <div className="course-orbit-wrap">
            <div className="course-orbit-card orbit-tl"><span>🎮</span><p>Game Development</p></div>
            <div className="course-orbit-card orbit-bl"><span>🌐</span><p>Web Development</p></div>
            <div className="course-center-hub"><span className="hub-code">&lt;/&gt;</span></div>
            <div className="course-orbit-card orbit-tr"><span>🤖</span><p>AI &amp; Machine Learning</p></div>
            <div className="course-orbit-card orbit-br"><span>📱</span><p>App Development</p></div>
          </div>
        </div>

        <div className="fh-right">
          <div className="fh-feature-list">
            <div className="fh-feature-item">
              <div className="fh-feat-icon icon-blue">📹</div>
              <div><h4>Live Interactive Classes</h4><p>Learn with expert mentors in real-time</p></div>
            </div>
            <div className="fh-feature-item">
              <div className="fh-feat-icon icon-red">📊</div>
              <div><h4>Personalized Learning Path</h4><p>Courses tailored to your child's pace</p></div>
            </div>
            <div className="fh-feature-item">
              <div className="fh-feat-icon icon-green">🗂️</div>
              <div><h4>Project-Based Learning</h4><p>Build real projects and display their work</p></div>
            </div>
            <div className="fh-feature-item">
              <div className="fh-feat-icon icon-purple">🛡️</div>
              <div><h4>Safe &amp; Supportive Environment</h4><p>A fun and secure space for kids to learn and grow</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Metrics / Stats Ribbon ───────────────────────────────────── */}
      <section className="stats-ribbon-card">
        <div className="stat-block">
          <div className="stat-icon-wrap blue-soft"><span>📊</span></div>
          <div className="stat-content">
            <h3 className="stat-number"><AnimatedCounter target={50000} suffix="+" /></h3>
            <p className="stat-label">Happy Students</p>
          </div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-icon-wrap purple-soft"><span>👥</span></div>
          <div className="stat-content">
            <h3 className="stat-number">4.9<span className="stat-sub">/5</span></h3>
            <p className="stat-label">Parent Satisfaction</p>
          </div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-icon-wrap blue-soft"><span>🌐</span></div>
          <div className="stat-content">
            <h3 className="stat-number"><AnimatedCounter target={30} suffix="+" /></h3>
            <p className="stat-label">Countries</p>
          </div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-icon-wrap blue-soft"><span>🏆</span></div>
          <div className="stat-content">
            <h3 className="stat-number"><AnimatedCounter target={100} suffix="+" /></h3>
            <p className="stat-label">Real-World Projects</p>
          </div>
        </div>
        <Link to="/book" className="btn btn-primary stats-cta-btn" id="stats-ribbon-cta-btn">
          Start Your Child's Journey →
        </Link>
      </section>

      {/* ── 4. Mentors & Testimonial Section ────────────────────────────── */}
      <section className="mentors-testimonial-grid" id="mentors">
        <div className="expert-mentors-card">
          <div className="card-top-bar">
            <h2>Our Expert Mentors {showAllMentors && `(${ALL_MENTORS.length})`}</h2>
            <button type="button" onClick={() => setShowAllMentors(!showAllMentors)} className="view-all-btn" id="toggle-mentors-btn" aria-expanded={showAllMentors}>
              {showAllMentors ? 'Show Less ▴' : 'View All Mentors →'}
            </button>
          </div>
          <div className={`mentors-row-list ${showAllMentors ? 'expanded' : ''}`}>
            {(showAllMentors ? ALL_MENTORS : ALL_MENTORS.slice(0, 5)).map((m) => (
              <div key={m.id} className="mentor-profile-item">
                <div className="mentor-avatar-container">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="mentor-photo" />
                  ) : (
                    <div className="mentor-initials-avatar" style={{ backgroundColor: m.color }}>{m.initials}</div>
                  )}
                </div>
                <h4 className="mentor-name">{m.name}</h4>
                <p className="mentor-specialty">{m.specialty}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonial-card">
          <div className="quote-icon">"</div>
          <p className="quote-body">{currentTestimonial.quote}</p>
          <div className="testimonial-footer">
            <div className="author-info-group">
              <img src={currentTestimonial.avatar} alt={currentTestimonial.author} className="author-avatar" />
              <div>
                <p className="author-location">- {currentTestimonial.location}</p>
                <div className="star-rating">{'★'.repeat(currentTestimonial.rating)}</div>
              </div>
            </div>
            <div className="testimonial-controls">
              <button type="button" className="carousel-btn" onClick={prevTestimonial} id="testimonial-prev-btn" aria-label="Previous Testimonial">‹</button>
              <div className="dots-indicator">
                {TESTIMONIALS.map((_, i) => (
                  <span key={i} className={`dot ${i === testimonialIdx ? 'active' : ''}`} onClick={() => setTestimonialIdx(i)} />
                ))}
              </div>
              <button type="button" className="carousel-btn" onClick={nextTestimonial} id="testimonial-next-btn" aria-label="Next Testimonial">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works Section ─────────────────────────────────────── */}
      <section className="info-section" id="how-it-works">
        <div className="section-title-wrap">
          <span className="sub-badge-pill">3 Simple Steps</span>
          <h2>How It Works</h2>
          <p>Book a personalized 1:1 live trial class in less than 2 minutes.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Pick a Slot in Your Timezone</h3>
            <p>Choose a date and local time convenient for your child. Luxon automatically converts and aligns schedules.</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Smart Mentor Allocation</h3>
            <p>Our system pairs your child with the best certified mentor who has guaranteed daily availability.</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Join 1:1 Live Coding Class</h3>
            <p>Get an instant meeting link and QR code. Jump straight into building real interactive games and apps!</p>
          </div>
        </div>
      </section>

      {/* ── 6. Why Codeyoung Section ────────────────────────────────────── */}
      <section className="info-section" id="why-codeyoung">
        <div className="section-title-wrap">
          <span className="sub-badge-pill">The Codeyoung Advantage</span>
          <h2>Why Choose Codeyoung?</h2>
          <p>Empowering the next generation of innovators with customized coding education.</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🌟</div>
            <h3>1:1 Focused Attention</h3>
            <p>Never a crowded group. Every session is exclusively one-on-one tailored to your child's pace.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🚀</div>
            <h3>Project-Driven Learning</h3>
            <p>Kids build playable 3D games, animated stories, and AI models from lesson one.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🏆</div>
            <h3>Zero Burnout Mentors</h3>
            <p>Mentors teach max 2 classes/day to guarantee 100% peak energy and enthusiasm.</p>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ Section ──────────────────────────────────────────────── */}
      <section className="info-section faq-section" id="faq">
        <div className="section-title-wrap">
          <span className="sub-badge-pill">Got Questions?</span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                <h4>{faq.q}</h4>
                <span className="faq-chevron">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="faq-answer">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};