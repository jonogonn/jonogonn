import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { CloudSun } from 'lucide-react';
import { FacebookIcon, YoutubeIcon } from '../Icons/SocialIcons';

export default function TopBar() {
  const {
    language,
    settings,
    setActivePolicyModal
  } = useNews();

  const isBn = language === 'bn';

  // Live Current Date
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    if (isBn) {
      const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
      const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const dayName = bnDays[now.getDay()];
      const dayNum = now.toLocaleDateString('bn-BD', { day: 'numeric' });
      const monthName = bnMonths[now.getMonth()];
      const yearNum = now.toLocaleDateString('bn-BD', { year: 'numeric' });
      setCurrentDate(`${dayName}, ${dayNum} ${monthName} ${yearNum}`);
    } else {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    }
  }, [isBn]);

  return (
    <header className="topbar">
      <div className="container topbar-content">
        {/* Left Side: Live Date & Weather */}
        <div className="topbar-left">
          <div className="topbar-date">
            <span>{currentDate}</span>
          </div>
          <div className="topbar-weather">
            <CloudSun size={15} color="var(--primary-red)" />
            <span>{isBn ? 'ঢাকা ২৩°C' : 'Dhaka 23°C'}</span>
          </div>
        </div>

        {/* Right Side: Links & Socials */}
        <div className="topbar-right">
          <nav className="topbar-links">
            <button onClick={() => setActivePolicyModal('about')}>
              {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
            </button>
            <span>|</span>
            <button onClick={() => setActivePolicyModal('advertisement')}>
              {isBn ? 'বিজ্ঞাপন' : 'Advertisement'}
            </button>
            <span>|</span>
            <button onClick={() => setActivePolicyModal('contact')}>
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </button>
          </nav>

          {/* Social Icons */}
          <div className="topbar-social">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                aria-label="Facebook Page"
              >
                <FacebookIcon size={15} />
              </a>
            )}
            {settings.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                title="YouTube"
                aria-label="YouTube Channel"
              >
                <YoutubeIcon size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
