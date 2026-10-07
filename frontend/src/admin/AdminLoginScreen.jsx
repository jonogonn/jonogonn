import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Check } from 'lucide-react';

export default function AdminLoginScreen({ onLoginSuccess, isBn = true }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      // Valid credentials: (admin / jonogon2026) or (admin@jonogon.news / admin1234)
      if (
        (cleanUser === 'admin' || cleanUser === 'admin@jonogon.news' || cleanUser === 'jonogon') &&
        (cleanPass === 'jonogon2026' || cleanPass === 'admin1234' || cleanPass === 'admin')
      ) {
        if (rememberMe) {
          localStorage.setItem('jonogon_admin_logged_in', 'true');
          localStorage.setItem('jonogon_admin_user', cleanUser);
        } else {
          sessionStorage.setItem('jonogon_admin_logged_in', 'true');
        }
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg(
          isBn
            ? 'ভুল আইডি বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।'
            : 'Invalid Username or Password! Please check and try again.'
        );
      }
    }, 400);
  };

  return (
    <div
      className="admin-login-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0C0E14',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(230,0,18,0.18) 0%, #0C0E14 70%)',
        padding: 20,
        fontFamily: 'var(--font-body, sans-serif)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#161922',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(230, 0, 18, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Glow Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #E50914, #FF5E62, #E50914)'
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: 'rgba(230, 0, 18, 0.1)',
              border: '1px solid rgba(230, 0, 18, 0.3)',
              marginBottom: 14
            }}
          >
            <img src="/logo.svg" alt="Jonogon Logo" style={{ height: 38, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <ShieldCheck size={34} color="#E50914" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-headline, sans-serif)',
              fontSize: '1.45rem',
              fontWeight: 900,
              color: '#FFFFFF',
              marginBottom: 6
            }}
          >
            {isBn ? 'জনগণ অ্যাডমিন লগইন' : 'Jonogon Admin Access'}
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.84rem' }}>
            {isBn ? 'নিউজ পোর্টাল পরিচালনার জন্য আপনার অ্যাকাউন্টে লগইন করুন' : 'Sign in to access the news administration portal'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: 18,
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* User ID Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#D1D5DB',
                marginBottom: 6
              }}
            >
              {isBn ? 'ব্যবহারকারী আইডি / ইউজারনেম' : 'Username / Email ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                required
                className="admin-input"
                style={{
                  paddingLeft: 38,
                  height: 42,
                  backgroundColor: '#0F1117',
                  border: '1px solid #2B2F3A',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: '0.9rem'
                }}
                placeholder={isBn ? 'ইউজারনেম লিখুন (যেমন: admin)' : 'Enter username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#D1D5DB',
                marginBottom: 6
              }}
            >
              {isBn ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#9CA3AF"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="admin-input"
                style={{
                  paddingLeft: 38,
                  paddingRight: 38,
                  height: 42,
                  backgroundColor: '#0F1117',
                  border: '1px solid #2B2F3A',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: '0.9rem'
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
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#9CA3AF', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#E50914' }}
              />
              <span>{isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: 46,
              backgroundColor: '#E50914',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 16px rgba(229, 9, 20, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            <span>{isLoading ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : (isBn ? 'লগইন করুন' : 'Sign In')}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
