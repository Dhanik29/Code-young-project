import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { CalendarPicker } from '../components/CalendarPicker.jsx';
import { Alert } from '../components/Alert.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { getTomorrowISO, getMaxBookingDateISO } from '../utils/formatters.js';
import { calculateDualTimes } from '../utils/timezoneHelper.js';

const AVAILABLE_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

const COURSES_LIST = [
  { id: 'math-mystery', name: 'Math Mystery', icon: '🔍', desc: 'Fun interactive logic & puzzle-based math' },
  { id: 'coding-ai', name: 'Coding & AI', icon: '💻', desc: 'Game building, Python, AI & algorithmic thinking' },
  { id: 'english', name: 'English', icon: '📚', desc: 'Creative writing, reading comprehension & speech' },
  { id: 'science', name: 'Science', icon: '🔬', desc: 'Experiments, astronomy, physics & life science' },
  { id: 'vedic-math', name: 'Vedic / Speed Math', icon: '⚡', desc: 'Lightning mental calculations & smart shortcuts' },
];

const GRADES_LIST = [
  'Grade 1 (Age 5-6)', 'Grade 2 (Age 6-7)', 'Grade 3 (Age 7-8)',
  'Grade 4 (Age 8-9)', 'Grade 5 (Age 9-10)', 'Grade 6 (Age 10-11)',
  'Grade 7 (Age 11-12)', 'Grade 8 (Age 12-13)', 'Grade 9 (Age 13-14)',
  'Grade 10 (Age 14-15)', 'Grade 11 (Age 15-16)', 'Grade 12 (Age 16-17)',
];

// ── OTP Modal ─────────────────────────────────────────────────────────────────
const OTPModal = ({ email, onVerified, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
    // Countdown timer
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (i, val) => {
    // Only accept digits
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError('');
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      await api.verifyOTP(email, code);
      onVerified();
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await api.sendOTP(email, '');
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="otp-modal-card">
        <button className="otp-close-btn" onClick={onClose} aria-label="Close OTP modal">×</button>

        <div className="otp-modal-header">
          <div className="otp-shield-icon">🔐</div>
          <h2 className="otp-modal-title">Verify Your Email</h2>
          <p className="otp-modal-subtitle">
            We sent a 6-digit OTP to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <div className="otp-inputs-row" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`otp-digit-input ${digit ? 'filled' : ''}`}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        {error && <p className="otp-error-msg">⚠️ {error}</p>}

        <button
          className="btn btn-primary otp-verify-btn"
          onClick={handleVerify}
          disabled={verifying || otp.join('').length < 6}
        >
          {verifying ? <Spinner size="small" text="Verifying..." /> : '✓ Verify & Continue'}
        </button>

        <div className="otp-resend-row">
          <span className="otp-resend-label">Didn't receive it?</span>
          {resendCooldown > 0 ? (
            <span className="otp-cooldown">Resend in {resendCooldown}s</span>
          ) : (
            <button
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <p className="otp-expire-note">This OTP expires in 10 minutes</p>
      </div>
    </div>
  );
};


// ── Main Booking Page ─────────────────────────────────────────────────────────
export const BookingPage = () => {
  const navigate = useNavigate();

  // Stages: 1 = parent details, 2 = grade+slot, 3 = child info
  const [currentStage, setCurrentStage] = useState(1);

  // OTP modal state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState(null); // null | { emailExists, phoneExists, registeredName }

  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    country: 'United States',
    timezone: 'America/New_York',
    course: 'Coding & AI',
    agreedToTerms: false,
    childGrade: 'Grade 5 (Age 9-10)',
    date: getTomorrowISO(),
    time: '12:00',
    childName: '',
    city: '',
    schoolName: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState([]);
  const [tcError, setTcError] = useState('');

  // Live dual timezone
  const dualTimes = calculateDualTimes(formData.date, formData.time, formData.timezone);

  const handleCountrySelect = (countryName, tz) => {
    setFormData((prev) => ({ ...prev, country: countryName, timezone: tz }));
  };

  const phonePlaceholder = formData.country === 'United Kingdom' ? '+44 7911 123456' : '+1 (555) 234-5678';
  const phonePrefix = formData.country === 'United Kingdom' ? '+44' : '+1';

  // ── Check Duplicates on email/phone blur ──────────────────────────────────
  const handleEmailBlur = async () => {
    const email = formData.parentEmail.trim();
    if (!email || !email.includes('@')) return;
    try {
      const res = await api.checkDuplicate(email, '');
      if (res.data?.emailExists) {
        setDuplicateWarning((prev) => ({
          ...(prev || {}),
          emailExists: true,
          registeredName: res.data.registeredName,
        }));
      } else {
        setDuplicateWarning((prev) => prev ? { ...prev, emailExists: false } : null);
      }
    } catch (_) { /* silently ignore */ }
  };

  const handlePhoneBlur = async () => {
    const phone = formData.parentPhone.trim();
    if (!phone || phone.length < 7) return;
    try {
      const res = await api.checkDuplicate('', phone);
      if (res.data?.phoneExists) {
        setDuplicateWarning((prev) => ({ ...(prev || {}), phoneExists: true }));
      } else {
        setDuplicateWarning((prev) => prev ? { ...prev, phoneExists: false } : null);
      }
    } catch (_) { /* silently ignore */ }
  };

  // ── Stage 1 → Send OTP ────────────────────────────────────────────────────
  const handleProceedToStage2 = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails([]);
    setTcError('');

    if (!formData.parentName.trim()) { setErrorMessage('Please enter your full parent name.'); return; }
    if (!formData.parentPhone.trim()) { setErrorMessage(`Please enter a valid phone number (${formData.country === 'United Kingdom' ? 'UK (+44)' : 'US (+1)'}).`); return; }
    if (!formData.parentEmail.trim() || !formData.parentEmail.includes('@')) { setErrorMessage('Please enter a valid email address.'); return; }
    if (!formData.course) { setErrorMessage('Please select a course subject for the trial class.'); return; }
    if (!formData.agreedToTerms) {
      setTcError('Please accept the Terms & Conditions and Privacy Policy to proceed.');
      return;
    }

    // Verify uniqueness of email and phone first
    try {
      const dupCheck = await api.checkDuplicate(formData.parentEmail.trim(), formData.parentPhone.trim());
      if (dupCheck.data?.emailExists) {
        const warn = `User already exists with this email address (${formData.parentEmail.trim()}). Please use another email.`;
        setErrorMessage(warn);
        setDuplicateWarning({ emailExists: true, phoneExists: false, registeredName: dupCheck.data.registeredName });
        return;
      }
      if (dupCheck.data?.phoneExists) {
        const warn = `User already exists with this mobile number (${formData.parentPhone.trim()}). Please use another number.`;
        setErrorMessage(warn);
        setDuplicateWarning({ emailExists: false, phoneExists: true, registeredName: dupCheck.data.registeredName });
        return;
      }
    } catch (err) {
      // Continue to OTP send if check network error, backend will re-validate
    }

    // If already OTP verified for this session, skip modal
    if (otpVerified) {
      setCurrentStage(2);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    // Send OTP
    setSendingOTP(true);
    try {
      await api.sendOTP(formData.parentEmail.trim(), formData.parentName.trim(), formData.parentPhone.trim());
      setShowOTPModal(true);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTPModal(false);
    setOtpVerified(true);
    setCurrentStage(2);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // ── Stage 2 → 3 ──────────────────────────────────────────────────────────
  const handleProceedToStage3 = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!formData.childGrade) { setErrorMessage("Please select your child's grade."); return; }
    if (!formData.date) { setErrorMessage('Please select a date for the trial class.'); return; }
    if (!formData.time) { setErrorMessage('Please select a preferred time slot.'); return; }

    const maxAllowed = getMaxBookingDateISO(90);
    if (formData.date > maxAllowed) {
      setErrorMessage('Booking date only permits scheduling up to 90 days in advance.');
      return;
    }

    setCurrentStage(3);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  // ── Stage 3 Final Submit ──────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorDetails([]);

    if (!formData.childName.trim()) { setErrorMessage("Please enter your child's full name."); return; }
    if (!formData.city.trim()) { setErrorMessage('Please enter your city.'); return; }
    if (!formData.schoolName.trim()) { setErrorMessage("Please enter your child's school name."); return; }

    setSubmitting(true);
    try {
      const response = await api.createBooking({
        name: formData.parentName.trim(),
        email: formData.parentEmail.trim(),
        course: formData.course,
        country: formData.country,
        timezone: formData.timezone,
        date: formData.date,
        time: formData.time,
        phone: formData.parentPhone.trim(),
        childName: formData.childName.trim(),
        childGrade: formData.childGrade,
        city: formData.city.trim(),
        schoolName: formData.schoolName.trim(),
      });
      navigate('/success', { state: { booking: response.data }, replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete trial booking. Please try again.');
      if (err.details) setErrorDetails(err.details);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page-container">

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          email={formData.parentEmail.trim()}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}

      {/* ── Top Header Banner ─── */}
      <div className="booking-header-banner">
        <div className="header-text-col">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1 className="booking-main-title">Book a Free 1:1 Trial Class</h1>
          <p className="booking-main-subtitle">
            Give your child the first step towards a brighter future with expert guidance.
          </p>
        </div>
        <div className="header-visual-col">
          <div className="header-kid-card">
            <span className="doodle-float-tag">Start Learning Today! ⭐</span>
            <img src="/images/hero-kid.jpg" alt="Kid learning" className="header-kid-avatar" />
          </div>
          <div className="header-perks-stack">
            <div className="header-perk-item"><span className="perk-icon green-icon">🟢</span><div><strong>100% Free Trial Class</strong><p>No payment required</p></div></div>
            <div className="header-perk-item"><span className="perk-icon red-icon">🔴</span><div><strong>Live &amp; Interactive</strong><p>with expert mentors</p></div></div>
            <div className="header-perk-item"><span className="perk-icon purple-icon">🟣</span><div><strong>For Ages 5 – 17</strong><p>Age-appropriate curriculum</p></div></div>
          </div>
        </div>
      </div>

      {/* ── Stepper ─── */}
      <div className="booking-stepper-card">
        <div className={`step-node ${currentStage === 1 ? 'active' : ''} ${currentStage > 1 ? 'completed' : ''}`}
          onClick={() => currentStage > 1 && setCurrentStage(1)}
          style={{ cursor: currentStage > 1 ? 'pointer' : 'default' }}>
          <div className="node-circle"><span className="node-icon">{currentStage > 1 ? '✔' : '👤'}</span><span className="node-num">1</span></div>
          <span className="node-label">Parent &amp; Subject</span>
        </div>
        <div className={`step-connector ${currentStage >= 2 ? 'active' : ''}`} />
        <div className={`step-node ${currentStage === 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}
          onClick={() => currentStage > 2 && setCurrentStage(2)}
          style={{ cursor: currentStage > 2 ? 'pointer' : 'default' }}>
          <div className="node-circle"><span className="node-icon">{currentStage > 2 ? '✔' : '📅'}</span><span className="node-num">2</span></div>
          <span className="node-label">Grade &amp; Slot</span>
        </div>
        <div className={`step-connector ${currentStage >= 3 ? 'active' : ''}`} />
        <div className={`step-node ${currentStage === 3 ? 'active' : ''}`}>
          <div className="node-circle"><span className="node-icon">🎓</span><span className="node-num">3</span></div>
          <span className="node-label">Child Details</span>
        </div>
        <div className="step-connector" />
        <div className="step-node pending">
          <div className="node-circle"><span className="node-icon">🔗</span><span className="node-num">4</span></div>
          <span className="node-label">Get Meeting Link &amp; QR</span>
        </div>
      </div>


      {/* ── Full-Width Form Area ─── */}
      <div className="booking-fullwidth-layout">

        {/* ══ STAGE 1: Parent Details & Course ══ */}
        {currentStage === 1 && (
          <form onSubmit={handleProceedToStage2} className="stage-form-wrapper" noValidate>
            <div className="booking-step-box">
              <div className="step-box-header">
                <span className="step-badge-num">1</span>
                <h3>Parent Details &amp; Subject Selection</h3>
              </div>
              <p className="step-box-sub">Select your location (US / UK), enter contact details, and choose your preferred subject.</p>

              {/* Country Cards */}
              <div className="location-cards-grid" style={{ marginBottom: '1.5rem' }}>
                <div className={`location-card ${formData.country === 'United States' ? 'selected' : ''}`}
                  onClick={() => handleCountrySelect('United States', 'America/New_York')}>
                  <span className="location-flag">🇺🇸</span>
                  <div className="location-info"><h4>United States</h4><p>EST / CST / MST / PST (+1)</p></div>
                  {formData.country === 'United States' && <span className="location-check-circle">✔</span>}
                </div>
                <div className={`location-card ${formData.country === 'United Kingdom' ? 'selected' : ''}`}
                  onClick={() => handleCountrySelect('United Kingdom', 'Europe/London')}>
                  <span className="location-flag">🇬🇧</span>
                  <div className="location-info"><h4>United Kingdom</h4><p>GMT / BST (+44)</p></div>
                  {formData.country === 'United Kingdom' && <span className="location-check-circle">✔</span>}
                </div>
              </div>

              {/* Duplicate Warning Banner */}
              {duplicateWarning && (duplicateWarning.emailExists || duplicateWarning.phoneExists) && (
                <div className="duplicate-warning-banner">
                  <span className="dup-warn-icon">⚠️</span>
                  <div>
                    <strong>Already Registered!</strong>
                    {duplicateWarning.emailExists && (
                      <p>This email address is already registered{duplicateWarning.registeredName ? ` under the name "${duplicateWarning.registeredName}"` : ''}. You can still proceed to book another trial class.</p>
                    )}
                    {duplicateWarning.phoneExists && (
                      <p>This phone number is already associated with an existing booking.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Name & Phone Row */}
              <div className="step-inputs-row">
                <div className="step-field">
                  <label htmlFor="parentName" className="step-field-label">Parent Full Name *</label>
                  <div className="input-with-icon">
                    <span className="field-icon">👤</span>
                    <input id="parentName" name="parentName" type="text" required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="step-input" />
                  </div>
                </div>
                <div className="step-field">
                  <label htmlFor="parentPhone" className="step-field-label">
                    Parent Phone Number ({phonePrefix}) *
                  </label>
                  <div className="input-with-icon">
                    <span className="field-icon">📞</span>
                    <input id="parentPhone" name="parentPhone" type="tel" required
                      placeholder={phonePlaceholder}
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      onBlur={handlePhoneBlur}
                      className="step-input" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="step-field" style={{ marginTop: '1rem' }}>
                <label htmlFor="parentEmail" className="step-field-label">
                  Parent Email Address (OTP will be sent here) *
                </label>
                <div className="input-with-icon">
                  <span className="field-icon">✉️</span>
                  <input id="parentEmail" name="parentEmail" type="email" required
                    placeholder="e.g. sarah.jenkins@example.com"
                    value={formData.parentEmail}
                    onChange={(e) => { setFormData({ ...formData, parentEmail: e.target.value }); setDuplicateWarning(null); }}
                    onBlur={handleEmailBlur}
                    className="step-input" />
                </div>
                {otpVerified && (
                  <div className="email-verified-badge">
                    <span>✅ Email verified</span>
                  </div>
                )}
              </div>

              {/* Course Cards */}
              <div className="course-subject-section" style={{ marginTop: '1.5rem' }}>
                <label className="step-field-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                  Choose Subject for Trial Class *
                </label>
                <div className="course-cards-grid">
                  {COURSES_LIST.map((c) => {
                    const isSelected = formData.course === c.name;
                    return (
                      <div key={c.id}
                        className={`course-selection-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, course: c.name })}>
                        <span className="course-card-icon">{c.icon}</span>
                        <div className="course-card-body">
                          <h4 className="course-card-title">{c.name}</h4>
                          <p className="course-card-desc">{c.desc}</p>
                        </div>
                        {isSelected && <span className="course-check-badge">✔</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* T&C */}
              <div className={`tc-checkbox-row ${tcError ? 'has-error' : ''}`}>
                <label className="tc-checkbox-label">
                  <input type="checkbox" checked={formData.agreedToTerms}
                    onChange={(e) => {
                      setFormData({ ...formData, agreedToTerms: e.target.checked });
                      if (e.target.checked) setTcError('');
                    }}
                    className="tc-checkbox" required />
                  <span>
                    I agree to the <strong>Terms &amp; Conditions</strong> and{' '}
                    <strong>Privacy Policy</strong> for this free 1:1 trial session.
                  </span>
                </label>
                {tcError && (
                  <div className="tc-error-msg">
                    <span>⚠️</span>
                    <span>{tcError}</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="stage-actions">
                <button type="submit" className="btn btn-primary stage-cta-btn" disabled={sendingOTP}>
                  {sendingOTP
                    ? <Spinner size="small" text="Sending OTP..." />
                    : otpVerified
                      ? 'Next: Choose Slot & Grade →'
                      : '📧 Verify Email & Continue →'
                  }
                </button>
                {errorMessage && <Alert type="error" message={errorMessage} details={errorDetails} />}
              </div>

              <p className="otp-hint-text">
                {otpVerified
                  ? '✅ Your email is verified. Click above to proceed.'
                  : '🔐 A one-time password will be sent to your email to verify your identity.'
                }
              </p>
            </div>
          </form>
        )}

        {/* ══ STAGE 2: Grade & Slot ══ */}
        {currentStage === 2 && (
          <form onSubmit={handleProceedToStage3} className="stage-form-wrapper" noValidate>
            <div className="booking-step-box">
              <div className="step-box-header">
                <span className="step-badge-num">2</span>
                <h3>Child Grade &amp; Slot Selection</h3>
              </div>
              <p className="step-box-sub">
                Selected Subject: <strong>{formData.course}</strong>
              </p>

              {/* Grade */}
              <div className="step-field" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="childGrade" className="step-field-label">Child's Grade (Grades 1 to 12) *</label>
                <select id="childGrade" name="childGrade" value={formData.childGrade}
                  onChange={(e) => setFormData({ ...formData, childGrade: e.target.value })}
                  className="step-select" required>
                  {GRADES_LIST.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Calendar */}
              <div className="cal-section-wrap" style={{ marginBottom: '1.75rem' }}>
                <label className="step-field-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                  Choose Trial Date *
                </label>
                <CalendarPicker
                  selectedDate={formData.date}
                  onSelectDate={(date) => setFormData({ ...formData, date })}
                  minDate={getTomorrowISO()}
                  maxDate={getMaxBookingDateISO(90)}
                />
              </div>

              {/* Time Slots */}
              <div className="time-section-wrap">
                <label className="step-field-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                  Select Time (Your Local Time –{' '}
                  {formData.country === 'United Kingdom' ? 'UK BST' : 'US EST'}) *
                </label>
                <div className="time-slots-matrix">
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isSelected = formData.time === slot.value;
                    return (
                      <button type="button" key={slot.value}
                        onClick={() => setFormData({ ...formData, time: slot.value })}
                        className={`time-slot-btn ${isSelected ? 'selected' : ''}`}>
                        {isSelected && <span className="slot-check-icon">✔ </span>}
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                {/* Dual Timezone Bar */}
                <div className="dual-timezone-bar">
                  <div className="tz-side parent-side">
                    <span className="tz-flag">{formData.country === 'United Kingdom' ? '🇬🇧' : '🇺🇸'}</span>
                    <div className="tz-details">
                      <span className="tz-caption">
                        Selected Time ({formData.country === 'United Kingdom' ? 'UK – BST' : 'US – EST'})
                      </span>
                      <strong className="tz-big-time">{dualTimes.parentTime}</strong>
                      <span className="tz-date-label">{dualTimes.parentDateFormatted}</span>
                    </div>
                  </div>

                  <div className="tz-swap-icon">⇄</div>

                  <div className="tz-side mentor-side">
                    <span className="tz-flag">🇮🇳</span>
                    <div className="tz-details">
                      <span className="tz-caption">Mentor Time (IST)</span>
                      <strong className="tz-big-time">{dualTimes.mentorTime}</strong>
                      <span className="tz-date-label">{dualTimes.mentorDateLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="dst-notice">
                  <span>💡 Time automatically adjusted for Daylight Saving Time (DST). IST date updates if class crosses midnight.</span>
                  <span className="dst-check">✔</span>
                </div>
              </div>

              <div className="stage-actions-split">
                <button type="button" onClick={() => setCurrentStage(1)} className="btn btn-outline">
                  ← Back to Parent Details
                </button>
                <button type="submit" className="btn btn-primary stage-cta-btn">
                  Next: Child Details →
                </button>
              </div>
              {errorMessage && <Alert type="error" message={errorMessage} details={errorDetails} />}
            </div>
          </form>
        )}

        {/* ══ STAGE 3: Child Info & Confirm ══ */}
        {currentStage === 3 && (
          <form onSubmit={handleFinalSubmit} className="stage-form-wrapper" noValidate>
            <div className="booking-step-box">
              <div className="step-box-header">
                <span className="step-badge-num">3</span>
                <h3>Child &amp; School Information</h3>
              </div>
              <p className="step-box-sub">
                Provide your child's name, city, and school so our mentor can personalize the lesson.
              </p>

              {/* Child Name */}
              <div className="step-field" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="childName" className="step-field-label">Child's Full Name *</label>
                <div className="input-with-icon">
                  <span className="field-icon">👤</span>
                  <input id="childName" name="childName" type="text" required
                    placeholder="e.g. Leo Jenkins"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    className="step-input" />
                </div>
              </div>

              {/* City & School */}
              <div className="step-inputs-row" style={{ marginBottom: '1.5rem' }}>
                <div className="step-field">
                  <label htmlFor="city" className="step-field-label">City *</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🏙️</span>
                    <input id="city" name="city" type="text" required
                      placeholder="e.g. San Francisco / London"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="step-input" />
                  </div>
                </div>
                <div className="step-field">
                  <label htmlFor="schoolName" className="step-field-label">School Name *</label>
                  <div className="input-with-icon">
                    <span className="field-icon">🏫</span>
                    <input id="schoolName" name="schoolName" type="text" required
                      placeholder="e.g. Lincoln High School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="step-input" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="stage3-summary-card">
                <h4>📋 Trial Class Booking Summary</h4>
                <div className="stage3-summary-grid">
                  <div><span className="s-label">Parent:</span> {formData.parentName} ({formData.parentPhone})</div>
                  <div><span className="s-label">Email:</span> {formData.parentEmail}</div>
                  <div><span className="s-label">Subject:</span> <strong>{formData.course}</strong></div>
                  <div><span className="s-label">Grade:</span> {formData.childGrade}</div>
                  <div><span className="s-label">Date:</span> {dualTimes.fullDateLong}</div>
                  <div>
                    <span className="s-label">Timing:</span>{' '}
                    {dualTimes.parentTime} ({formData.country === 'United Kingdom' ? 'UK BST' : 'US EST'})
                    {' '}/ {dualTimes.mentorTime} IST
                    {dualTimes.mentorDateLabel !== dualTimes.parentDateFormatted && (
                      <span className="ist-next-day-badge"> (IST: {dualTimes.mentorDateLabel})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Policy note */}
              <div className="mentor-policy-note" style={{ marginBottom: '1.5rem' }}>
                <span className="policy-icon">ℹ️</span>
                <p>
                  A certified mentor will be automatically assigned. Upon confirmation, a meeting link and QR code will be generated and sent to <strong>{formData.parentEmail}</strong>.
                </p>
              </div>

              <div className="stage-actions-split">
                <button type="button" onClick={() => setCurrentStage(2)} className="btn btn-outline" disabled={submitting}>
                  ← Back to Slot Selection
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary stage-cta-btn">
                  {submitting
                    ? <Spinner size="small" text="Assigning Mentor & Generating Link..." />
                    : '📅 Confirm & Get Meeting Link →'
                  }
                </button>
              </div>
              {errorMessage && <Alert type="error" message={errorMessage} details={errorDetails} />}
            </div>
          </form>
        )}
      </div>

      {/* ── Bottom Feature Strip ─── */}
      <section className="booking-bottom-features">
        <div className="bottom-feat-card"><div className="b-feat-icon purple-b">💡</div><div><h4>Interactive Learning</h4><p>Live hands-on 1:1 sessions</p></div></div>
        <div className="bottom-feat-card"><div className="b-feat-icon blue-b">📊</div><div><h4>Expert Mentors</h4><p>Learn from industry experts</p></div></div>
        <div className="bottom-feat-card"><div className="b-feat-icon purple-b">⭐</div><div><h4>Personalized Guidance</h4><p>Based on your child's grade and interests</p></div></div>
        <div className="bottom-feat-card"><div className="b-feat-icon purple-b">🎁</div><div><h4>100% Free</h4><p>No payment required</p></div></div>
      </section>
    </div>
  );
};
