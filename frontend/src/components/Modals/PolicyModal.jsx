import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  X,
  ShieldCheck,
  FileText,
  Info,
  Megaphone,
  PhoneCall,
  Phone,
  ExternalLink,
  LifeBuoy,
  Search,
  Check,
  Globe,
  AlertCircle
} from 'lucide-react';

export default function PolicyModal() {
  const { activePolicyModal, setActivePolicyModal, language, settings, emergencyServices } = useNews();
  const isBn = language === 'bn';

  const [serviceSearch, setServiceSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  if (!activePolicyModal) return null;

  const handleCopyNumber = (id, num) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredServices = (emergencyServices || []).filter((s) => {
    if (!serviceSearch.trim()) return true;
    const q = serviceSearch.toLowerCase();
    return (
      (s.nameBn && s.nameBn.toLowerCase().includes(q)) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
      (s.number && s.number.includes(q)) ||
      (s.categoryBn && s.categoryBn.toLowerCase().includes(q)) ||
      (s.descriptionBn && s.descriptionBn.toLowerCase().includes(q))
    );
  });

  // Dedicated Emergency Services Modal View
  if (activePolicyModal === 'emergency') {
    return (
      <div className="modal-overlay" onClick={() => setActivePolicyModal(null)}>
        <div
          className="modal-container emergency-modal-container"
          style={{ maxWidth: 840, width: '95%', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  backgroundColor: 'rgba(230, 0, 18, 0.1)',
                  padding: 8,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LifeBuoy size={22} color="var(--primary-red)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {isBn ? 'জাতীয় জরুরি সেবা ও হেল্পলাইন ডিরেক্টরি' : 'National Emergency & Govt Services'}
                </h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {isBn ? 'জরুরি প্রয়োজনে বাংলাদেশ সরকারের প্রয়োজনীয় সেবা ও পোর্টাল' : 'Official BD Government Helplines & Portals'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={() => setActivePolicyModal(null)} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 6,
                padding: '6px 12px'
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder={isBn ? 'সেবার নাম, নম্বর বা ধরন লিখে খুঁজুন (যেমন: ৯৯৯, ভূমি, পুলিশ)...' : 'Search service, number, or category...'}
                style={{ width: '100%', background: 'transparent', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
              {serviceSearch && (
                <button onClick={() => setServiceSearch('')} style={{ color: 'var(--text-muted)' }}>
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Body / Services Grid */}
          <div className="modal-body emergency-services-body" style={{ maxHeight: 'calc(90vh - 160px)', overflowY: 'auto', padding: 18 }}>
            {filteredServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <AlertCircle size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
                <p>{isBn ? 'কোনো জরুরি সেবা পাওয়া যায়নি।' : 'No emergency services found.'}</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 14
                }}
              >
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="emergency-card"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      {/* Category Badge & Hotline */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--primary-red)',
                            backgroundColor: 'rgba(230, 0, 18, 0.08)',
                            padding: '2px 8px',
                            borderRadius: 4
                          }}
                        >
                          {isBn ? srv.categoryBn || 'সরকারি সেবা' : srv.categoryEn || 'Govt Service'}
                        </span>

                        {srv.number && (
                          <span
                            style={{
                              fontFamily: 'var(--font-headline)',
                              fontSize: '1rem',
                              fontWeight: 900,
                              color: 'var(--primary-red)',
                              letterSpacing: '0.5px'
                            }}
                          >
                            ☎ {srv.number}
                          </span>
                        )}
                      </div>

                      {/* Service Name */}
                      <h4
                        style={{
                          fontFamily: 'var(--font-headline)',
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          margin: '0 0 6px 0',
                          lineHeight: 1.3
                        }}
                      >
                        {isBn ? srv.nameBn : srv.nameEn}
                      </h4>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--text-muted)',
                          margin: 0,
                          lineHeight: 1.45
                        }}
                      >
                        {isBn ? srv.descriptionBn : srv.descriptionEn}
                      </p>
                    </div>

                    {/* Action Buttons: Direct Call & Official Portal */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        paddingTop: 8,
                        borderTop: '1px dashed var(--border-color)'
                      }}
                    >
                      {srv.number && (
                        <a
                          href={`tel:${srv.number}`}
                          style={{
                            flex: 1,
                            backgroundColor: 'var(--primary-red)',
                            color: 'var(--white)',
                            padding: '7px 10px',
                            borderRadius: 4,
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={14} />
                          <span>{isBn ? `কল করুন (${srv.number})` : `Call ${srv.number}`}</span>
                        </a>
                      )}

                      {srv.websiteUrl && (
                        <a
                          href={srv.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: srv.number ? '0 0 auto' : 1,
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            padding: '7px 12px',
                            borderRadius: 4,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            textDecoration: 'none'
                          }}
                        >
                          <Globe size={14} color="var(--primary-red)" />
                          <span>{isBn ? 'ওয়েবসাইট' : 'Website'}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Policy Modals (Terms, Privacy, Editorial, About, Contact, Advertisement)
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
