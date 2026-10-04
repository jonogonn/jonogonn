import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  PhoneCall,
  Mail,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  ChevronRight,
  Headphones,
  FileText
} from 'lucide-react';

export default function ContactPage() {
  const { language, settings, goToHome } = useNews();
  const isBn = language === 'bn';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'feedback' // 'news_tip' | 'feedback' | 'complaint' | 'advertisement'
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'যোগাযোগ — সম্পাদকীয় ডেস্ক ও বার্তা বিভাগ' : 'Contact Us — Newsroom & Editorial Desk',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News)-এর সম্পাদকীয় দপ্তর, বিজ্ঞাপন বিভাগ ও বার্তা কক্ষে যোগাযোগের ঠিকানা ও ফোন নম্বর।'
        : 'Get in touch with Jonogon News editorial desk, advertising team, and newsroom reporters.',
      url: `${window.location.origin}/contact`,
      type: 'website'
    });
  }, [isBn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'feedback'
      });
    }, 4500);
  };

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{isBn ? 'যোগাযোগ' : 'Contact Us'}</span>
        </nav>

        {/* Hero Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <PhoneCall size={16} />
            <span>{isBn ? 'যোগাযোগ ও তথ্য' : 'Get in Touch'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'আমাদের সাথে যোগাযোগ করুন' : 'Contact Jonogon News'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'যেকোনো সংবাদ তথ্য, মতামত, অভিযোগ বা বিজ্ঞাপন সংক্রান্ত প্রয়োজনে আমাদের টিম সবসময় প্রস্তুত।'
              : 'Reach out to our 24/7 newsroom, reporters, and advertising department.'}
          </p>
        </header>

        {/* Quick Contact Cards 3 Columns */}
        <div className="contact-cards-grid" style={{ marginBottom: 36 }}>
          <div className="contact-highlight-card">
            <div className="icon-circle">
              <MessageSquare size={22} color="var(--primary-red)" />
            </div>
            <h3>{isBn ? 'সম্পাদকীয় ও বার্তা বিভাগ' : 'Newsroom & Editorial'}</h3>
            <p>{isBn ? 'সংবাদের তথ্য, প্রেস রিলিজ ও রিপোর্ট পাঠাতে:' : 'For news tips and press releases:'}</p>
            <a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`} className="contact-link-val">
              {settings.email || 'brandbiplob1234@gmail.com'}
            </a>
          </div>

          <div className="contact-highlight-card">
            <div className="icon-circle">
              <Headphones size={22} color="var(--primary-red)" />
            </div>
            <h3>{isBn ? 'হটলাইন ও ফোন নম্বর' : 'Direct Helpline & Phone'}</h3>
            <p>{isBn ? 'সরাসরি কথা বলতে বা জরুরি যোগাযোগে:' : 'Direct editorial contact:'}</p>
            <a href={`tel:${settings.phone || '01936618534'}`} className="contact-link-val">
              {settings.phone || '01936618534'}
            </a>
          </div>

          <div className="contact-highlight-card">
            <div className="icon-circle">
              <MapPin size={22} color="var(--primary-red)" />
            </div>
            <h3>{isBn ? 'প্রধান কার্যালয়' : 'Headquarters'}</h3>
            <p className="contact-address-text">
              {settings.address || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230'}
            </p>
          </div>
        </div>

        {/* Main Content Layout with Form & Office Details */}
        <div className="page-content-layout">
          {/* Left: Interactive Message Form */}
          <div className="page-main-body">
            <div className="contact-form-box">
              <h2 className="section-subheading" style={{ marginBottom: 6 }}>
                <span className="bullet-accent"></span>
                {isBn ? 'আমাদের বার্তা পাঠান' : 'Send us a Message / News Tip'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                {isBn
                  ? 'নিচের ফরমটি পূরণ করে আপনার মূল্যবান মতামত, সংবাদের তথ্য বা প্রশ্ন আমাদের কাছে পাঠান।'
                  : 'Fill out this form to submit news tips, inquiries, or feedback.'}
              </p>

              {submitted ? (
                <div className="contact-success-banner">
                  <CheckCircle2 size={32} color="#16A34A" />
                  <div>
                    <h4>{isBn ? 'আপনার বার্তা সফলভাবে গ্রহণ করা হয়েছে!' : 'Message Sent Successfully!'}</h4>
                    <p>
                      {isBn
                        ? 'আমাদের সম্পাদকীয় টিম দ্রুত আপনার বার্তার পর্যালোচনা করে প্রয়োজনীয় পদক্ষেপ নেবে।'
                        : 'Our editorial desk has received your note and will review it promptly.'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="standalone-form">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>{isBn ? 'আপনার নাম *' : 'Your Name *'}</label>
                      <input
                        type="text"
                        required
                        placeholder={isBn ? 'সম্পূর্ণ নাম লিখুন...' : 'Enter your name...'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>{isBn ? 'ইমেইল ঠিকানা *' : 'Email Address *'}</label>
                      <input
                        type="email"
                        required
                        placeholder="example@mail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>{isBn ? 'ফোন / মোবাইল নম্বর' : 'Phone Number'}</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>{isBn ? 'বার্তার ধরন *' : 'Message Type *'}</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="form-select"
                      >
                        <option value="feedback">{isBn ? 'সাধারণ মতামত ও পরামর্শ' : 'General Feedback'}</option>
                        <option value="news_tip">{isBn ? 'জরুরি সংবাদের তথ্য / নিউজ টিপ' : 'News Tip / Event Report'}</option>
                        <option value="complaint">{isBn ? 'অভিযোগ বা সংশোধন প্রস্তাব' : 'Complaint / Correction Request'}</option>
                        <option value="advertisement">{isBn ? 'বিজ্ঞাপন ও বাণিজ্যিক তথ্য' : 'Advertising & Sponsorship'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{isBn ? 'বিষয় / শিরোনাম *' : 'Subject *'}</label>
                    <input
                      type="text"
                      required
                      placeholder={isBn ? 'বার্তার বিষয় লিখুন...' : 'Subject of message...'}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>{isBn ? 'বিস্তারিত বার্তা *' : 'Detailed Message *'}</label>
                    <textarea
                      rows={5}
                      required
                      placeholder={isBn ? 'আপনার বিস্তারিত বার্তা বা সংবাদের বিবরণ লিখুন...' : 'Write your detailed message here...'}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-textarea"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
                    <Send size={16} />
                    <span>{isBn ? 'বার্তা পাঠান' : 'Submit Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Bureau Offices & Work Hours */}
          <aside className="page-sidebar-col">
            <div className="page-info-card">
              <h3>{isBn ? 'কার্যকাল ও সংবাদ ডেস্ক' : 'Operating Hours'}</h3>
              <div className="info-list">
                <div className="info-row">
                  <Clock size={16} color="var(--primary-red)" />
                  <div>
                    <strong>{isBn ? 'অনলাইন নিউজ ডেস্ক:' : 'Online News Desk:'}</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>{isBn ? '২৪ ঘণ্টা, ৭ দিন সক্রিয়' : '24 Hours, 7 Days a week'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <FileText size={16} color="var(--primary-red)" />
                  <div>
                    <strong>{isBn ? 'বিজ্ঞাপন ও প্রশাসন বিভাগ:' : 'Commercial & Office:'}</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>{isBn ? 'সকাল ৯:০০ – রাত ৮:০০ (শনি – বৃহস্পতি)' : '9:00 AM – 8:00 PM (Sat – Thu)'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="page-info-card" style={{ marginTop: 20 }}>
              <h3>{isBn ? 'বিভাগীয় ব্যুরো অফিস' : 'Regional Bureau Desks'}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                <li style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                  <strong>{isBn ? 'চট্টগ্রাম ব্যুরো:' : 'Chattogram Bureau:'}</strong>
                  <div style={{ color: 'var(--text-muted)' }}>জিইসি মোড়, চট্টগ্রাম</div>
                </li>
                <li style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 6 }}>
                  <strong>{isBn ? 'সিলেট ব্যুরো:' : 'Sylhet Bureau:'}</strong>
                  <div style={{ color: 'var(--text-muted)' }}>জিন্দাবাজার, সিলেট</div>
                </li>
                <li>
                  <strong>{isBn ? 'রাজশাহী ব্যুরো:' : 'Rajshahi Bureau:'}</strong>
                  <div style={{ color: 'var(--text-muted)' }}>সাহেব বাজার, রাজশাহী</div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
