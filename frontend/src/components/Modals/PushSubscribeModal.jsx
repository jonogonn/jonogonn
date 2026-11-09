import React, { useState, useEffect, useRef } from 'react';
import { useNews } from '../../context/NewsContext';
import { Bell, CheckCircle2, ShieldCheck, Zap, ArrowUpLeft, Loader2 } from 'lucide-react';

export default function PushSubscribeModal() {
  const { language, isAdminOpen } = useNews();
  const isBn = language === 'bn';

  const [isVisible, setIsVisible] = useState(false);
  const [isAwaitingBrowser, setIsAwaitingBrowser] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    // Avoid showing inside admin dashboard or during admin operations
    if (isAdminOpen) return;
    if (typeof window === 'undefined') return;

    // If permission is already granted, clean up and do not show
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        localStorage.setItem('jonogon_push_subscribed', 'true');
      } catch (e) { }
      return;
    }

    // If permission is not granted, ensure premature localStorage flag is cleared
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        localStorage.removeItem('jonogon_push_subscribed');
      }
    } catch (e) { }

    // Check if postponed in this session
    try {
      const postponedSession = sessionStorage.getItem('jonogon_push_postponed');
      if (postponedSession) return;
    } catch (e) { }

    // Trigger popup 5 seconds after page loads
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        return;
      }
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAdminOpen]);

  // Continuously listen/poll for native permission resolution while modal is active
  useEffect(() => {
    if (!isVisible) return;

    pollingRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          clearInterval(pollingRef.current);
          setIsSuccess(true);
          try {
            localStorage.setItem('jonogon_push_subscribed', 'true');
          } catch (e) { }

          setTimeout(() => {
            setIsVisible(false);
          }, 1200);
        } else if (Notification.permission === 'denied' && isAwaitingBrowser) {
          clearInterval(pollingRef.current);
          try {
            sessionStorage.setItem('jonogon_push_postponed', 'true');
          } catch (e) { }

          setTimeout(() => {
            setIsVisible(false);
          }, 800);
        }
      }
    }, 400);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isVisible, isAwaitingBrowser]);

  // Handle subscribe action: triggers browser permission and keeps backdrop blur intact
  const handleSubscribe = async () => {
    setIsAwaitingBrowser(true);

    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (err) {
            console.warn('OneSignal requestPermission error:', err);
          }
        });
      } else if ('Notification' in window) {
        await Notification.requestPermission();
      }
    } catch (err) {
      console.warn('Notification prompt error:', err);
    }
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
        {/* If user successfully granted permission */}
        {isSuccess ? (
          <div className="push-subscribe-success-box">
            <div className="push-subscribe-icon-wrap success-icon-wrap">
              <CheckCircle2 size={36} color="#FFFFFF" />
            </div>
            <h2 className="push-subscribe-title" style={{ color: '#16A34A' }}>
              {isBn ? 'ধন্যবাদ! নোটিফিকেশন চালু হয়েছে' : 'Thank You! Notifications Enabled'}
            </h2>
            <p className="push-subscribe-desc">
              {isBn
                ? 'এখন থেকে দেশ-বিদেশের ব্রেকিং নিউজ সবার আগে আপনার ডিভাইসে চলে আসবে।'
                : 'You will now receive timely breaking news updates and critical alerts directly.'}
            </p>
          </div>
        ) : isAwaitingBrowser ? (
          /* When waiting for user to click Allow in native browser prompt */
          <div className="push-subscribe-awaiting-box">
            <div className="push-subscribe-guide-pointer">
              <ArrowUpLeft size={38} className="pulse-arrow-icon" color="#E60012" />
            </div>

            <div className="push-subscribe-icon-wrap" style={{ margin: '10px 0 16px' }}>
              <Loader2 size={30} color="#FFFFFF" className="spin-loader-icon" />
            </div>

            <h2 className="push-subscribe-title">
              {isBn
                ? "ব্রাউজারের উপরে 'Allow' বাটনে ক্লিক করুন"
                : "Click 'Allow' in your browser above"}
            </h2>

            <p className="push-subscribe-desc">
              {isBn
                ? "আপনার ব্রাউজারের ঠিক উপরে বাম কোণে 'Show notifications' বক্সে 'Allow' বাটনে ক্লিক করে অনুমোদন করুন। অনুমোদনের সাথে সাথে পেজটি আনলক হয়ে যাবে।"
                : "Please click 'Allow' in the browser prompt located at the top-left corner to confirm and unlock the page."}
            </p>

            <button
              type="button"
              onClick={handleSubscribe}
              className="push-subscribe-btn-primary"
              style={{ marginTop: 8 }}
            >
              <Bell size={18} />
              <span>{isBn ? "পুনরায় 'Allow' বক্স আনুন" : 'Prompt Again'}</span>
            </button>
          </div>
        ) : (
          /* Default initial modal state */
          <>
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

            {/* Secondary Action Button - Also triggers subscription */}
            <button
              type="button"
              onClick={handleSubscribe}
              className="push-subscribe-btn-later"
            >
              {isBn ? 'পরে মনে করিয়ে দিন' : 'Remind Me Later'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

