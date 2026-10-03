import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterRibbon() {
  const { language } = useNews();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const isBn = language === 'bn';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <section className="newsletter-ribbon">
      <div className="container newsletter-content">
        <div className="newsletter-title-wrap">
          <Mail size={24} />
          <span>
            {isBn
              ? 'সর্বশেষ খবর পেতে আমাদের নিউজলেটার সাবস্ক্রাইব করুন'
              : 'Subscribe to our newsletter for instant news alerts'}
          </span>
        </div>

        {subscribed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--white)', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>
              {isBn
                ? 'ধন্যবাদ! আপনার সাবস্ক্রিপশন সফল হয়েছে।'
                : 'Thank you! You have successfully subscribed.'}
            </span>
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder={isBn ? 'আপনার ইমেইল লিখুন' : 'Enter your email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn">
              {isBn ? 'সাবস্ক্রাইব' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
