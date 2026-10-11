import React, { useState } from 'react';
import { supabase } from '../supabase';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminLoginScreen({ onLoginSuccess, isBn = true }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [unconfirmedWarning, setUnconfirmedWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUnconfirmedWarning(false);
    setIsLoading(true);

    const cleanInput = identifier.trim();
    const cleanPass = password.trim();

    try {
      // 1. OFFLINE / SUPERADMIN DIRECT FALLBACK
      // Ensures publisher & root admin can never be locked out
      const isSuperAdminUser =
        cleanInput.toLowerCase() === 'admin' ||
        cleanInput.toLowerCase() === 'admin@jonogon.news' ||
        cleanInput.toLowerCase() === 'jonogon' ||
        cleanInput.toLowerCase() === 'biplob.admin';
      const isSuperAdminPass =
        cleanPass === 'jonogon2026' ||
        cleanPass === 'admin1234' ||
        cleanPass === 'admin' ||
        cleanPass === 'Biplob@Jonogon2026';

      if (isSuperAdminUser && isSuperAdminPass) {
        if (rememberMe) {
          localStorage.setItem('jonogon_admin_logged_in', 'true');
          localStorage.setItem('jonogon_admin_user', cleanInput);
          localStorage.setItem(
            'jonogon_current_member',
            JSON.stringify({
              name: 'মোঃ বিপ্লব হোসেন',
              role: 'Super Admin',
              username: cleanInput,
              designation: 'প্রধান সম্পাদক ও প্রকাশক'
            })
          );
        } else {
          sessionStorage.setItem('jonogon_admin_logged_in', 'true');
        }
        setLoginSuccess(true);
        setTimeout(() => onLoginSuccess(), 350);
        return;
      }

      // 2. RESOLVE TARGET EMAIL FOR SUPABASE AUTHENTICATION
      let targetEmail = '';
      let memberProfile = null;

      if (cleanInput.includes('@')) {
        // Direct email provided
        targetEmail = cleanInput.toLowerCase();
      } else {
        // Username or User ID (e.g., 'tye' or 'JNG-1002') provided
        // Step A: Search in Supabase admin_users table
        try {
          const { data: dbUser, error: dbErr } = await supabase
            .from('admin_users')
            .select('*')
            .or(`username.ilike.${cleanInput},user_code.ilike.${cleanInput}`)
            .maybeSingle();

          if (dbUser && dbUser.email) {
            targetEmail = dbUser.email;
            memberProfile = dbUser;
          }
        } catch (queryErr) {
          console.warn('Supabase table query fallback:', queryErr);
        }

        // Step B: Fallback search in cached local members if DB query was restricted
        if (!targetEmail) {
          try {
            const cached = JSON.parse(localStorage.getItem('jonogon_access_members') || '[]');
            const matched = cached.find(
              (m) =>
                (m.username && m.username.toLowerCase() === cleanInput.toLowerCase()) ||
                (m.user_code && m.user_code.toLowerCase() === cleanInput.toLowerCase())
            );
            if (matched && matched.email) {
              targetEmail = matched.email;
              memberProfile = matched;
            }
          } catch (cacheErr) {}
        }
      }

      // If no email could be resolved from username
      if (!targetEmail) {
        setIsLoading(false);
        setErrorMsg(
          isBn
            ? 'এই ইউজারনেম বা আইডি দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক ইউজার আইডি বা নিবন্ধিত ইমেইল লিখুন।'
            : 'No user account found with this Username or ID. Please check and try again.'
        );
        return;
      }

      // 3. AUTHENTICATE WITH SUPABASE AUTH
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: cleanPass
      });

      if (authError) {
        setIsLoading(false);

        // Check if user account email is unconfirmed
        if (
          authError.message.toLowerCase().includes('email not confirmed') ||
          authError.status === 400 && authError.message.toLowerCase().includes('confirmed')
        ) {
          setUnconfirmedWarning(true);
          setErrorMsg(
            isBn
              ? 'আপনার ইমেইল ভেরিফিকেশন এখনও সম্পন্ন হয়নি! আপনার ইনবক্সে Supabase Auth থেকে পাঠানো "Confirm your email address" লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় (Activate) করুন।'
              : 'Email address not yet confirmed! Please click the confirmation link in your email to activate your account.'
          );
          return;
        }

        // Invalid password
        if (
          authError.message.toLowerCase().includes('invalid login credentials') ||
          authError.message.toLowerCase().includes('invalid grant')
        ) {
          setErrorMsg(
            isBn
              ? 'ভুল পাসওয়ার্ড! অনুগ্রহ করে আপনার ইমেইলে পাওয়া সঠিক পাসওয়ার্ড প্রদান করুন।'
              : 'Invalid password. Please check credentials from your welcome email.'
          );
          return;
        }

        // Other generic auth errors
        setErrorMsg(authError.message || (isBn ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
        return;
      }

      // 4. LOGIN SUCCESS VIA SUPABASE!
      if (authData?.user) {
        const userMeta = authData.user.user_metadata || {};
        const activeProfile = memberProfile || {
          name: userMeta.name || targetEmail.split('@')[0],
          username: userMeta.username || targetEmail.split('@')[0],
          user_code: userMeta.user_code || 'JNG-USER',
          role: userMeta.role || 'Reporter',
          designation: userMeta.designation || 'টিম সদস্য',
          allowed_tabs: userMeta.allowed_tabs || ['overview', 'create-post', 'edit-post', 'gallery'],
          email: targetEmail
        };

        if (rememberMe) {
          localStorage.setItem('jonogon_admin_logged_in', 'true');
          localStorage.setItem('jonogon_admin_user', targetEmail);
          localStorage.setItem('jonogon_current_member', JSON.stringify(activeProfile));
        } else {
          sessionStorage.setItem('jonogon_admin_logged_in', 'true');
          sessionStorage.setItem('jonogon_current_member', JSON.stringify(activeProfile));
        }

        setLoginSuccess(true);
        setTimeout(() => onLoginSuccess(), 350);
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Login exception:', err);
      setErrorMsg(
        isBn
          ? 'সার্ভারে সংযোগে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করে পুনরায় চেষ্টা করুন।'
          : 'Server connection error. Please try again.'
      );
    }
  };

  const handleBackToHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname.includes('/janogon') ? '/janogon/' : '/';
    }
  };

  return (
    <div
      className="admin-login-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#07090E',
        backgroundImage:
          'radial-gradient(circle at 50% 15%, rgba(230,0,18,0.22) 0%, rgba(7,9,14,0.95) 60%, #07090E 100%)',
        padding: '24px 16px',
        fontFamily: 'var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif)',
        position: 'relative'
      }}
    >
      {/* Background Decorative Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          opacity: 0.6
        }}
      />

      {/* Login Modal Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 450,
          backgroundColor: '#0F121C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 20,
          padding: '38px 32px 30px 32px',
          boxShadow:
            '0 30px 70px rgba(0, 0, 0, 0.75), 0 0 50px rgba(230, 0, 18, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Top Crimson Light Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #E60012 0%, #FF4D5A 50%, #E60012 100%)',
            boxShadow: '0 0 16px #E60012'
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 68,
              height: 68,
              borderRadius: 18,
              backgroundColor: 'rgba(230, 0, 18, 0.1)',
              border: '1px solid rgba(230, 0, 18, 0.3)',
              marginBottom: 14,
              boxShadow: '0 8px 24px rgba(230, 0, 18, 0.2)'
            }}
          >
            <ShieldCheck size={36} color="#E60012" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline, sans-serif)',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
              marginBottom: 6
            }}
          >
            {isBn ? 'জনগণ অ্যাডমিন লগইন' : 'Jonogon Admin Access'}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
            {isBn
              ? 'ডিজিটাল পোর্টাল পরিচালনার জন্য আপনার অ্যাকাউন্টে লগইন করুন'
              : 'Sign in to access editorial & management tools'}
          </p>
        </div>

        {/* Warning / Confirmation Notice Banner */}
        {unconfirmedWarning && (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#FBBF24',
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              lineHeight: 1.5
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#F59E0B' }} />
            <div>
              <strong>{isBn ? 'আইডি সক্রিয়করণ প্রয়োজন:' : 'Activation Required:'}</strong>{' '}
              {errorMsg}
            </div>
          </div>
        )}

        {/* Generic Error Alert */}
        {errorMsg && !unconfirmedWarning && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '11px 14px',
              borderRadius: 10,
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 18,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              lineHeight: 1.5
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1, color: '#EF4444' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* User ID / Username / Email Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#E2E8F0',
                marginBottom: 7
              }}
            >
              <span>{isBn ? 'ব্যবহারকারী আইডি / ইউজারনেম / ইমেইল' : 'User ID / Username / Email'}</span>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                {isBn ? 'কেস-ইনসেনসিটিভ' : 'Case-insensitive'}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="#64748B"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                required
                autoComplete="username"
                className="admin-input"
                style={{
                  paddingLeft: 40,
                  height: 44,
                  backgroundColor: '#090B11',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder={isBn ? 'যেমন: tye বা biplob.admin বা ইমেইল' : 'e.g. tye or admin@jonogon.news'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#E2E8F0',
                marginBottom: 7
              }}
            >
              <span>{isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#64748B"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="admin-input"
                style={{
                  paddingLeft: 40,
                  paddingRight: 42,
                  height: 44,
                  backgroundColor: '#090B11',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  fontSize: '0.9rem',
                  width: '100%',
                  boxSizing: 'border-box',
                  outline: 'none',
                  letterSpacing: showPassword ? 'normal' : '1px'
                }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Tip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.82rem',
                color: '#94A3B8',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#E60012', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span>{isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
            </label>

            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              {isBn ? 'ক্লাউড সিকিউর এক্সেস' : 'Cloud Secure'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            style={{
              width: '100%',
              height: 48,
              background: loginSuccess
                ? '#10B981'
                : 'linear-gradient(135deg, #E60012 0%, #B3000E 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: '0.96rem',
              cursor: isLoading || loginSuccess ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              boxShadow: loginSuccess
                ? '0 6px 20px rgba(16, 185, 129, 0.4)'
                : '0 6px 22px rgba(230, 0, 18, 0.4)',
              transition: 'all 0.25s',
              opacity: isLoading ? 0.75 : 1
            }}
          >
            {loginSuccess ? (
              <>
                <CheckCircle size={18} />
                <span>{isBn ? 'লগইন সফল! প্রবেশ করা হচ্ছে...' : 'Login Success! Entering...'}</span>
              </>
            ) : isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying Credentials...'}</span>
              </>
            ) : (
              <>
                <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Return to Homepage Link */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <button
            type="button"
            onClick={handleBackToHome}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            <ArrowLeft size={14} />
            <span>{isBn ? 'মূল নিউজ পোর্টালে ফিরে যান' : 'Return to main news portal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
