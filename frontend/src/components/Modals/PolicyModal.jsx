import React from 'react';
import { useNews } from '../../context/NewsContext';
import { X, ShieldCheck, FileText, Info, Megaphone, PhoneCall } from 'lucide-react';

export default function PolicyModal() {
  const { activePolicyModal, setActivePolicyModal, language, settings } = useNews();
  const isBn = language === 'bn';

  if (!activePolicyModal) return null;

  const getContent = () => {
    switch (activePolicyModal) {
      case 'terms':
        return {
          title: isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions',
          icon: <FileText size={22} color="var(--primary-red)" />,
          body: settings.termsAndConditions
        };
      case 'privacy':
        return {
          title: isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy',
          icon: <ShieldCheck size={22} color="var(--primary-red)" />,
          body: settings.privacyPolicy
        };
      case 'editorial':
        return {
          title: isBn ? 'সম্পাদকীয় নীতি (Editorial Policy)' : 'Editorial Policy',
          icon: <Info size={22} color="var(--primary-red)" />,
          body: settings.editorialPolicy
        };
      case 'about':
        return {
          title: isBn ? 'আমাদের সম্পর্কে (About Us)' : 'About Jonogon News',
          icon: <Info size={22} color="var(--primary-red)" />,
          body: isBn
            ? `জনগণ.নিউজ (Jonogon News) বাংলাদেশের একটি আধুনিক, নিরপেক্ষ ও সত্যনিষ্ঠ ডিজিটাল সংবাদ মাধ্যম।\n\nপ্রতিষ্ঠাতা ও সম্পাদক: ${settings.founderBn} (${settings.designationBn})\nপ্রতিষ্ঠান: ${settings.organization}\nওয়েবসাইট: ${settings.websiteUrl}\nঠিকানা: ${settings.address}\n\nআমাদের মূল লক্ষ্য দেশের আপামর জনসাধারণের স্বার্থরক্ষা ও দ্রুততম সময়ে তথ্য পরিবেশন করা।`
            : `Jonogon News is a leading digital media platform delivering independent, unbiased, and fast-paced journalism.\n\nFounder & Editor: ${settings.founderEn} (${settings.designationEn})\nOrganization: ${settings.organization}\nURL: ${settings.websiteUrl}\nAddress: ${settings.address}`
        };
      case 'advertisement':
        return {
          title: isBn ? 'বিজ্ঞাপন ও বাণিজ্যিক তথ্য' : 'Advertisement & Commercial Queries',
          icon: <Megaphone size={22} color="var(--primary-red)" />,
          body: isBn
            ? `জনগণ.নিউজ-এ বিজ্ঞাপন দিয়ে আপনার ব্র্যান্ড বা পণ্যের প্রসার বাড়ান।\n\nবিজ্ঞাপনের ধরন:\n১. হেডার ও ফুটার ব্যানার (728x90 / 970x90)\n২. সাইডবার ব্যানার (300x250 / 300x600)\n৩. ইন-ফিড নেটিভ বিজ্ঞাপন ও স্পন্সরড কনটেন্ট\n\nবিজ্ঞাপনের বিস্তারিত রেট ও বুকিংয়ের জন্য যোগাযোগ করুন:\nমোবাইল: ${settings.phone}\nইমেইল: ${settings.email}`
            : `Promote your brand and enterprise across Jonogon News.\n\nAvailable ad spots: Header Banners, Sidebar Medium Rectangles, In-article native placements, and Video sponsors.\n\nDirect Bookings:\nPhone: ${settings.phone}\nEmail: ${settings.email}`
        };
      case 'contact':
        return {
          title: isBn ? 'যোগাযোগ ও সম্পাদকীয় দফতর' : 'Contact & Editorial Desk',
          icon: <PhoneCall size={22} color="var(--primary-red)" />,
          body: isBn
            ? `কার্যালয়ের ঠিকানা:\n${settings.address}\n\nযোগাযোগ নম্বর:\nমোবাইল: ${settings.phone}\n\nইমেইল:\n${settings.email}\n\nফেসবুক পেজ:\n${settings.facebook}`
            : `Office Address:\n${settings.address}\n\nPhone: ${settings.phone}\nEmail: ${settings.email}\nFacebook: ${settings.facebook}`
        };
      default:
        return null;
    }
  };

  const modalData = getContent();
  if (!modalData) return null;

  return (
    <div className="modal-overlay" onClick={() => setActivePolicyModal(null)}>
      <div className="modal-container" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {modalData.icon}
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 700 }}>
              {modalData.title}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={() => setActivePolicyModal(null)} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ whiteSpace: 'pre-line', fontSize: '1rem' }}>
          {modalData.body}
        </div>
      </div>
    </div>
  );
}
