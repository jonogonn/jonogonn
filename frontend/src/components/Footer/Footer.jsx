import React from 'react';
import { useNews } from '../../context/NewsContext';
import { MapPin, Phone, Mail, User, Lock } from 'lucide-react';
import { FacebookIcon, YoutubeIcon } from '../Icons/SocialIcons';

export default function Footer() {
  const { language, settings, setActiveCategory, navigateTo, openAdmin } = useNews();
  const isBn = language === 'bn';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          {/* Col 1: Brand & Founder Info */}
          <div className="footer-brand">
            <img
              src={settings.logoUrl || '/logo.svg'}
              alt={isBn ? settings.siteNameBn : settings.siteNameEn}
              className="footer-logo"
            />
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {isBn
                ? 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদের বিশ্বস্ত ঠিকানা। দেশ-বিদেশের তাজা খবর মুহূর্তেই পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।'
                : 'Your trusted digital source for verified, objective, and timely journalism standing for the people.'}
            </p>
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} color="var(--primary-red)" />
              <a
                href="/founder"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/founder');
                }}
                style={{ color: 'inherit', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-red)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                title={isBn ? 'স্বত্বাধিকারী ও সম্পাদকের পরিচিতি দেখুন' : 'View Owner & Editor Profile'}
              >
                <strong>{isBn ? settings.founderBn : settings.founderEn}</strong> (
                {isBn ? settings.designationBn : settings.designationEn})
              </a>
            </div>
          </div>

          {/* Col 2: Important Links */}
          <div>
            <h4 className="footer-col-title">{isBn ? 'প্রয়োজনীয় লিঙ্ক' : 'Quick Links'}</h4>
            <div className="footer-links-list">
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/about');
                }}
              >
                {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
              </a>
              <a
                href="/advertisement"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/advertisement');
                }}
              >
                {isBn ? 'বিজ্ঞাপন ও দরপত্র' : 'Advertisement'}
              </a>
              <a
                href="/editorial-policy"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/editorial-policy');
                }}
              >
                {isBn ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}
              </a>
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/privacy');
                }}
              >
                {isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
              </a>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/terms');
                }}
              >
                {isBn ? 'ব্যবহারের শর্তাবলী' : 'Terms & Conditions'}
              </a>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/contact');
                }}
              >
                {isBn ? 'যোগাযোগ ও ব্যুরো' : 'Contact Us'}
              </a>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="footer-col-title">{isBn ? 'বিভাগসমূহ' : 'Categories'}</h4>
            <div className="footer-links-list">
              <a
                href="/category/national"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('national');
                }}
              >
                {isBn ? 'জাতীয় সংবাদ' : 'National'}
              </a>
              <a
                href="/category/politics"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('politics');
                }}
              >
                {isBn ? 'রাজনীতি' : 'Politics'}
              </a>
              <a
                href="/category/editorial"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('editorial');
                }}
              >
                {isBn ? 'সম্পাদকীয় কলাম' : 'Editorial Column'}
              </a>
              <a
                href="/category/international"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('international');
                }}
              >
                {isBn ? 'আন্তর্জাতিক' : 'World'}
              </a>
              <a
                href="/category/economy"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('economy');
                }}
              >
                {isBn ? 'অর্থনীতি ও বাণিজ্য' : 'Economy'}
              </a>
              <a
                href="/category/sports"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('sports');
                }}
              >
                {isBn ? 'খেলাধুলা' : 'Sports'}
              </a>
              <a
                href="/category/tech"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory('tech');
                }}
              >
                {isBn ? 'তথ্যপ্রযুক্তি' : 'Technology'}
              </a>
            </div>
          </div>

          {/* Col 4: Contact & Office Info */}
          <div>
            <h4 className="footer-col-title">{isBn ? 'যোগাযোগ ও কার্যালয়' : 'Office & Contact'}</h4>
            <div className="footer-contact-info">
              <div className="contact-item">
                <MapPin size={16} color="var(--primary-red)" style={{ flexShrink: 0, marginTop: 3 }} />
                <span>{settings.address}</span>
              </div>
              <div className="contact-item">
                <Phone size={16} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </div>
              <div className="contact-item">
                <Mail size={16} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>
              © {new Date().getFullYear()} {isBn ? settings.siteNameBn : settings.siteNameEn}। সর্বস্বত্ব সংরক্ষিত।
            </span>
            <button
              onClick={() => openAdmin()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--text-light)',
                fontSize: '0.78rem',
                opacity: 0.8
              }}
              title="Admin Panel"
            >
              <Lock size={12} />
              <span>{isBn ? 'অ্যাডমিন' : 'Admin'}</span>
            </button>
          </div>

          <div className="footer-bottom-social">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="Facebook"
                aria-label="Facebook Page"
              >
                <FacebookIcon size={16} />
              </a>
            )}
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="YouTube"
                aria-label="YouTube Channel"
              >
                <YoutubeIcon size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
