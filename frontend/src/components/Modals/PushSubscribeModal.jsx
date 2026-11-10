import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { Bell, CheckCircle2, ShieldCheck, Zap, X } from 'lucide-react';

export default function PushSubscribeModal() {
  const { language, isAdminOpen } = useNews();
  const isBn = language === 'bn';

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Avoid showing inside admin dashboard or during admin operations
    if (isAdminOpen) return;
    if (typeof window === 'undefined') return;

    // If permission is already granted in the browser, mark as subscribed and do not prompt
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        localStorage.setItem('jonogon_push_subscribed', 'true');
      } catch (e) { }
      return;
    }

    // Check if user already subscribed
    try {
      const alreadySubscribed = localStorage.getItem('jonogon_push_subscribed');
      if (alreadySubscribed === 'true') {
        return;
      }
    } catch (e) { }

    // Check if postponed during current browsing session
    try {
      const postponedSession = sessionStorage.getItem('jonogon_push_postponed');
      if (postponedSession === 'true') {
        return;
      }
    } catch (e) { }

    // Trigger popup exactly 5 seconds after page loads
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        return;
      }
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAdminOpen]);

  // Handle subscribe action: triggers OneSignal/browser permission and immediately dismisses modal
  const handleSubscribe = () => {
    // Trigger browser permission prompt via OneSignal SDK
    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (err) {
            console.warn('OneSignal requestPermission error:', err);
          }
        });
      } else if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        Notification.requestPermission().catch(() => { });
      }
    } catch (err) {
      console.warn('Notification prompt error:', err);
    }

    // Persist subscription intent so popup does not harass the user repeatedly
    try {
      localStorage.setItem('jonogon_push_subscribed', 'true');
    } catch (e) { }

    // Close modal immediately so the native browser prompt (top on PC, bottom on mobile) is 100% visible and unblocked
    setIsVisible(false);
  };

  // Handle "Remind Me Later" / Dismiss
  const handleLater = () => {
    // Trigger notification permission request in background without locking screen
    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (err) { }
        });
      } else if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        Notification.requestPermission().catch(() => { });
      }
    } catch (e) { }

    try {
      sessionStorage.setItem('jonogon_push_postponed', 'true');
    } catch (e) { }

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="push-subscribe-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="push-modal-title"
    >
      <div className="push-subscribe-card">
        {/* Top-Right Quick Dismiss Button */}
        <button
          type="button"
          onClick={handleLater}
          className="push-subscribe-close-btn"
          aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
        >
          <X size={18} />
        </button>

        {/* Pulsing Bell Icon Badge */}
        <div className="push-subscribe-icon-wrap">
          <Bell size={32} color="#FFFFFF" className="pulse-clock-icon" />
        </div>

        {/* Modal Headline */}
        <h2 id="push-modal-title" className="push-subscribe-title">
          {isBn
            ? 'ব্রেকিং নিউজের নোটিফিকেশন চালু করুন'
            : 'Enable Breaking News Alerts'}
        </h2>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleSubscribe}
          className="push-subscribe-btn-primary"
        >
          <Bell size={18} />
          <span>{isBn ? 'নোটিফিকেশন চালু করুন' : 'Allow Notifications'}</span>
        </button>

        {/* Secondary Action Button */}
        <button
          type="button"
          onClick={handleLater}
          className="push-subscribe-btn-later"
        >
          {isBn ? 'পরে মনে করিয়ে দিন' : 'Remind Me Later'}
        </button>
      </div>
    </div>
  );
}
