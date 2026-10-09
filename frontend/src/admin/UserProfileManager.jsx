import React, { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { supabase } from '../supabase';
import {
  User,
  KeyRound,
  Shield,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Camera,
  Check,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { uploadImageToStorage } from '../utils/imageUploader';

export default function UserProfileManager({ triggerSaveToast }) {
  const { adminLanguage, language, showSuccess, showError } = useNews();
  const isBn = (adminLanguage || language) === 'bn';

  // User Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: localStorage.getItem('jonogon_admin_name') || 'মোঃ বিপ্লব হোসেন',
    username: localStorage.getItem('jonogon_admin_username') || 'biplob.admin',
    email: localStorage.getItem('jonogon_admin_email') || 'brandbiplob1234@gmail.com',
    phone: localStorage.getItem('jonogon_admin_phone') || '01936618534',
    designation: 'প্রধান সম্পাদক ও প্রকাশক',
    role: 'Super Admin',
    avatar:
      localStorage.getItem('jonogon_admin_avatar') ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80'
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'password'

  // Fetch initial profile from MariaDB / Supabase if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile.php?username=${encodeURIComponent(profileForm.username)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.user) {
            setProfileForm((prev) => ({
              ...prev,
              name: json.user.name || prev.name,
              username: json.user.username || prev.username,
              email: json.user.email || prev.email,
              phone: json.user.phone || prev.phone,
              avatar: json.user.avatar || prev.avatar,
              designation: json.user.designation || prev.designation,
              role: json.user.role || prev.role
            }));
          }
        }
      } catch (err) {
        console.warn('Profile sync notice:', err);
      }
    };
    loadProfile();
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;
    return Math.min(score, 100);
  };

  const passStrength = getPasswordStrength(passwordForm.newPassword);

  // Avatar Image Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);

  const handleAvatarFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল (.jpg, .png, .webp) নির্বাচন করুন।' : 'Please select an image file.');
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarUploadStatus(isBn ? 'WebP রূপান্তর ও আপলোড হচ্ছে...' : 'Uploading avatar...');

    try {
      const uploadedUrl = await uploadImageToStorage(file, {
        slug: `avatar-${profileForm.username}`,
        caption: `Avatar - ${profileForm.name}`,
        onProgress: (p, text) => setAvatarUploadStatus(text)
      });

      if (uploadedUrl) {
        setProfileForm((prev) => ({ ...prev, avatar: uploadedUrl }));
        showSuccess(isBn ? 'প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে! পরিবর্তন সেভ করতে "Save Profile" এ ক্লিক করুন।' : 'Avatar uploaded successfully!');
      } else {
        showError(isBn ? 'ছবি আপলোড করতে ব্যর্থ হয়েছে।' : 'Failed to upload avatar image.');
      }
    } catch (err) {
      showError(isBn ? 'ছবি আপলোডে ত্রুটি ঘটেছে।' : 'Upload error occurred.');
    } finally {
      setIsUploadingAvatar(false);
      setAvatarUploadStatus('');
    }
  };

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordForm((prev) => ({
      ...prev,
      newPassword: pass,
      confirmPassword: pass
    }));
    setShowNewPass(true);
  };

  // Save Profile Updates (Name, Username, Phone, Email, Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update MariaDB via PHP endpoint
      const res = await fetch('/api/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: profileForm.username,
          name: profileForm.name,
          username: profileForm.username,
          email: profileForm.email,
          phone: profileForm.phone,
          avatar: profileForm.avatar
        })
      });

      // 2. Update Supabase admin_users table
      try {
        await supabase
          .from('admin_users')
          .update({
            name: profileForm.name,
            username: profileForm.username,
            email: profileForm.email,
            phone: profileForm.phone,
            avatar: profileForm.avatar,
            updated_at: new Date().toISOString()
          })
          .eq('username', profileForm.username);
      } catch (sbErr) {
        console.warn('Supabase sync notice:', sbErr);
      }

      // 3. Update localStorage
      localStorage.setItem('jonogon_admin_name', profileForm.name);
      localStorage.setItem('jonogon_admin_username', profileForm.username);
      localStorage.setItem('jonogon_admin_email', profileForm.email);
      localStorage.setItem('jonogon_admin_phone', profileForm.phone);
      localStorage.setItem('jonogon_admin_avatar', profileForm.avatar);

      showSuccess(
        isBn
          ? 'প্রোফাইলের তথ্য MariaDB ও ক্লাউড ডাটাবেজে সফলভাবে আপডেট হয়েছে!'
          : 'Profile details updated in database!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'প্রোফাইল তথ্য আপডেট সম্পন্ন' : 'Profile updated');
    } catch (err) {
      showError(isBn ? 'প্রোফাইল আপডেটে সমস্যা হয়েছে।' : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.newPassword) {
      showError(isBn ? 'অনুগ্রহ করে নতুন পাসওয়ার্ড দিন।' : 'New password is required.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError(isBn ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!' : 'Passwords do not match.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Update in MariaDB
      const res = await fetch('/api/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: profileForm.username,
          newPassword: passwordForm.newPassword
        })
      });

      // 2. Update in Supabase
      try {
        await supabase
          .from('admin_users')
          .update({
            temp_password: passwordForm.newPassword,
            updated_at: new Date().toISOString()
          })
          .eq('username', profileForm.username);
      } catch (sbErr) {
        console.warn('Supabase sync notice:', sbErr);
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      showSuccess(
        isBn
          ? 'আপনার লগইন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'
          : 'Password changed successfully!'
      );
      if (triggerSaveToast) triggerSaveToast(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত' : 'Password changed');
    } catch (err) {
      showError(isBn ? 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।' : 'Error changing password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* 1. TOP PROFILE HERO CARD */}
      <div
        className="admin-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(220, 38, 38, 0.08) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profileForm.avatar}
              alt={profileForm.name}
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary-red)',
                boxShadow: '0 4px 14px rgba(229, 9, 20, 0.25)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Check size={12} strokeWidth={3} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--text-primary)'
                }}
              >
                {profileForm.name}
              </h2>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(229, 9, 20, 0.15)',
                  color: 'var(--primary-red)',
                  padding: '2px 8px',
                  borderRadius: 12
                }}
              >
                {profileForm.role}
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 3 }}>
              {profileForm.designation} • @{profileForm.username}
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation Pills */}
        <div style={{ display: 'flex', gap: 8, backgroundColor: 'var(--bg-secondary)', padding: 4, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.84rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'profile' ? 'var(--primary-red)' : 'transparent',
              color: activeSubTab === 'profile' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            {isBn ? 'প্রোফাইল তথ্য' : 'Profile Info'}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('password')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.84rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSubTab === 'password' ? 'var(--primary-red)' : 'transparent',
              color: activeSubTab === 'password' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            {isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* 2. SUBTAB: PROFILE INFO */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="admin-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0' }}>
            {isBn ? 'ব্যক্তিগত তথ্য ও ইউজারনেম সম্পাদনা' : 'Edit Profile Information'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Full Name */}
            <div className="admin-form-group">
              <label className="admin-label">{isBn ? 'পুরো নাম (বাংলা/ইংরেজি) *' : 'Full Name *'}</label>
              <input
                type="text"
                required
                className="admin-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>

            {/* Username */}
            <div className="admin-form-group">
              <label className="admin-label">{isBn ? 'ইউজারনেম (Login Username) *' : 'Username *'}</label>
              <input
                type="text"
                required
                className="admin-input"
                style={{ fontFamily: 'monospace' }}
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="admin-form-group">
              <label className="admin-label">{isBn ? 'ফোন নম্বর (WhatsApp) *' : 'Phone *'}</label>
              <input
                type="tel"
                required
                className="admin-input"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="admin-form-group">
              <label className="admin-label">{isBn ? 'ইমেইল এড্রেস *' : 'Email Address *'}</label>
              <input
                type="email"
                required
                className="admin-input"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>

            {/* Avatar Photo Upload */}
            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">{isBn ? 'প্রোফাইল ছবি (Avatar Photo Upload) *' : 'Profile Photo *'}</label>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
                onDragLeave={() => setIsDraggingAvatar(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleAvatarFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: `2px dashed ${isDraggingAvatar ? 'var(--primary-red)' : 'var(--border-color)'}`,
                  borderRadius: 12,
                  padding: '20px 24px',
                  backgroundColor: isDraggingAvatar ? 'rgba(229, 9, 20, 0.05)' : 'var(--bg-secondary)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 20,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Avatar Preview */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={profileForm.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name)}&background=E50914&color=fff&size=160`}
                    alt="Avatar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary-red)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                  {isUploadingAvatar && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Loader2 size={24} className="animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Info & Buttons */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    {isBn ? 'নতুন প্রোফাইল ছবি আপলোড করুন' : 'Upload Profile Photo'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    {isBn
                      ? 'যেকোনো JPG, PNG বা WebP ছবি ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ফাইল ব্রাউজ করুন। স্বয়ংক্রিয়ভাবে ব্যাকব্লেজ B2 ক্লাউডে WebP ফরম্যাটে আপলোড হবে।'
                      : 'Drag & drop image or browse file. Automatically converted to WebP and uploaded to Backblaze B2.'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 18px',
                        backgroundColor: 'var(--primary-red)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                        opacity: isUploadingAvatar ? 0.7 : 1,
                        boxShadow: '0 2px 8px rgba(229, 9, 20, 0.3)'
                      }}
                    >
                      {isUploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span>{isUploadingAvatar ? (avatarUploadStatus || (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...')) : (isBn ? 'ছবি সিলেক্ট ও আপলোড করুন' : 'Select & Upload Photo')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingAvatar}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAvatarFile(e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {profileForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setProfileForm({ ...profileForm, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name)}&background=E50914&color=fff&size=160` })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 8,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>{isBn ? 'ডিফল্ট সেট করুন' : 'Reset to Default'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                fontWeight: 800
              }}
            >
              <Save size={17} />
              <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. SUBTAB: CHANGE PASSWORD */}
      {activeSubTab === 'password' && (
        <form onSubmit={handleChangePassword} className="admin-card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            {isBn ? 'লগইন পাসওয়ার্ড পরিবর্তন' : 'Change Login Password'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
            {isBn
              ? 'একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন যাতে বড় হাতের অক্ষর, ছোট হাতের অক্ষর, সংখ্যা ও বিশেষ চিহ্ন থাকে।'
              : 'Use a strong password with uppercase, lowercase, numbers and symbols.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* New Password */}
            <div className="admin-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="admin-label" style={{ margin: 0 }}>
                  {isBn ? 'নতুন পাসওয়ার্ড *' : 'New Password *'}
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-red)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <KeyRound size={13} />
                  <span>{isBn ? 'স্ট্রং পাসওয়ার্ড জেনারেট করুন' : 'Generate Strong Password'}</span>
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  className="admin-input"
                  style={{ fontFamily: 'monospace', paddingRight: 40, letterSpacing: '0.5px' }}
                  placeholder="********"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      height: 4,
                      width: '100%',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${passStrength}%`,
                        backgroundColor:
                          passStrength < 40 ? '#EF4444' : passStrength < 75 ? '#F59E0B' : '#10B981',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      marginTop: 4,
                      color: passStrength < 40 ? '#EF4444' : passStrength < 75 ? '#F59E0B' : '#10B981'
                    }}
                  >
                    {passStrength < 40
                      ? (isBn ? 'দুর্বল পাসওয়ার্ড' : 'Weak Password')
                      : passStrength < 75
                      ? (isBn ? 'মাঝারি পাসওয়ার্ড' : 'Medium Strength')
                      : (isBn ? 'অত্যন্ত শক্তিশালী পাসওয়ার্ড ✓' : 'Strong Password ✓')}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="admin-form-group">
              <label className="admin-label">{isBn ? 'নতুন পাসওয়ার্ড নিশ্চিতকরণ *' : 'Confirm New Password *'}</label>
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                className="admin-input"
                style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
                placeholder="********"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isSaving}
              className="admin-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                fontWeight: 800
              }}
            >
              <Lock size={17} />
              <span>{isSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'নতুন পাসওয়ার্ড সেভ করুন' : 'Update Password')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
