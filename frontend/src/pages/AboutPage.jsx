import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  Users,
  Award,
  ShieldCheck,
  Eye,
  HeartHandshake,
  ArrowLeft,
  ChevronRight,
  Globe,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export default function AboutPage() {
  const { language, settings, goToHome, navigateTo } = useNews();
  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'আমাদের সম্পর্কে — প্রতিষ্ঠান পরিচিতি ও লক্ষ্য' : 'About Us — Mission & Editorial Board',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News) — বস্তুনিষ্ঠ সাংবাদিকতা ও জনতার কণ্ঠস্বর। আমাদের ইতিহাস, উদ্দেশ্য ও সম্পাদকীয় নীতিমালা।'
        : 'About Jonogon News — truthful journalism standing with the people of Bangladesh and beyond.',
      url: `${window.location.origin}/about`,
      type: 'website'
    });
  }, [isBn]);

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{isBn ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
        </nav>

        {/* Hero Banner Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <Users size={16} />
            <span>{isBn ? 'প্রতিষ্ঠান পরিচিতি' : 'Company Overview'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'জনগণের পক্ষে, সত্যের সাথে অটল' : 'Standing for Truth, Empowering People'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'জনগণ.নিউজ (Jonogon.News) একটি স্বাধীন, নিরপেক্ষ ও জনকল্যাণমুখী ডিজিটাল সংবাদ মাধ্যম।'
              : 'Jonogon News is an independent, non-partisan, digital news organisation dedicated to authentic journalism.'}
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="page-content-layout">
          {/* Main Article Body */}
          <div className="page-main-body">
            {/* Section 1: Our Story / About Us */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'আমাদের পরিচয় ও অঙ্গীকার' : 'Who We Are & Our Commitment'}
              </h2>
              <p className="page-paragraph" style={{ whiteSpace: 'pre-line' }}>
                {isBn
                  ? (settings.aboutUsBn || 'জনগণ.নিউজ (Jonogon.News) একটি স্বাধীন, নিরপেক্ষ ও জনকল্যাণমুখী ডিজিটাল সংবাদ মাধ্যম। জনতার কণ্ঠস্বর—এই অঙ্গীকার নিয়ে আমরা প্রতিনিয়ত দেশ-বিদেশের বস্তুনিষ্ঠ সংবাদ পরিবেশন করছি।')
                  : (settings.aboutUsEn || 'Jonogon News is an independent, non-partisan, digital news organisation dedicated to authentic journalism. Our core philosophy is "Voice of the People".')}
              </p>
            </section>

            {/* Section 2: Mission & Vision */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'আমাদের লক্ষ্য ও ভিশন' : 'Our Mission & Vision'}
              </h2>
              <p className="page-paragraph" style={{ whiteSpace: 'pre-line' }}>
                {isBn
                  ? (settings.missionBn || 'জনগণ.নিউজ-এর মূল দর্শন হলো ‘জনতার কণ্ঠস্বর’। আমরা বিশ্বাস করি তথ্যের অবাধ প্রবাহ এবং নির্ভীক সাংবাদিকতাই একটি সুন্দর, গণতান্ত্রিক ও জবাবদিহিতামূলক সমাজ বিনির্মাণের চাবিকাঠি।')
                  : (settings.missionEn || 'At Jonogon News, our core mantra is "Voice of the People". We believe unobstructed flow of information and fearless journalism are foundational to a thriving democracy.')}
              </p>
              {((isBn && settings.visionBn) || (!isBn && settings.visionEn)) && (
                <p className="page-paragraph" style={{ whiteSpace: 'pre-line' }}>
                  {isBn ? settings.visionBn : settings.visionEn}
                </p>
              )}
            </section>

            {/* Core Values 3 Cards */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'আমাদের ৩টি মূল স্তম্ভ' : 'Our Three Core Pillars'}
              </h2>
              <div className="values-grid">
                <div className="value-card">
                  <div className="value-icon-wrap">
                    <ShieldCheck size={24} color="var(--primary-red)" />
                  </div>
                  <h3>{isBn ? '১. বস্তুনিষ্ঠতা ও সত্যতা' : '1. Absolute Accuracy'}</h3>
                  <p>
                    {isBn
                      ? 'যেকোনো সংবাদ প্রকাশের পূর্বে একাধিক নির্ভরযোগ্য সূত্র থেকে তথ্য যাচাই-বাছাই করা হয়।'
                      : 'Rigorous multi-source verification before any story is published.'}
                  </p>
                </div>

                <div className="value-card">
                  <div className="value-icon-wrap">
                    <Eye size={24} color="var(--primary-red)" />
                  </div>
                  <h3>{isBn ? '২. নিরপেক্ষতা' : '2. Fierce Impartiality'}</h3>
                  <p>
                    {isBn
                      ? 'সকল দল ও মতের ঊর্ধ্বে উঠে গণমানুষের স্বার্থ রক্ষায় আমরা আপসহীন ও নিরপেক্ষ।'
                      : 'Editorial independence without influence from corporate or partisan interest.'}
                  </p>
                </div>

                <div className="value-card">
                  <div className="value-icon-wrap">
                    <HeartHandshake size={24} color="var(--primary-red)" />
                  </div>
                  <h3>{isBn ? '৩. জনকল্যাণ ও নৈতিকতা' : '3. Public Interest'}</h3>
                  <p>
                    {isBn
                      ? 'সংবাদ পরিবেশনে নৈতিকতা, মানবাধিকার এবং সামাজিক দায়বদ্ধতা সর্বোচ্চ অগ্রাধিকার পায়।'
                      : 'Unwavering adherence to journalistic ethics, dignity, and civic welfare.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Editorial Board & Leadership */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? 'সম্পাদকীয় ও ব্যবস্থাপনা পর্ষদ' : 'Editorial Leadership'}
              </h2>
              <div className="leadership-card">
                <div className="leadership-info">
                  <h3>{isBn ? settings.founderBn || 'মোঃ বিপ্লব হোসেন' : settings.founderEn || 'Md. Biplob Hossain'}</h3>
                  <span className="leadership-role">
                    {isBn ? settings.designationBn || 'প্রধান সম্পাদক ও প্রকাশক' : settings.designationEn || 'Chief Editor & Publisher'}
                  </span>
                  <p style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isBn
                      ? 'ডিজিটাল মিডিয়া ও অনুসন্ধানী সাংবাদিকতায় দীর্ঘদিনের অভিজ্ঞতাসম্পন্ন। নির্ভীক ও দায়িত্বশীল গণমাধ্যম প্রতিষ্ঠার ব্রত নিয়ে জনগণ.নিউজ পরিচালনা করছেন।'
                      : 'Dedicated to ethical digital journalism, independent investigative reporting and modern multimedia storytelling.'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Info Card */}
          <aside className="page-sidebar-col">
            <div className="page-info-card">
              <h3>{isBn ? 'প্রধান কার্যালয় ও যোগাযোগ' : 'Headquarters'}</h3>
              <div className="info-list">
                <div className="info-row">
                  <MapPin size={16} color="var(--primary-red)" />
                  <span>{settings.address || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230'}</span>
                </div>
                <div className="info-row">
                  <Phone size={16} color="var(--primary-red)" />
                  <a href={`tel:${settings.phone}`}>{settings.phone || '01936618534'}</a>
                </div>
                <div className="info-row">
                  <Mail size={16} color="var(--primary-red)" />
                  <a href={`mailto:${settings.email}`}>{settings.email || 'brandbiplob1234@gmail.com'}</a>
                </div>
                <div className="info-row">
                  <Globe size={16} color="var(--primary-red)" />
                  <span>{settings.domain || 'www.jonogon.news'}</span>
                </div>
              </div>

              <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => navigateTo('/contact')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isBn ? 'যোগাযোগ পেজে যান' : 'Contact Us'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
