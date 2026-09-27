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

const FAQS = [
  { q: 'Is the trial class completely free?', a: 'Yes, 100% free! No credit card is required to book a 1:1 trial session. A dummy meeting link is generated instantly.' },
  { q: 'How are mentors assigned to students?', a: 'Our smart load-balancing engine matches your child with a certified expert mentor who has available capacity for your chosen date and timezone.' },
  { q: 'What age group are Codeyoung classes designed for?', a: 'Our curriculum is customized for kids aged 5 to 17, from complete beginners in block coding to advanced Python, AI, and Web Development.' },
  { q: 'What equipment do we need for the trial class?', a: 'All you need is a laptop or desktop computer with a working webcam, microphone, and a stable internet connection.' },
];

const TRUST_LOGOS = [
  { name: 'Google', text: 'Google' },
  { name: 'Microsoft', text: 'Microsoft' },
  { name: 'Stanford', text: 'Stanford University' },
  { name: 'MIT', text: 'MIT' },
  { name: 'Harvard', text: 'Harvard University' },
  { name: 'Oxford', text: 'The University of Oxford' },
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
    <div className="home-container">

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
            Interactive, personalized and project-based coding classes to help kids aged 6–16 build real skills, creativity and confidence for tomorrow.
          </p>

          <div className="hero-cta-group">
            <Link to="/book" className="btn btn-primary hero-btn-main" id="hero-book-trial-btn">
              Book a Free Trial →
            </Link>
            <button type="button" className="hero-btn-secondary" id="hero-watch-video-btn">
              <span className="play-circle">▶</span> Watch Video
            </button>
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

        {/* Right Column: App Mockup Card */}
        <div className="hero-right-col">
          <div className="app-mockup-card">
            <div className="app-mockup-topbar">
              <span className="app-mockup-title-text">My Learning</span>
              <div className="app-mockup-icons-row">
                <span>🔔</span>
                <div className="app-user-dot" />
              </div>
            </div>

            <div className="app-course-item">
              <div className="app-course-icon">🐍</div>
              <div className="app-course-info">
                <p className="app-course-name">Python Basics</p>
                <div className="app-progress-bar">
                  <div className="app-progress-fill" style={{ width: '75%' }} />
                </div>
                <p className="app-progress-label">Progress 75%</p>
              </div>
              <span className="app-dots">···</span>
            </div>

            <div className="app-today-class">
              <p className="app-section-label">Today's Class</p>
              <div className="app-class-row">
                <span className="live-red-dot">🔴</span>
                <div>
                  <p className="app-class-name">Live with Mentor</p>
                  <p className="app-class-time">10:00 AM – 11:00 AM</p>
                </div>
                <Link to="/book" className="app-join-btn" id="app-mockup-join-btn">Join</Link>
              </div>
            </div>

            <div className="app-projects-section">
              <div className="app-proj-header">
                <p className="app-section-label">My Projects</p>
                <span className="app-view-all">View all</span>
              </div>
              <div className="app-proj-cards">
                <div className="app-proj-card violet-proj">
                  <span>🎮</span>
                  <p>Build a Game with Python</p>
                </div>
                <div className="app-proj-card blue-proj">
                  <span>🌐</span>
                  <p>Create a Website</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. Trust Logos Strip ────────────────────────────────────────── */}
      <section className="trust-logos-section">
        <p className="trust-logos-caption">Trusted by families across the US, UK &amp; worldwide</p>
        <div className="trust-logos-strip">
          {TRUST_LOGOS.map(logo => (
            <div key={logo.name} className="trust-logo-chip">
              <span className="trust-logo-text">{logo.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Feature Highlight Section ────────────────────────────────── */}
      <section className="feature-highlight-section" id="feature-highlight">
        <div className="fh-left">
          <h2 className="fh-headline">
            Turning curiosity<br />into real skills.
          </h2>
          <p className="fh-subtext">
            CodeYoung helps kids learn to code through hands-on projects, interactive classes and personalized learning paths.
          </p>
          <Link to="/book" className="btn btn-outline fh-cta-btn" id="feature-how-it-works-btn">
            How it works →
          </Link>
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

      {/* ── 4. Metrics / Stats Ribbon ───────────────────────────────────── */}
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

      {/* ── 5. Mentors & Testimonial Section ────────────────────────────── */}
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

      {/* ── 6. How It Works Section ─────────────────────────────────────── */}
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

      {/* ── 7. Why Codeyoung Section ────────────────────────────────────── */}
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

      {/* ── 8. FAQ Section ──────────────────────────────────────────────── */}
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

