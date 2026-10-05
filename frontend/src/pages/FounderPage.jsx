import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  User,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Code,
  Palette,
  Megaphone,
  Mic,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { FacebookIcon, YoutubeIcon } from '../components/Icons/SocialIcons';

export default function FounderPage() {
  const { language, settings, goToHome, navigateTo } = useNews();
  const isBn = language === 'bn';

  // 3D Card Tilt State
  const [tilt, setTilt] = React.useState({ x: 0, y: 0, shineX: 50, shineY: 50 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; // 3D tilt angle
    const rotateY = ((x - centerX) / centerX) * 14;
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    setTilt({ x: rotateX, y: rotateY, shineX, shineY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn
        ? 'মোঃ বিপ্লব হোসেন — স্বত্বাধিকারী ও সম্পাদক, জনগণ.নিউজ'
        : 'Md. Biplob Hossain — Owner & Editor, Jonogon News',
      description: isBn
        ? 'জনগণ.নিউজ-এর স্বত্বাধিকারী ও সম্পাদক এবং Brand By Biplob-এর প্রতিষ্ঠাতা ও সিইও মোঃ বিপ্লব হোসেনের পরিচিতি, পেশাগত দর্শন ও ডিজিটাল উদ্ভাবন।'
        : 'Official profile of Md. Biplob Hossain, Owner & Editor of Jonogon News and Founder & CEO of Brand By Biplob.',
      url: `${window.location.origin}/founder`,
      type: 'profile'
    });
  }, [isBn]);

  const founderSkills = [
    {
      icon: <Layers size={22} color="var(--primary-red)" />,
      titleBn: 'ব্র্যান্ড আর্কিটেকচার ও ক্রিয়েটিভ ডিজাইন',
      titleEn: 'Brand Architecture & Creative Design',
      descBn: 'লোগো ডিজাইন, ব্র্যান্ড আইডেন্টিটি, অ্যাপ ইন্টারফেস ও কাস্টমাইজড ভিজ্যুয়াল আর্ট নির্মাণ।'
    },
    {
      icon: <Megaphone size={22} color="var(--primary-red)" />,
      titleBn: 'ডিজিটাল মার্কেটিং ও ক্যাম্পেইন স্ট্র্যাটেজি',
      titleEn: 'Digital Marketing & PPC Advertising',
      descBn: 'সোশ্যাল মিডিয়া গ্রোথ, ভিডিও অ্যাডভার্টাইজিং, ভয়েস-ওভার ও ব্র্যান্ড বুস্টিং।'
    },
    {
      icon: <Code size={22} color="var(--primary-red)" />,
      titleBn: 'ওয়েব ডেভেলপমেন্ট ও সিস্টেমস আর্কিটেকচার',
      titleEn: 'Web Development & Media Architecture',
      descBn: 'স্কেলেবল ডিজিটাল নিউজ পোর্টাল ও আধুনিক হাই-স্পিড ওয়েব অ্যাপ্লিকেশন ডেভেলপমেন্ট।'
    },
    {
      icon: <Cpu size={22} color="var(--primary-red)" />,
      titleBn: 'গুগল টেকনিক্যাল কনসালটেন্সি ও অ্যানালিটিক্স',
      titleEn: 'Google Analytics & Merchant Solutions',
      descBn: 'Google Merchant Center সমাধান, GA4 অ্যানালিটিক্স এবং এসইও (SEO) অপ্টিমাইজেশন।'
    },
    {
      icon: <Mic size={22} color="var(--primary-red)" />,
      titleBn: 'মাল্টিমিডিয়া ও পডকাস্ট প্রযোজনা',
      titleEn: 'Multimedia & Podcast Direction',
      descBn: 'ভিডিও সংবাদ প্রযোজনা, স্ক্রিপ্ট রাইটিং ও জাতীয় ইস্যুভিত্তিক অডিও-ভিজ্যুয়াল পডকাস্ট সঞ্চালনা।'
    },
    {
      icon: <ShieldCheck size={22} color="var(--primary-red)" />,
      titleBn: 'ডিজিটাল জার্নালিজম ও নিউজ লিডারশিপ',
      titleEn: 'Journalistic Integrity & News Leadership',
      descBn: 'বস্তুনিষ্ঠ রিপোর্টিং, তৃণমূলের অধিকার রক্ষা ও নিরপেক্ষ সাংবাদিকতার প্রাতিষ্ঠানিক নেতৃত্ব।'
    }
  ];

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <button onClick={() => navigateTo('/about')} className="breadcrumb-link">
            {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">
            {isBn ? 'মোঃ বিপ্লব হোসেন' : 'Md. Biplob Hossain'}
          </span>
        </nav>

        {/* Hero Profile Showcase Card with 3D Interactive Stage */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderTop: '5px solid var(--primary-red)',
            borderRadius: 12,
            padding: '40px 36px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: 40,
            marginBottom: 36,
            alignItems: 'center'
          }}
          className="founder-hero-grid"
        >
          {/* 3D Founder Interactive Tilt Showcase */}
          <div className="founder-3d-scene" style={{ perspective: 1200 }}>
            <div
              className={`founder-3d-card ${!isHovered ? 'founder-idle-float' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`,
                transition: isHovered ? 'transform 0.1s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Radial Neon Backing Aura */}
              <div className="founder-3d-glow" />

              {/* Dynamic Specular Light Glare */}
              <div
                className="founder-3d-glare"
                style={{
                  background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`
                }}
              />

              {/* Holographic Top Floating Badge */}
              <div className="founder-3d-badge-top">
                <span>{isBn ? 'স্বত্বাধিকারী ও সম্পাদক' : 'Owner & Editor'}</span>
              </div>

              {/* 3D Cutout High-Res Portrait from D:\xampp\htdocs\janogon\founder.png */}
              <div className="founder-3d-img-wrap">
                <img
                  src="/founder.png"
                  alt={isBn ? 'মোঃ বিপ্লব হোসেন — স্বত্বাধিকারী ও সম্পাদক' : 'Md. Biplob Hossain — Owner & Editor'}
                  className="founder-3d-portrait"
                />
              </div>

              {/* Bottom 3D Floating Nameplate */}
              <div className="founder-3d-nameplate">
                <span className="founder-nameplate-title">
                  {isBn ? 'মোঃ বিপ্লব হোসেন' : 'Md. Biplob Hossain'}
                </span>
                <span className="founder-nameplate-sub">
                  {isBn ? 'জনগণ.নিউজ • Brand By Biplob' : 'Jonogon News • Brand By Biplob'}
                </span>
              </div>
            </div>

            {/* 3D Floating Social & Agency Links */}
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 10 }}>
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="Facebook"
                  style={{ transform: 'translateZ(15px)', transition: 'all 0.2s ease' }}
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
                  style={{ transform: 'translateZ(15px)', transition: 'all 0.2s ease' }}
                >
                  <YoutubeIcon size={16} />
                </a>
              )}
              <a
                href="https://www.brandbybiplob.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                title="Brand By Biplob Agency"
                style={{ backgroundColor: 'var(--primary-red)', color: '#fff', transform: 'translateZ(15px)', fontWeight: 700 }}
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Founder Intro Text */}
          <div>
            <div className="page-hero-badge" style={{ marginBottom: 8 }}>
              <span>{isBn ? 'স্বত্বাধিকারী ও সম্পাদক' : 'Owner & Editor'}</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.2,
                marginBottom: 6
              }}
            >
              {isBn ? 'মোঃ বিপ্লব হোসেন' : 'Md. Biplob Hossain'}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--primary-red)', fontWeight: 700, marginBottom: 16 }}>
              {isBn
                ? 'স্বত্বাধিকারী ও সম্পাদক, জনগণ.নিউজ | প্রতিষ্ঠাতা ও সিইও, Brand By Biplob'
                : 'Owner & Editor, Jonogon News | Founder & CEO, Brand By Biplob'}
            </p>

            <p className="page-paragraph" style={{ fontSize: '1rem', lineHeight: 1.75 }}>
              {isBn
                ? 'মোঃ বিপ্লব হোসেন একজন প্রগতিশীল প্রযুক্তিবিদ, ডিজিটাল স্ট্র্যাটেজিস্ট এবং স্বাধীন সাংবাদিকতার পৃষ্ঠপোষক। তিনি বাংলাদেশের গণমানুষের অধিকার ও সত্য সংবাদের অবাধ প্রবাহ নিশ্চিত করার লক্ষ্যে ‘জনগণ.নিউজ’ (Jonogon News) প্রতিষ্ঠা করেন। একই সাথে তিনি শীর্ষ ডিজিটাল ক্রিয়েটিভ এজেন্সি ‘Brand By Biplob’ (www.brandbybiplob.com)-এর প্রধান নির্বাহী কর্মকর্তা হিসেবে দেশের ব্র্যান্ডিং ও প্রযুক্তি খাতে সফল অবদান রেখে চলেছেন।'
                : 'Md. Biplob Hossain is a digital strategist, brand architect, and media innovator dedicated to truthful, fearless journalism. As the Owner & Editor of Jonogon News and CEO of Brand By Biplob, he blends modern technology with journalistic integrity to empower citizens.'}
            </p>

            {/* Quick Contact Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 4, fontSize: '0.86rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                <Mail size={15} color="var(--primary-red)" />
                <a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`} style={{ color: 'inherit', fontWeight: 600 }}>
                  {settings.email || 'brandbiplob1234@gmail.com'}
                </a>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 4, fontSize: '0.86rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                <Phone size={15} color="var(--primary-red)" />
                <a href={`tel:${settings.phone || '01936618534'}`} style={{ color: 'inherit', fontWeight: 600 }}>
                  {settings.phone || '01936618534'}
                </a>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 4, fontSize: '0.86rem', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                <Globe size={15} color="var(--primary-red)" />
                <a href="https://www.brandbybiplob.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-red)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span>brandbybiplob.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Core Vision & Editorial Philosophy */}
        <section className="page-section-block" style={{ marginBottom: 32 }}>
          <h2 className="section-subheading">
            <span className="bullet-accent"></span>
            {isBn ? 'নেতৃত্বের দৃষ্টিভঙ্গি ও সম্পাদকের বার্তা' : 'Editorial Vision & Leadership Philosophy'}
          </h2>
          <p className="page-paragraph">
            {isBn
              ? '“সাংবাদিকতা কেবল সংবাদ পরিবেশন নয়; এটি সত্যকে রক্ষা করা এবং সাধারণ মানুষের অধিকার প্রতিষ্ঠায় এক অবিচল অঙ্গীকার। ‘জনগণ.নিউজ’ প্রতিষ্ঠার মাধ্যমে আমরা এমন একটি ডিজিটাল সংবাদ প্ল্যাটফর্ম গড়ে তুলেছি যা কোনো গোষ্ঠীর স্বার্থে নয়, বরং জনগণের সত্য জানার অধিকারকে সর্বোচ্চ স্থান দেয়।”'
              : '"Journalism is a sacred responsibility to preserve truth and champion human dignity. Jonogon News was built on the unyielding principle that the voice of the people must always stand above partisan interests."'}
          </p>
          <div style={{ marginTop: 12, fontWeight: 700, color: 'var(--primary-red)' }}>
            — {isBn ? 'মোঃ বিপ্লব হোসেন (স্বত্বাধিকারী ও সম্পাদক)' : 'Md. Biplob Hossain (Owner & Editor)'}
          </div>
        </section>

        {/* Agency Profile: Brand By Biplob Services & Innovation */}
        <section className="page-section-block" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 className="section-subheading" style={{ margin: 0, border: 'none' }}>
              <span className="bullet-accent"></span>
              {isBn ? 'পেশাগত দক্ষতা ও উদ্ভাবন (Brand By Biplob)' : 'Professional Expertise & Solutions'}
            </h2>
            <a
              href="https://www.brandbybiplob.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-primary"
              style={{ fontSize: '0.86rem', padding: '6px 14px', textDecoration: 'none' }}
            >
              <span>{isBn ? 'এজেন্সি ওয়েবসাইট দেখুন' : 'Visit BrandByBiplob.com'}</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <p className="page-paragraph" style={{ marginBottom: 20 }}>
            {isBn
              ? 'ডিজিটাল ক্রিয়েটিভ এজেন্সি ‘Brand By Biplob’ সাশ্রয়ী মূল্যে সর্বোচ্চ মানের ডিজাইন, ভিডিও প্রোডাকশন, গুগল মার্চেন্ট সাপোর্ট ও ডেটা-ড্রিভেন মার্কেটিং সলিউশন প্রদান করে থাকে।'
              : 'Through Brand By Biplob, he delivers cutting-edge digital branding, UI/UX architecture, Google Merchant Center integrations, and high-impact visual media campaigns.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="values-grid">
            {founderSkills.map((sk, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon-wrap">{sk.icon}</div>
                <h3>{isBn ? sk.titleBn : sk.titleEn}</h3>
                <p>{isBn ? sk.descBn : sk.descEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Office Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="page-info-card">
            <h3>{isBn ? 'সরাসরি যোগাযোগ' : 'Direct Contact'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={18} color="var(--primary-red)" />
                <span>{settings.email || 'brandbiplob1234@gmail.com'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={18} color="var(--primary-red)" />
                <span>{settings.phone || '01936618534'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={18} color="var(--primary-red)" />
                <a href="https://www.brandbybiplob.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-red)', fontWeight: 700 }}>
                  www.brandbybiplob.com
                </a>
              </div>
            </div>
          </div>

          <div className="page-info-card">
            <h3>{isBn ? 'কার্যালয়ের ঠিকানা' : 'Office Location'}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <MapPin size={20} color="var(--primary-red)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>{isBn ? settings.siteNameBn || 'জনগণ.নিউজ' : settings.siteNameEn || 'Jonogon News'}</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  {settings.address || 'House 101, Alia Madrasa Road, Faydabad, Dakshinkhan, Dhaka-1230'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
