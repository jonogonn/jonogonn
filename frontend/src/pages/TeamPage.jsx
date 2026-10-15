import React, { useState, useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { supabase } from '../supabase';
import { updateSEO } from '../services/seoService';
import {
  Users,
  ChevronRight,
  Search,
  CheckCircle2,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Sparkles,
  UserCheck,
  RefreshCw,
  Send,
  ExternalLink,
  MapPin
} from 'lucide-react';

// Fallback seed team members if database is offline
const DEFAULT_TEAM_MEMBERS = [
  {
    id: 'user-1',
    user_code: 'JNG-1001',
    name: 'মোঃ বিপ্লব হোসেন',
    role: 'Super Admin',
    designation: 'প্রধান সম্পাদক ও প্রকাশক',
    phone: '01936618534',
    email: 'brandbiplob1234@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    status: 'active'
  }
];

export default function TeamPage() {
  const { language, settings, goToHome, navigateTo } = useNews();
  const isBn = language === 'bn';

  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const publicSaved = localStorage.getItem('jonogon_access_members_public');
      if (publicSaved) {
        const parsed = JSON.parse(publicSaved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const adminSaved = localStorage.getItem('jonogon_access_members');
      if (adminSaved) {
        const parsed = JSON.parse(adminSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((m) => m.status !== 'inactive' && m.status !== 'suspended');
        }
      }
    } catch (e) {}
    return DEFAULT_TEAM_MEMBERS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'editorial', 'reporters', 'multimedia'

  // Fetch dynamic members from Supabase admin_users
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, name, designation, role, avatar, email, phone, status, user_code, created_at')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        // Exclude suspended and inactive members from public view
        const activeOnly = data.filter((m) => m.status !== 'inactive' && m.status !== 'suspended');
        setTeamMembers(activeOnly);
        try {
          localStorage.setItem('jonogon_access_members_public', JSON.stringify(activeOnly));
        } catch (e) {}
      } else {
        // Fallback to local access members
        try {
          const local = localStorage.getItem('jonogon_access_members');
          if (local) {
            const parsed = JSON.parse(local);
            const activeOnly = parsed.filter((m) => m.status !== 'inactive' && m.status !== 'suspended');
            if (activeOnly.length > 0) setTeamMembers(activeOnly);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Team fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn
        ? 'আমাদের সম্পাদকীয় ও রিপোর্টিং টিম — সাংবাদিক পরিচিতি'
        : 'Editorial & Reporting Team — Jonogon News Journalists',
      description: isBn
        ? 'জনগণ.নিউজ-এর বস্তুনিষ্ঠ ও সত্যনিষ্ঠ সংবাদ পরিবেশনে নিয়োজিত সম্পাদক, প্রতিবেদক ও সাংবাদিক মণ্ডলী।'
        : 'Meet the dedicated journalists, editors and reporters of Jonogon News upholding independent news.',
      url: `${window.location.origin}/team`,
      type: 'profile'
    });

    fetchTeamMembers();

    // Subscribe to realtime updates if admin adds or updates member in Team & Access Control
    const channel = supabase
      .channel('team_page_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, () => {
        fetchTeamMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isBn]);

  // Filter logic
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      // 1. Category Filter
      const roleStr = (member.role || '').toLowerCase();
      const desigStr = (member.designation || '').toLowerCase();

      if (activeFilter === 'editorial') {
        const isEd =
          roleStr.includes('admin') ||
          roleStr.includes('editor') ||
          desigStr.includes('সম্পাদক') ||
          desigStr.includes('প্রকাশক');
        if (!isEd) return false;
      } else if (activeFilter === 'reporters') {
        const isRep =
          roleStr.includes('reporter') ||
          roleStr.includes('correspondent') ||
          desigStr.includes('প্রতিবেদক') ||
          desigStr.includes('রিপোর্টার') ||
          desigStr.includes('প্রতিনিধি');
        if (!isRep) return false;
      } else if (activeFilter === 'multimedia') {
        const isMulti =
          roleStr.includes('multimedia') ||
          roleStr.includes('ads') ||
          roleStr.includes('lead') ||
          desigStr.includes('ভিডিও') ||
          desigStr.includes('মাল্টিমিডিয়া') ||
          desigStr.includes('বিজ্ঞাপন');
        if (!isMulti) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (member.name || '').toLowerCase().includes(q);
        const desigMatch = (member.designation || '').toLowerCase().includes(q);
        const roleMatch = (member.role || '').toLowerCase().includes(q);
        const codeMatch = (member.user_code || '').toLowerCase().includes(q);
        if (!nameMatch && !desigMatch && !roleMatch && !codeMatch) return false;
      }

      return true;
    });
  }, [teamMembers, activeFilter, searchQuery]);

  // Helper for WhatsApp
  const getWhatsAppLink = (phone) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^\d]/g, '');
    if (clean.startsWith('0')) {
      clean = '88' + clean;
    } else if (!clean.startsWith('880')) {
      clean = '880' + clean;
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 70px 0', minHeight: '80vh' }}>
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
            {isBn ? 'আমাদের টিম ও সাংবাদিক পর্ষদ' : 'Editorial & Reporting Team'}
          </span>
        </nav>

        {/* Hero Banner Header */}
        <header
          className="page-hero-header"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(229,9,20,0.06) 100%)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: '36px 30px',
            marginBottom: 32,
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: 'rgba(229, 9, 20, 0.1)',
              color: 'var(--primary-red)',
              fontSize: '0.82rem',
              fontWeight: 800,
              marginBottom: 12
            }}
          >
            <Users size={16} />
            <span>{isBn ? 'সাংবাদিক ও সম্পাদকীয় পরিবার' : 'Editorial & Media Team'}</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              margin: '0 0 10px 0',
              color: 'var(--text-primary)',
              lineHeight: 1.25
            }}
          >
            {isBn ? 'জনগণ.নিউজ-এর নিবেদিত সংবাদকর্মী ও সম্পাদক মণ্ডলী' : 'Dedicated Journalists & Editorial Board'}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
              color: 'var(--text-muted)',
              maxWidth: 720,
              margin: '0 auto 20px auto',
              lineHeight: 1.6
            }}
          >
            {isBn
              ? 'জনগণের পক্ষে সত্য ও বস্তুনিষ্ঠ সংবাদ তুলে ধরতে সততা, নির্ভীকতা ও পেশাদারিত্বের সাথে নিয়োজিত আমাদের সাংবাদিক দল।'
              : 'The driving force behind fearless, objective and timely journalism standing for the people of Bangladesh.'}
          </p>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '10px 24px',
              borderRadius: 12,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--primary-red)', fontWeight: 900, fontSize: '1.1rem' }}>
                {teamMembers.length}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{isBn ? 'জন সংবাদকর্মী' : 'Journalists'}</span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} color="#10B981" />
              <span style={{ color: 'var(--text-secondary)' }}>{isBn ? '১০০% বস্তুনিষ্ঠ' : '100% Verified'}</span>
            </div>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} color="var(--primary-red)" />
              <span style={{ color: 'var(--text-secondary)' }}>{isBn ? 'সারাদেশে ব্যুরো নেটওয়ার্ক' : 'Nationwide Bureau'}</span>
            </div>
          </div>
        </header>

        {/* Filter and Search Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 28,
            padding: '14px 18px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 12
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {[
              { id: 'all', labelBn: 'সকল সদস্য', labelEn: 'All Members' },
              { id: 'editorial', labelBn: 'সম্পাদকীয় পর্ষদ', labelEn: 'Editorial Board' },
              { id: 'reporters', labelBn: 'প্রতিবেদক ও প্রতিনিধি', labelEn: 'Reporters & Correspondents' },
              { id: 'multimedia', labelBn: 'মাল্টিমিডিয়া ও গ্রোথ', labelEn: 'Multimedia & Growth' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  border: activeFilter === cat.id ? '1px solid var(--primary-red)' : '1px solid var(--border-color)',
                  backgroundColor: activeFilter === cat.id ? 'var(--primary-red)' : 'var(--bg-secondary)',
                  color: activeFilter === cat.id ? '#FFFFFF' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {isBn ? cat.labelBn : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 320, minWidth: 220 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              className="admin-input"
              style={{
                paddingLeft: 36,
                height: 40,
                fontSize: '0.86rem',
                borderRadius: 20,
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)'
              }}
              placeholder={isBn ? 'নাম বা পদবী দিয়ে খুঁজুন...' : 'Search by name or title...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Members Grid Showcase */}
        {isLoading && teamMembers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--primary-red)' }} />
            <p>{isBn ? 'টিম সদস্যদের তালিকা লোড হচ্ছে...' : 'Loading team members...'}</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 14,
              border: '1px solid var(--border-color)'
            }}
          >
            <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 14px auto', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              {isBn ? 'কোন সদস্য পাওয়া যায়নি' : 'No team members match your filter'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 16px 0' }}>
              {isBn ? 'অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন বা ফিল্টার রিসেট করুন।' : 'Try adjusting your search criteria.'}
            </p>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              style={{ padding: '8px 20px', borderRadius: 20 }}
            >
              {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filter'}
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 22
            }}
          >
            {filteredMembers.map((member) => {
              const isSuper = (member.role || '').toLowerCase().includes('super');
              const isEditor = (member.role || '').toLowerCase().includes('editor');

              return (
                <div
                  key={member.id}
                  className="team-member-card"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 16,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(229, 9, 20, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {/* Top Badge: Role */}
                  <div style={{ position: 'absolute', top: 14, right: 14 }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: isSuper
                          ? 'rgba(229, 9, 20, 0.12)'
                          : isEditor
                          ? 'rgba(59, 130, 246, 0.12)'
                          : 'rgba(100, 116, 139, 0.12)',
                        color: isSuper ? 'var(--primary-red)' : isEditor ? '#3B82F6' : 'var(--text-secondary)'
                      }}
                    >
                      {member.role || 'Journalist'}
                    </span>
                  </div>

                  {/* Profile Picture Frame */}
                  <div
                    style={{
                      position: 'relative',
                      width: 104,
                      height: 104,
                      marginBottom: 16,
                      marginTop: 6
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        padding: 3,
                        background: isSuper
                          ? 'linear-gradient(135deg, #E50914, #FFA000)'
                          : 'linear-gradient(135deg, var(--border-color), rgba(229,9,20,0.4))',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img
                        src={
                          member.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Member')}&background=E50914&color=fff&size=200`
                        }
                        alt={member.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          backgroundColor: 'var(--bg-secondary)',
                          display: 'block'
                        }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Member')}&background=E50914&color=fff&size=200`;
                        }}
                      />
                    </div>

                    {/* Verified Green Check Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        right: 4,
                        bottom: 4,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                      }}
                      title={isBn ? 'ভেরিফাইড সাংবাদিক' : 'Verified Journalist'}
                    >
                      <CheckCircle2 size={20} color="#10B981" fill="#10B981" style={{ color: '#fff' }} />
                    </div>
                  </div>

                  {/* Member Name */}
                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.18rem',
                      fontWeight: 800,
                      margin: '0 0 6px 0',
                      color: 'var(--text-primary)',
                      lineHeight: 1.3
                    }}
                  >
                    {member.name}
                  </h3>

                  {/* Designation (পদবী) */}
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      color: 'var(--primary-red)',
                      marginBottom: 10
                    }}
                  >
                    {member.designation || (isBn ? 'সংবাদকর্মী' : 'Journalist')}
                  </div>

                  {/* User Code ID Badge */}
                  {member.user_code && (
                    <div style={{ marginBottom: 16 }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-muted)',
                          padding: '2px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {member.user_code}
                      </span>
                    </div>
                  )}

                  <div style={{ flex: 1 }} />

                  {/* Contact Badges & Links */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      paddingTop: 14,
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(229, 9, 20, 0.1)';
                          e.currentTarget.style.color = 'var(--primary-red)';
                          e.currentTarget.style.borderColor = 'var(--primary-red)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                        title={`${isBn ? 'ইমেইল করুন:' : 'Email:'} ${member.email}`}
                      >
                        <Mail size={15} />
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={getWhatsAppLink(member.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: 'rgba(37, 211, 102, 0.12)',
                          color: '#25D366',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          border: '1px solid rgba(37, 211, 102, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        title="WhatsApp মেসেজ পাঠান"
                      >
                        <MessageCircle size={15} />
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.color = '#3B82F6';
                          e.currentTarget.style.borderColor = '#3B82F6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                        title={`${isBn ? 'কল করুন:' : 'Call:'} ${member.phone}`}
                      >
                        <Phone size={15} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Newsroom Join CTA */}
        <section
          style={{
            marginTop: 48,
            padding: '30px 24px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(229, 9, 20, 0.08) 100%)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-red)', fontWeight: 800, fontSize: '0.84rem', marginBottom: 6 }}>
              <Sparkles size={16} />
              <span>{isBn ? 'জনগণ.নিউজ পরিবারে ক্যারিয়ার' : 'Join Our Newsroom'}</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
              {isBn ? 'আপনিও কি বস্তুনিষ্ঠ সাংবাদিকতায় অবদান রাখতে চান?' : 'Want to join our fearless journalism mission?'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {isBn
                ? 'আপনার জেলা বা এলাকা থেকে অনুসন্ধানী সংবাদ, ফিচার প্রতিবেদন বা মতামত পাঠাতে আমাদের বার্তা বিভাগের সাথে যোগাযোগ করুন।'
                : 'Send your resume, investigative reports, or district coverage ideas to our news desk.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('/contact')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 8,
              backgroundColor: 'var(--primary-red)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(229, 9, 20, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={16} />
            <span>{isBn ? 'যোগাযোগ করুন' : 'Contact News Desk'}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
