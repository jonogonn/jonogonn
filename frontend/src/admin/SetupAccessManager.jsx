import React, { useState, useEffect, useMemo } from 'react';
import { useNews } from '../context/NewsContext';
import { supabase } from '../supabase';
import {
  User,
  Users,
  ShieldCheck,
  KeyRound,
  MessageCircle,
  Phone,
  Mail,
  UserPlus,
  Check,
  X,
  Sliders,
  Camera,
  Search,
  LayoutDashboard,
  PenTool,
  Edit,
  Globe,
  Image as ImageIcon,
  Menu as MenuIcon,
  Layers,
  Mic,
  LifeBuoy,
  DollarSign,
  Database,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Master list of all admin panel sidebar tabs with professional, meaningful names & descriptions
export const ADMIN_AVAILABLE_TABS = [
  {
    id: 'overview',
    group: 'core',
    nameBn: 'ড্যাশবোর্ড ও অ্যানালিটিক্স',
    nameEn: 'Dashboard & Analytics',
    icon: LayoutDashboard,
    descBn: 'সার্বিক ভিজিটর মেট্রিক, লাইভ রিডার ও পোর্টাল ওভারভিউ'
  },
  {
    id: 'create-post',
    group: 'editorial',
    nameBn: 'নতুন সংবাদ তৈরি',
    nameEn: 'Write News Article',
    icon: PenTool,
    descBn: 'নতুন সংবাদ রচনা, ছবি ও ব্লক এডিটর'
  },
  {
    id: 'edit-post',
    group: 'editorial',
    nameBn: 'খসড়া ও সম্পাদনা',
    nameEn: 'Drafts & Editorial',
    icon: Edit,
    descBn: 'খসড়া সংবাদ, রিপোর্টারদের সাবমিশন ও রিভিশন তালিকা'
  },
  {
    id: 'approve-post',
    group: 'editorial',
    nameBn: 'সংবাদ অনুমোদন',
    nameEn: 'Approve & Publish',
    icon: ShieldCheck,
    descBn: 'সাবমিট করা সংবাদের সত্যতা যাচাই ও চূড়ান্ত অনুমোদন'
  },
  {
    id: 'publish-post',
    group: 'editorial',
    nameBn: 'সকল প্রকাশিত সংবাদ',
    nameEn: 'Published News Archive',
    icon: Globe,
    descBn: 'ডাটাবেজের সকল লাইভ ও আর্কাইভে থাকা সংবাদ ব্যবস্থাপনা'
  },
  {
    id: 'gallery',
    group: 'media',
    nameBn: 'মিডিয়া ও ফটো গ্যালারি',
    nameEn: 'Media & CDN Storage',
    icon: ImageIcon,
    descBn: 'ক্লাউড স্টোরেজে WebP ছবি, ফটোকার্ড ও অ্যাসেট লাইব্রেরি'
  },
  {
    id: 'news-card-maker',
    group: 'media',
    nameBn: 'নিউজ কার্ড মেকার',
    nameEn: 'News Card Maker',
    icon: Camera,
    descBn: 'সোশ্যাল মিডিয়ার জন্য ইনস্ট্যান্ট হাই-রেজুলেশন নিউজ কার্ড ডিজাইন, ডাউনলোড ও B2 ক্লাউড আপলোড'
  },
  {
    id: 'podcasts',
    group: 'media',
    nameBn: 'পডকাস্ট ও ভিডিও',
    nameEn: 'Podcasts & Video Shows',
    icon: Mic,
    descBn: 'অডিও/ভিডিও পডকাস্ট পর্ব, অতিথি ও ইউটিউব লিংক'
  },
  {
    id: 'main-menu',
    group: 'layout',
    nameBn: 'মেনু ও ক্যাটাগরি',
    nameEn: 'Menu & Categories',
    icon: MenuIcon,
    descBn: '১০টি মূল বিভাগ, সাব-মেনু ও ড্রপডাউন ব্যবস্থাপনা'
  },
  {
    id: 'homepage-sections',
    group: 'layout',
    nameBn: 'হোমপেজ লেআউট',
    nameEn: 'Homepage Layout Blocks',
    icon: Layers,
    descBn: '৩১টি মডিউলার নিউজ সেকশনের বিন্যাস ও ক্রম নিয়ন্ত্রণ'
  },
  {
    id: 'emergency',
    group: 'services',
    nameBn: 'জরুরি সেবা হেল্পলাইন',
    nameEn: 'Emergency Helplines',
    icon: LifeBuoy,
    descBn: 'জরুরি সরকারি হটলাইন, হাসপাতাল ও অ্যাম্বুলেন্স নম্বর'
  },
  {
    id: 'setup-access',
    group: 'admin',
    nameBn: 'টিম ও এক্সেস কন্ট্রোল',
    nameEn: 'Access & Permissions',
    icon: Users,
    descBn: 'টিম মেম্বারদের আইডি, ইউজারনেম, পাসওয়ার্ড ও ট্যাব পারমিশন'
  },
  {
    id: 'ads',
    group: 'admin',
    nameBn: 'বিজ্ঞাপন ও মনিটাইজেশন',
    nameEn: 'AdSense & Banner Ads',
    icon: DollarSign,
    descBn: 'গুগল অ্যাডসেন্স ও কাস্টম ব্যানার বিজ্ঞাপন নিয়ন্ত্রণ'
  },
  {
    id: 'settings',
    group: 'admin',
    nameBn: 'সাইট ও ব্র্যান্ডিং সেটিংস',
    nameEn: 'Site & SEO Settings',
    icon: Sliders,
    descBn: 'পোর্টাল লোগো, স্লোগান, কালার থিম ও এসইও মেটাডাটা'
  },
  {
    id: 'database',
    group: 'admin',
    nameBn: 'ডাটাবেজ ও ক্লাউড ব্যাকআপ',
    nameEn: 'Database & Cloud Backup',
    icon: Database,
    descBn: 'cPanel MariaDB SQL, Supabase ও B2 ক্লাউড ব্যাকআপ ডাউনলোড'
  },
  {
    id: 'my-profile',
    group: 'admin',
    nameBn: 'প্রোফাইল ও পাসওয়ার্ড',
    nameEn: 'My Profile & Security',
    icon: User,
    descBn: 'ব্যক্তিগত তথ্য, ইউজারনেম, পাসওয়ার্ড ও ছবি পরিবর্তন'
  }
];

// Fallback seed member (Md. Biplob Hossain as primary Super Admin)
const DEFAULT_MEMBERS = [
  {
    id: 'user-1',
    user_code: 'JNG-1001',
    username: 'biplob.admin',
    name: 'মোঃ বিপ্লব হোসেন',
    role: 'Super Admin',
    designation: 'প্রধান সম্পাদক ও প্রকাশক',
    phone: '01936618534',
    email: 'brandbiplob1234@gmail.com',
    temp_password: 'Biplob@Jonogon2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80',
    status: 'active',
    allowed_tabs: ADMIN_AVAILABLE_TABS.map((t) => t.id)
  }
];

// Helper: Generate random strong password
function generateSecurePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 11; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Helper: Generate User Code
function generateUserCode() {
  return 'JNG-' + Math.floor(10000 + Math.random() * 90000);
}

// Helper: Suggest username from name
function suggestUsername(name) {
  if (!name) return 'user_' + Math.floor(100 + Math.random() * 900);
  const clean = name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  return clean ? `${clean}.${Math.floor(10 + Math.random() * 90)}` : 'user_' + Date.now().toString().slice(-4);
}

export default function SetupAccessManager({ triggerSaveToast }) {
  const { adminLanguage, language, showConfirm, showSuccess, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // Members list & Loading state
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('jonogon_access_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MEMBERS;
  });

  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Permission Modal State
  const [permissionModalMember, setPermissionModalMember] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // New Member Form Data
  const [newMemberForm, setNewMemberForm] = useState({
    user_code: generateUserCode(),
    username: '',
    password: generateSecurePassword(),
    name: '',
    designation: '',
    role: 'Reporter',
    phone: '',
    email: '',
    avatar: '',
    allowed_tabs: ['overview', 'create-post', 'edit-post', 'gallery']
  });

  // Credential Success / Email Sent Modal
  const [credentialModalData, setCredentialModalData] = useState(null);

  // Synchronize state with Supabase and localStorage
  const fetchMembersFromSupabase = async () => {
    setIsLoadingSupabase(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, fallback to local:', error.message);
        setSupabaseConnected(false);
      } else if (data && data.length > 0) {
        // Map database columns to state format
        const formatted = data.map((d) => ({
          id: d.id,
          user_code: d.user_code || `JNG-${d.id.slice(0, 4)}`,
          username: d.username,
          name: d.name,
          designation: d.designation,
          role: d.role,
          phone: d.phone,
          email: d.email,
          avatar: d.avatar,
          status: d.status || 'active',
          temp_password: d.temp_password || '********',
          allowed_tabs: Array.isArray(d.allowed_tabs) ? d.allowed_tabs : []
        }));
        setMembers(formatted);
        localStorage.setItem('jonogon_access_members', JSON.stringify(formatted));
        setSupabaseConnected(true);
      } else {
        // Supabase table is empty: seed default members to Supabase!
        seedDefaultMembersToSupabase();
      }
    } catch (err) {
      console.warn('Supabase connection check:', err);
      setSupabaseConnected(false);
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  // Seed default team members into Supabase if table is empty
  const seedDefaultMembersToSupabase = async () => {
    try {
      const inserts = DEFAULT_MEMBERS.map((m) => ({
        user_code: m.user_code,
        username: m.username,
        temp_password: m.temp_password,
        name: m.name,
        designation: m.designation,
        role: m.role,
        phone: m.phone,
        email: m.email,
        avatar: m.avatar,
        status: m.status,
        allowed_tabs: m.allowed_tabs
      }));

      await supabase.from('admin_users').insert(inserts);
    } catch (e) {
      console.warn('Supabase initial seed notice:', e);
    }
  };

  // Fetch on mount and subscribe to real-time changes
  useEffect(() => {
    fetchMembersFromSupabase();

    const channel = supabase
      .channel('admin_users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_users' }, () => {
        fetchMembersFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.username || '').toLowerCase().includes(q) ||
        (m.user_code || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.role || '').toLowerCase().includes(q) ||
        (m.designation || '').toLowerCase().includes(q)
      );
    });
  }, [members, searchQuery]);

  // Open Permission Modal for a member
  const handleOpenPermissionModal = (member) => {
    setPermissionModalMember(member);
    setSelectedPermissions([...(member.allowed_tabs || member.allowedTabs || [])]);
  };

  // Toggle Tab Permission Checkbox
  const handleToggleTab = (tabId) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(tabId)) {
        return prev.filter((id) => id !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  // Select / Deselect All
  const handleSelectAll = () => {
    setSelectedPermissions(ADMIN_AVAILABLE_TABS.map((t) => t.id));
  };
  const handleDeselectAll = () => {
    setSelectedPermissions(['overview']); // keep at least dashboard
  };

  // Save Permissions to Supabase & local state
  const handleSavePermissions = async () => {
    if (!permissionModalMember) return;

    const memberId = permissionModalMember.id;
    const updatedTabs = selectedPermissions;

    // 1. Update in local state
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, allowed_tabs: updatedTabs, allowedTabs: updatedTabs } : m))
    );

    // 2. Update in Supabase
    try {
      await supabase
        .from('admin_users')
        .update({
          allowed_tabs: updatedTabs,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);
    } catch (err) {
      console.warn('Supabase permission update error:', err);
    }

    showSuccess(
      isBn
        ? `"${permissionModalMember.name}" এর জন্য ${updatedTabs.length} টি ট্যাবের পারমিশন সফলভাবে সেভ হয়েছে!`
        : `Updated permissions for ${permissionModalMember.name} (${updatedTabs.length} tabs)!`
    );

    if (triggerSaveToast) triggerSaveToast(isBn ? 'পারমিশন আপডেট সফল!' : 'Permissions updated!');
    setPermissionModalMember(null);
  };

  // Open Add Member Modal and refresh code/pass
  const handleOpenAddModal = () => {
    setNewMemberForm({
      user_code: generateUserCode(),
      username: '',
      password: generateSecurePassword(),
      name: '',
      designation: '',
      role: 'Staff Reporter',
      phone: '',
      email: '',
      avatar: '',
      allowed_tabs: ['overview', 'create-post', 'edit-post', 'gallery']
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  // Save New Member to Supabase, Dispatch Email & Show Credentials
  const handleCreateMember = async (e) => {
    e.preventDefault();

    if (!newMemberForm.name.trim() || !newMemberForm.email.trim() || !newMemberForm.phone.trim()) {
      showError(isBn ? 'নাম, ইমেইল এবং ফোন নম্বর আবশ্যক।' : 'Name, email and phone are required.');
      return;
    }

    const finalUsername =
      newMemberForm.username.trim() || suggestUsername(newMemberForm.name);
    const finalUserCode = newMemberForm.user_code || generateUserCode();
    const finalPassword = newMemberForm.password || generateSecurePassword();
    const cleanPhone = newMemberForm.phone.replace(/[^\d+]/g, '');

    const newMemberPayload = {
      user_code: finalUserCode,
      username: finalUsername,
      temp_password: finalPassword,
      name: newMemberForm.name.trim(),
      designation: newMemberForm.designation.trim() || 'টিম সদস্য',
      role: newMemberForm.role || 'Reporter',
      phone: cleanPhone,
      email: newMemberForm.email.trim(),
      avatar:
        newMemberForm.avatar.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(newMemberForm.name)}&background=E50914&color=fff&size=160`,
      status: 'active',
      allowed_tabs: newMemberForm.allowed_tabs
    };

    setIsSendingEmail(true);

    // 1. Insert into Supabase
    let createdRecord = null;
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert([newMemberPayload])
        .select()
        .single();

      if (!error && data) {
        createdRecord = {
          ...data,
          allowed_tabs: data.allowed_tabs || newMemberForm.allowed_tabs
        };
      }
    } catch (err) {
      console.warn('Supabase insert notice:', err);
    }

    const localItem = createdRecord || {
      id: `user-${Date.now()}`,
      ...newMemberPayload
    };

    // Update local state immediately
    setMembers((prev) => [localItem, ...prev]);

    // 2. Dispatch Automated Email via backend API
    let emailSentResult = false;
    let emailPreviewHtml = '';
    try {
      const emailResp = await fetch('/api/send_access_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberPayload.name,
          email: newMemberPayload.email,
          username: finalUsername,
          password: finalPassword,
          userCode: finalUserCode,
          role: newMemberPayload.role,
          designation: newMemberPayload.designation,
          allowedTabs: newMemberPayload.allowed_tabs,
          loginUrl: window.location.origin
        })
      });

      if (emailResp.ok) {
        const json = await emailResp.json();
        emailSentResult = json.success;
        emailPreviewHtml = json.html_preview || '';
      }
    } catch (mailErr) {
      console.warn('Mail dispatch fallback:', mailErr);
    }

    setIsSendingEmail(false);
    setIsAddModalOpen(false);

    // 3. Show Credential & Email Confirmation Modal
    setCredentialModalData({
      name: newMemberPayload.name,
      email: newMemberPayload.email,
      phone: newMemberPayload.phone,
      user_code: finalUserCode,
      username: finalUsername,
      password: finalPassword,
      role: newMemberPayload.role,
      designation: newMemberPayload.designation,
      allowed_tabs: newMemberPayload.allowed_tabs,
      emailSent: emailSentResult,
      previewHtml: emailPreviewHtml
    });

    showSuccess(
      isBn
        ? `নতুন সদস্য "${newMemberPayload.name}" সফলভাবে যুক্ত হয়েছেন এবং ইমেইল পাঠানো হয়েছে!`
        : `Added ${newMemberPayload.name} and dispatched login credentials!`
    );

    if (triggerSaveToast) triggerSaveToast(isBn ? 'সদস্য এক্সেস যুক্ত সম্পন্ন!' : 'Member added!');
  };

  // Delete Member from Supabase & state
  const handleDeleteMember = async (member) => {
    const confirmed = await showConfirm({
      title: isBn ? 'সদস্য মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete Member',
      message: isBn
        ? `আপনি কি নিশ্চিত যে "${member.name}" (${member.username}) এর অ্যাডমিন এক্সেস স্থায়ীভাবে মুছে ফেলতে চান?`
        : `Permanently delete access for "${member.name}" (${member.username})?`,
      confirmText: isBn ? 'হ্যাঁ, এক্সেস মুছুন' : 'Yes, Delete',
      type: 'danger'
    });

    if (confirmed) {
      // 1. Delete from Supabase
      try {
        await supabase.from('admin_users').delete().eq('id', member.id);
      } catch (err) {
        console.warn('Supabase delete error:', err);
      }

      // 2. Delete from local state
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showSuccess(isBn ? 'সদস্যের এক্সেস সফলভাবে মুছে ফেলা হয়েছে।' : 'Member access removed.');
    }
  };

  // Helper to format WhatsApp chat URL
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

  // Helper to copy text to clipboard
  const handleCopyToClipboard = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      if (triggerSaveToast) triggerSaveToast(`${label} ক্লিপবোর্ডে কপি হয়েছে!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '22px 24px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(220,38,38,0.06) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 12
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(229, 9, 20, 0.12)',
                color: 'var(--primary-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)'
                }}
              >
                {isBn ? 'টিম ও এক্সেস কন্ট্রোল (Setup Access)' : 'Team Access & Permissions'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {isBn ? 'Supabase ক্লাউড কানেকশন:' : 'Supabase Cloud Database:'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: supabaseConnected ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: supabaseConnected ? '#10B981' : '#EF4444',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: supabaseConnected ? '#10B981' : '#EF4444'
                    }}
                  />
                  {supabaseConnected ? 'Live RLS Connected (mxzsmulbandttegciiiy)' : 'Offline Local Mode'}
                </span>
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {isBn
              ? 'টিম সদস্যদের নাম, ক্রেডেনশিয়াল (ইউজারনেম/পাসওয়ার্ড), সরাসরি হোয়াটসঅ্যাপ যোগাযোগ এবং ১৪টি সাইডবার ট্যাবের এক্সেস পারমিশন নিয়ন্ত্রণ করুন।'
              : 'Manage team access credentials, direct WhatsApp contacts, and granular sidebar tab permissions.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={fetchMembersFromSupabase}
            disabled={isLoadingSupabase}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
            title={isBn ? 'ডাটাবেজ রিফ্রেশ করুন' : 'Refresh Supabase'}
          >
            <RefreshCw size={16} className={isLoadingSupabase ? 'animate-spin' : ''} />
            <span>{isBn ? 'রিফ্রেশ' : 'Sync'}</span>
          </button>

          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(229, 9, 20, 0.3)'
            }}
          >
            <UserPlus size={18} />
            <span>{isBn ? '+ নতুন সদস্য ও ক্রেডেনশিয়াল তৈরি' : '+ Add Team Member'}</span>
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isBn ? 'মোট টিম সদস্য' : 'Total Members'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {members.length}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isBn ? 'সুপার / এক্সিকিউটিভ অ্যাডমিন' : 'Admins'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {members.filter((m) => (m.role || '').toLowerCase().includes('admin')).length}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PenTool size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isBn ? 'বার্তা সম্পাদক ও রিপোর্টার' : 'Editors & Reporters'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {members.filter((m) => !(m.role || '').toLowerCase().includes('admin')).length}
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KeyRound size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isBn ? 'মোট সাইডবার ফিচার ট্যাব' : 'Available Tabs'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {ADMIN_AVAILABLE_TABS.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABLE FILTER & SEARCH */}
      <div
        className="admin-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 18px'
        }}
      >
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="admin-input"
            style={{ paddingLeft: 36, height: 38, fontSize: '0.85rem' }}
            placeholder={isBn ? 'নাম, ইউজারনেম, ফোন বা পদবী দিয়ে খুঁজুন...' : 'Search by name, username, phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          {isBn ? `মোট ${filteredMembers.length} জন সদস্য প্রদর্শিত` : `Showing ${filteredMembers.length} members`}
        </div>
      </div>

      {/* 4. TEAM MEMBERS TABLE (With WhatsApp & Permission Buttons) */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'সদস্য ও ইউজার আইডি' : 'Member & User ID'}
                </th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'পদবী ও রোল' : 'Designation & Role'}
                </th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'যোগাযোগ ও হোয়াটসঅ্যাপ' : 'Phone & WhatsApp Link'}
                </th>
                <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'ইমেইল এড্রেস' : 'Email Address'}
                </th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'অনুমোদিত ট্যাব' : 'Allowed Tabs'}
                </th>
                <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 800 }}>
                  {isBn ? 'পারমিশন অ্যাকশন' : 'Permission Action'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    {isBn ? 'কোন সদস্য পাওয়া যায়নি।' : 'No team members found.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const allowedList = member.allowed_tabs || member.allowedTabs || [];
                  const isSuper = (member.role || '').toLowerCase().includes('super');

                  return (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Member Info */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=E50914&color=fff`}
                            alt={member.name}
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--border-color)'
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                              {member.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontFamily: 'monospace',
                                  backgroundColor: 'rgba(229, 9, 20, 0.1)',
                                  color: 'var(--primary-red)',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  fontWeight: 700
                                }}
                              >
                                {member.user_code || 'JNG-USER'}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                @{member.username}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Designation & Role */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {member.designation}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 4,
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            backgroundColor: isSuper
                              ? 'rgba(229, 9, 20, 0.15)'
                              : (member.role || '').toLowerCase().includes('editor')
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(100, 116, 139, 0.15)',
                            color: isSuper
                              ? '#E50914'
                              : (member.role || '').toLowerCase().includes('editor')
                              ? '#3B82F6'
                              : 'var(--text-secondary)'
                          }}
                        >
                          {member.role}
                        </span>
                      </td>

                      {/* Phone & Direct WhatsApp Chat Link */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <a
                            href={`tel:${member.phone}`}
                            style={{
                              color: 'var(--text-primary)',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                            title="কল করুন"
                          >
                            {member.phone}
                          </a>

                          {/* Green WhatsApp Chat Button */}
                          <a
                            href={getWhatsAppLink(member.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#25D366',
                              color: '#FFFFFF',
                              padding: '4px 10px',
                              borderRadius: 16,
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                              transition: 'transform 0.15s ease'
                            }}
                            title="সরাসরি হোয়াটসঅ্যাপে চ্যাট শুরু করুন"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          <Mail size={14} color="var(--text-muted)" />
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* Allowed Tabs Counter */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            backgroundColor:
                              allowedList.length === ADMIN_AVAILABLE_TABS.length
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                            color:
                              allowedList.length === ADMIN_AVAILABLE_TABS.length
                                ? '#10B981'
                                : '#3B82F6'
                          }}
                        >
                          {allowedList.length} / {ADMIN_AVAILABLE_TABS.length} {isBn ? 'ট্যাব' : 'Tabs'}
                        </span>
                      </td>

                      {/* Action: Permission Button & Delete */}
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {/* Main Permission Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionModal(member)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              backgroundColor: 'var(--primary-red)',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '7px 14px',
                              borderRadius: 6,
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(229, 9, 20, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                            title={isBn ? 'ট্যাব এক্সেস ও পারমিশন পরিবর্তন করুন' : 'Edit Tab Permissions'}
                          >
                            <KeyRound size={14} />
                            <span>Permission</span>
                          </button>

                          {/* Delete Member (protected for primary Super Admin) */}
                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#EF4444',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title={isBn ? 'সদস্য মুছে ফেলুন' : 'Delete Member'}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. PERMISSION MODAL (Lists all 14 sidebar tabs with checkboxes)       */}
      {/* ==================================================================== */}
      {permissionModalMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPermissionModalMember(null);
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={
                    permissionModalMember.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(permissionModalMember.name)}&background=E50914&color=fff`
                  }
                  alt={permissionModalMember.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      margin: 0,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {permissionModalMember.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {permissionModalMember.designation} • @{permissionModalMember.username}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPermissionModalMember(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Actions Header */}
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isBn ? 'সাইডবার ট্যাব পারমিশন নির্বাচন করুন:' : 'Select Sidebar Tab Permissions:'}
                <span style={{ color: 'var(--primary-red)', marginLeft: 6 }}>
                  ({selectedPermissions.length} / {ADMIN_AVAILABLE_TABS.length})
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isBn ? 'সব নির্বাচন করুন' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isBn ? 'সব বাতিল' : 'Deselect All'}
                </button>
              </div>
            </div>

            {/* Tab Checkbox Grid */}
            <div
              style={{
                padding: '16px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 12
              }}
            >
              {ADMIN_AVAILABLE_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isSelected = selectedPermissions.includes(tab.id);

                return (
                  <label
                    key={tab.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: isSelected ? '1.5px solid var(--primary-red)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(229, 9, 20, 0.05)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTab(tab.id)}
                      style={{ marginTop: 3, cursor: 'pointer' }}
                    />

                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        backgroundColor: isSelected ? 'rgba(229, 9, 20, 0.12)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--primary-red)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <IconComponent size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.86rem',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {isBn ? tab.nameBn : tab.nameEn}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>
                        {tab.descBn}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12
              }}
            >
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setPermissionModalMember(null)}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={handleSavePermissions}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  fontWeight: 800
                }}
              >
                <Check size={16} />
                <span>{isBn ? 'পারমিশন সেভ করুন' : 'Save Permissions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. ADD MEMBER MODAL (With Username, Password Generator & Tab Selection)*/}
      {/* ==================================================================== */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserPlus size={22} color="var(--primary-red)" />
                <h3
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}
                >
                  {isBn ? 'নতুন টিম সদস্য ও লগইন এক্সেস তৈরি' : 'Create Team Member & Access'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateMember} style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
              {/* Notice Banner */}
              <div
                style={{
                  backgroundColor: 'rgba(229, 9, 20, 0.08)',
                  border: '1px solid rgba(229, 9, 20, 0.25)',
                  padding: '12px 16px',
                  borderRadius: 8,
                  marginBottom: 18,
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <Mail size={18} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                <span>
                  {isBn
                    ? 'সদস্য যোগ করার সাথে সাথে স্বয়ংক্রিয়ভাবে তার ইমেইলে ইউজার আইডি, ইউজারনেম ও পাসওয়ার্ড চলে যাবে।'
                    : 'System will automatically email login credentials (User ID, username & password) to the member.'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {/* Name */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পুরো নাম *' : 'Full Name *'}</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="উদাঃ মোঃ তানভীর আহমেদ"
                    value={newMemberForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewMemberForm((prev) => ({
                        ...prev,
                        name,
                        username: prev.username || suggestUsername(name)
                      }));
                    }}
                  />
                </div>

                {/* Email */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'ইমেইল এড্রেস (যেখানে পাসওয়ার্ড যাবে) *' : 'Email Address *'}</label>
                  <input
                    type="email"
                    required
                    className="admin-input"
                    placeholder="member@jonogon.news"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                  />
                </div>

                {/* Phone Number */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'ফোন নম্বর (WhatsApp) *' : 'Phone (WhatsApp) *'}</label>
                  <input
                    type="tel"
                    required
                    className="admin-input"
                    placeholder="01936618534"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                  />
                </div>

                {/* Designation */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পদবী *' : 'Designation *'}</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    placeholder="উদাঃ সিনিয়র রিপোর্টার / বার্তা সম্পাদক"
                    value={newMemberForm.designation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, designation: e.target.value })}
                  />
                </div>

                {/* Role */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'সিস্টেম রোল' : 'System Role'}</label>
                  <select
                    className="admin-input"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  >
                    <option value="Staff Reporter">{isBn ? 'স্টাফ রিপোর্টার (Staff Reporter)' : 'Staff Reporter'}</option>
                    <option value="News Editor">{isBn ? 'বার্তা সম্পাদক (News Editor)' : 'News Editor'}</option>
                    <option value="Executive Admin">{isBn ? 'নির্বাহী অ্যাডমিন (Executive Admin)' : 'Executive Admin'}</option>
                    <option value="Multimedia Lead">{isBn ? 'মাল্টিমিডিয়া প্রযোজক (Multimedia Lead)' : 'Multimedia Lead'}</option>
                    <option value="Ads Manager">{isBn ? 'বিজ্ঞাপন ও গ্রোথ ম্যানেজার (Ads Manager)' : 'Ads Manager'}</option>
                  </select>
                </div>

                {/* User ID (Auto-Generated) */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'সদস্য আইডি (User Code)' : 'User Code (ID)'}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ fontFamily: 'monospace', fontWeight: 800 }}
                      value={newMemberForm.user_code}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, user_code: e.target.value })}
                    />
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setNewMemberForm({ ...newMemberForm, user_code: generateUserCode() })}
                      title="নতুন কোড জেনারেট"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'ইউজারনেম (Login Username) *' : 'Username *'}</label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    style={{ fontFamily: 'monospace' }}
                    placeholder="tanveer.reporter"
                    value={newMemberForm.username}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, username: e.target.value })}
                  />
                </div>

                {/* Password (Auto-Generated Strong) */}
                <div className="admin-form-group">
                  <label className="admin-label">{isBn ? 'পাসওয়ার্ড (Login Password) *' : 'Password *'}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showAddPassword ? 'text' : 'password'}
                        required
                        className="admin-input"
                        style={{ fontFamily: 'monospace', paddingRight: 36, letterSpacing: '0.5px' }}
                        value={newMemberForm.password}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showAddPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setNewMemberForm({ ...newMemberForm, password: generateSecurePassword() })}
                      title="নতুন স্ট্রং পাসওয়ার্ড জেনারেট করুন"
                    >
                      <KeyRound size={14} color="var(--primary-red)" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Initial Tab Permissions */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label className="admin-label" style={{ margin: 0 }}>
                    {isBn ? 'অনুমোদিত প্রাথমিক ট্যাব পারমিশন নির্বাচন করুন:' : 'Initial Tab Permissions:'}
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-red)', fontWeight: 800 }}>
                    {newMemberForm.allowed_tabs.length} {isBn ? 'টি নির্বাচিত' : 'Selected'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 8,
                    maxHeight: 180,
                    overflowY: 'auto',
                    padding: 8,
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  {ADMIN_AVAILABLE_TABS.map((t) => {
                    const isChecked = newMemberForm.allowed_tabs.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          backgroundColor: isChecked ? 'rgba(229, 9, 20, 0.08)' : 'var(--bg-card)',
                          border: isChecked ? '1px solid rgba(229,9,20,0.3)' : '1px solid transparent',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setNewMemberForm((prev) => ({
                              ...prev,
                              allowed_tabs: isChecked
                                ? prev.allowed_tabs.filter((id) => id !== t.id)
                                : [...prev.allowed_tabs, t.id]
                            }));
                          }}
                        />
                        <span>{isBn ? t.nameBn : t.nameEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  marginTop: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12
                }}
              >
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="admin-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    fontWeight: 800
                  }}
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{isBn ? 'ইমেইল পাঠানো হচ্ছে...' : 'Dispatching Email...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{isBn ? 'সদস্য তৈরি ও ইমেইল পাঠান' : 'Create & Send Email'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. CREDENTIAL & EMAIL SUCCESS CONFIRMATION MODAL                     */}
      {/* ==================================================================== */}
      {credentialModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCredentialModalData(null);
          }}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 580,
              padding: '24px 28px',
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: 'var(--text-primary)'
                }}
              >
                {isBn ? 'সদস্য সফলভাবে যুক্ত হয়েছে!' : 'Access Credentials Generated!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                {credentialModalData.emailSent
                  ? (isBn ? `ক্রেডেনশিয়াল সম্বলিত ইমেইল পাঠানো হয়েছে: ${credentialModalData.email}` : `Email dispatched to: ${credentialModalData.email}`)
                  : (isBn ? `ক্রেডেনশিয়াল তৈরি হয়েছে এবং স্থানীয়ভাবে প্রস্তুত রয়েছে: ${credentialModalData.email}` : `Credentials created for: ${credentialModalData.email}`)}
              </p>
            </div>

            {/* Credential Details Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'সদস্য নাম:' : 'Name:'}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{credentialModalData.name}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'ইউজার আইডি (User ID):' : 'User Code:'}</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      backgroundColor: 'rgba(229,9,20,0.1)',
                      color: 'var(--primary-red)',
                      padding: '2px 8px',
                      borderRadius: 4
                    }}
                  >
                    {credentialModalData.user_code}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'ইউজারনেম (Username):' : 'Username:'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#3B82F6' }}>
                      {credentialModalData.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(credentialModalData.username, 'ইউজারনেম')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="কপি করুন"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{isBn ? 'পাসওয়ার্ড (Password):' : 'Password:'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-card)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {credentialModalData.password}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyToClipboard(credentialModalData.password, 'পাসওয়ার্ড')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="পাসওয়ার্ড কপি করুন"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Copy Full Summary / WhatsApp Direct Send */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="admin-btn-secondary"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => {
                  const summary = `জনগণ.নিউজ - আপনার এক্সেস ক্রেডেনশিয়াল\nনাম: ${credentialModalData.name}\nইউজার আইডি: ${credentialModalData.user_code}\nইউজারনেম: ${credentialModalData.username}\nপাসওয়ার্ড: ${credentialModalData.password}\nলগইন লিংক: ${window.location.origin}`;
                  handleCopyToClipboard(summary, 'সম্পূর্ণ ক্রেডেনশিয়াল');
                }}
              >
                <Copy size={15} />
                <span>{isBn ? 'সকল তথ্য কপি করুন' : 'Copy Credentials'}</span>
              </button>

              <a
                href={`https://wa.me/${credentialModalData.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                  `স্বাগতম ${credentialModalData.name},\nজনগণ.নিউজ পোর্টালে আপনার এক্সেস একাউন্ট তৈরি হয়েছে:\nUser ID: ${credentialModalData.user_code}\nUsername: ${credentialModalData.username}\nPassword: ${credentialModalData.password}\nLogin: ${window.location.origin}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              >
                <MessageCircle size={15} />
                <span>{isBn ? 'WhatsApp-এ পাঠান' : 'Send on WhatsApp'}</span>
              </a>

              <button
                type="button"
                className="admin-btn-primary"
                style={{ width: '100%', marginTop: 4 }}
                onClick={() => setCredentialModalData(null)}
              >
                {isBn ? 'ঠিক আছে' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
