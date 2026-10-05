import React, { useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { updateSEO } from '../services/seoService';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Search,
  AlertTriangle,
  ChevronRight,
  Users,
  Eye,
  HeartHandshake,
  Bot
} from 'lucide-react';

export default function EditorialPolicyPage() {
  const { language, settings, goToHome } = useNews();
  const isBn = language === 'bn';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateSEO({
      title: isBn ? 'সম্পাদকীয় ও নৈতিকতা নীতি — সত্যতা যাচাই ও সাংবাদিকতার মানদণ্ড' : 'Editorial Policy & Code of Ethics — Journalism Standards',
      description: isBn
        ? 'জনগণ.নিউজ (Jonogon News)-এর সম্পাদকীয় নীতি, ফ্যাক্ট-চেকিং প্রটোকল, সূত্র সুরক্ষা, সংশোধন নীতি ও পেশাদার সাংবাদিকতার আচরণবিধি।'
        : 'Editorial guidelines, verification procedures, corrections policy, and journalistic ethics at Jonogon News.',
      url: `${window.location.origin}/editorial-policy`,
      type: 'website'
    });
  }, [isBn]);

  return (
    <div className="standalone-page-container" style={{ padding: '24px 0 60px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={goToHome} className="breadcrumb-link">
            {isBn ? 'প্রচ্ছদ' : 'Home'}
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{isBn ? 'সম্পাদকীয় নীতি' : 'Editorial Policy'}</span>
        </nav>

        {/* Hero Header */}
        <header className="page-hero-header">
          <div className="page-hero-badge">
            <Scale size={16} />
            <span>{isBn ? 'সাংবাদিকতার মানদণ্ড ও আচরণবিধি' : 'Journalistic Standards & Code of Ethics'}</span>
          </div>
          <h1 className="page-main-title">
            {isBn ? 'সম্পাদকীয় নীতি ও নৈতিকতার নির্দেশিকা' : 'Editorial Policy & Ethical Guidelines'}
          </h1>
          <p className="page-subtitle">
            {isBn
              ? 'প্রথম আলো, বিডিনিউজ২৪, কালবেলা ও টাইমস্টুডে বিডি-র মতো শীর্ষ জাতীয় গণমাধ্যমের সেরা চর্চা এবং আন্তর্জাতিক সাংবাদিকতার মানদণ্ডে প্রণীত আমাদের সম্পাদকীয় নির্দেশিকা।'
              : 'Our editorial charter inspired by Bangladesh’s foremost news organisations and global journalistic integrity frameworks.'}
          </p>
        </header>

        {/* Content Layout */}
        <div className="page-content-layout">
          <div className="page-main-body">
            {/* Admin Live Editorial Statement (if edited from Admin Panel) */}
            {settings.editorialPolicy && (
              <div
                style={{
                  backgroundColor: 'rgba(230, 0, 18, 0.05)',
                  border: '1px solid rgba(230, 0, 18, 0.2)',
                  borderLeft: '5px solid var(--primary-red)',
                  padding: '18px 22px',
                  borderRadius: 6,
                  marginBottom: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--primary-red)', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  <span>{isBn ? 'সম্পাদকীয় পর্ষদের বিশেষ ঘোষণা (Admin Live Policy)' : 'Editorial Board Policy Notice'}</span>
                </div>
                <p style={{ whiteSpace: 'pre-line', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--text-main)' }}>
                  {settings.editorialPolicy}
                </p>
              </div>
            )}

            {/* Clause 1: Truth & Independence */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '১. নিরপেক্ষতা, স্বাধীনতা ও বস্তুনিষ্ঠতার অঙ্গীকার' : '1. Independence, Impartiality & Truth'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনগণ.নিউজ (Jonogon News) কোনো রাজনৈতিক দল, বাণিজ্যিক গোষ্ঠী বা প্রভাবশালী মহলের মুখপত্র নয়। আমাদের একমাত্র দায়বদ্ধতা সাধারণ জনগণের প্রতি। সকল সংবাদ পরিবেশনে পক্ষপাতহীনতা, নিরপেক্ষ ভারসাম্য এবং বস্তুনিষ্ঠ তথ্য উপস্থাপনে আমাদের সম্পাদকীয় টিম শতভাগ দায়বদ্ধ।'
                  : 'Jonogon News maintains strict editorial independence from political parties, commercial interest groups, and pressure organisations. Our reporting is bound strictly to the public interest and factual balance.'}
              </p>
            </section>

            {/* Clause 2: Fact-Checking Protocol */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '২. দ্বৈত-উৎস যাচাইকরণ ও ফ্যাক্ট-চেকিং প্রটোকল (Fact-Checking)' : '2. Dual-Source Verification & Fact-Checking'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'প্রতিটি সংবাদ, ব্রেকিং নিউজ এবং বিশেষ অনুসন্ধানী প্রতিবেদন প্রকাশের পূর্বে কমপক্ষে দুটি স্বাধীন ও বিশ্বাসযোগ্য উৎস থেকে যাচাই করা বাধ্যতামূলক। সোশ্যাল মিডিয়ার ভাইরাল বক্তব্য, অপপ্রচার বা অসমর্থিত দাবিকে সত্য হিসেবে কখনোই প্রচার করা হয় না।'
                  : 'Every report undergoes multi-layered fact verification across independent primary sources. Unsubstantiated claims, rumours, or unverified social media chatter are never published without verification.'}
              </p>
            </section>

            {/* Clause 3: Protection of Sources */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৩. গোপন সূত্রের নিরাপত্তা ও সুরক্ষা' : '3. Protection of Confidential Sources & Whistleblowers'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'জনস্বার্থে যেসব সংবেদনশীল তথ্য বা নথি প্রকাশিত হয়, সেক্ষেত্রে হুইসেলব্লোয়ার ও গোপন সূত্রের পরিচয় গোপন রাখা আন্তর্জাতিক সাংবাদিকতা আইন অনুযায়ী আমাদের পবিত্র কর্তব্য। কোনো চাপের মুখেও সূত্রের নিরাপত্তা বিঘ্নিত করা হয় না।'
                  : 'We strictly protect the confidentiality of whistleblowers and confidential news sources under international press freedom principles.'}
              </p>
            </section>

            {/* Clause 4: Transparent Corrections */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৪. দ্রুত ও স্বচ্ছ ভুল সংশোধন নীতি (Corrections & Updates)' : '4. Corrections & Transparent Retractions'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'অনিচ্ছাকৃত কোনো তথ্যে ভুল বা ভ্রান্তি পরিলক্ষিত হলে জনগণ.নিউজ তা স্পষ্টভাবে স্বীকার করে অবিলম্বে সংশোধনী প্রকাশ করে। সংশ্লিষ্ট সংবাদের নিচে সংশোধনের সময় এবং বিস্তারিত বিবরণ উল্লেখ করা হয়।'
                  : 'When factual errors occur, we correct them transparently and without delay. A clear editor’s note detailing the update is appended directly to the article.'}
              </p>
            </section>

            {/* Clause 5: Protection of Children, Women & Victims */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৫. নারী, শিশু ও অপরাধের শিকার ব্যক্তিদের সুরক্ষা' : '5. Safeguarding Minors, Women & Crime Victims'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'যৌন নিপীড়ন, পারিবারিক সহিংসতা বা অপরাধের শিকার নারী ও অপ্রাপ্তবয়স্ক শিশুদের নাম, ছবি বা পরিচয় শনাক্তকারী কোনো তথ্য প্রকাশ করা সম্পূর্ণ নিষিদ্ধ। স্পর্শকাতর ও মর্মান্তিক দুর্ঘটনার ছবি প্রকাশের ক্ষেত্রে ব্লার বা সতর্কতামূলক ফিল্টার ব্যবহার করা হয়।'
                  : 'The identity, photos, and personal information of juvenile minors, sexual abuse victims, and vulnerable individuals are strictly withheld in accordance with national and international child protection laws.'}
              </p>
            </section>

            {/* Clause 6: AI & Generative Media Policy */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৬. কৃত্রিম বুদ্ধিমত্তা (AI) ও প্রযুক্তির দায়িত্বশীল ব্যবহার' : '6. Artificial Intelligence (AI) & Generative Media Policy'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'সংবাদ তৈরিতে ডিপফেক, বিভ্রান্তিকর জেনারেটিভ এআই ছবি বা অডিওর অপব্যবহার সম্পূর্ণ নিষিদ্ধ। কোনো গ্রাফিক্স বা চিত্রায়ণে এআই সহায়তা নেওয়া হলে তা স্পষ্টভাবে ‘চিত্রায়ণ / এআই গ্রাফিক্স’ হিসেবে ডিসক্লেমার প্রদান করা হয়।'
                  : 'Deepfakes and misleading generative imagery are strictly barred. Any illustrative graphics created with AI assistance are explicitly tagged with reader disclaimers.'}
              </p>
            </section>

            {/* Clause 7: Conflict of Interest & Gifts */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৭. উপহার, বিজ্ঞাপন ও স্বার্থের সংঘাত পরিহার' : '7. Conflict of Interest & Sponsored Content Separation'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'সম্পাদকীয় স্বাধীনতায় বিজ্ঞাপন বিভাগ বা স্পন্সরদের কোনো হস্তক্ষেপ গ্রহণ করা হয় না। বাণিজ্যিক বা স্পন্সরড কনটেন্টকে সাধারণ সংবাদের চেয়ে আলাদা করতে ‘বিজ্ঞাপন / স্পন্সরড’ লেবেল সুস্পষ্টভাবে প্রদর্শন করা হয়।'
                  : 'Editorial decision-making is strictly separate from advertising revenue. All sponsored, native, or advertorial content is clearly labeled to prevent reader confusion.'}
              </p>
            </section>

            {/* Clause 8: Op-Eds and Reader Contributions */}
            <section className="page-section-block">
              <h2 className="section-subheading">
                <span className="bullet-accent"></span>
                {isBn ? '৮. মতামত ও পাঠক কলাম প্রকাশের শর্ত' : '8. Opinion, Op-Eds & Guest Contributions'}
              </h2>
              <p className="page-paragraph">
                {isBn
                  ? 'উপ-সম্পাদকীয় বা মতামত কলামে প্রকাশিত দৃষ্টিভঙ্গি সংশ্লিষ্ট লেখকের নিজস্ব। তবে কোনো লেখা যাতে সাম্প্রদায়িক উস্কানি, ঘৃণাত্মক বক্তব্য বা রাষ্ট্রবিরোধী কুৎসা প্রচার না করে, তা নিশ্চিত করতে সম্পাদনা পর্ষদ পর্যবেক্ষণ করে।'
                  : 'Opinions expressed in columns and op-eds belong to the respective authors. However, our editorial desk ensures all published submissions remain free from defamatory or hate speech.'}
              </p>
            </section>
          </div>

          <aside className="page-sidebar-col">
            <div className="page-info-card">
              <h3>{isBn ? 'সম্পাদকীয় ও অভিযোগ ডেস্ক' : 'Editorial & Fact-Check Desk'}</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {isBn
                  ? 'আমাদের প্রকাশিত যেকোনো সংবাদে কোনো ভুল, অসংগতি বা তথ্য বিভ্রাট পরিলক্ষিত হলে সরাসরি আমাদের ফ্যাক্ট-চেক টিমের সাথে যোগাযোগ করুন:'
                  : 'If you spot an inaccuracy or wish to request an editorial correction, please contact our fact-checking team:'}
              </p>
              <div style={{ marginTop: 14 }}>
                <a href={`mailto:${settings.email || 'brandbiplob1234@gmail.com'}`} className="contact-link-val">
                  {settings.email || 'brandbiplob1234@gmail.com'}
                </a>
              </div>
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isBn ? 'হটলাইন:' : 'Hotline:'} <strong>{settings.phone || '01936618534'}</strong>
              </div>
            </div>

            <div className="page-info-card">
              <h3>{isBn ? 'সাংবাদিকতার ৪টি স্তম্ভ' : '4 Pillars of Integrity'}</h3>
              <ul className="info-bullet-list">
                <li><CheckCircle2 size={15} color="#16A34A" /> <span>{isBn ? 'সত্যনিষ্ঠ ও পক্ষপাতহীন রিপোর্টিং' : 'Truthful & Unbiased Reporting'}</span></li>
                <li><CheckCircle2 size={15} color="#16A34A" /> <span>{isBn ? 'স্বচ্ছ দ্বৈত-উৎস যাচাই' : 'Dual-source Verification'}</span></li>
                <li><CheckCircle2 size={15} color="#16A34A" /> <span>{isBn ? 'ভুল হলে দ্রুত ও সৎ সংশোধন' : 'Honest Corrections'}</span></li>
                <li><CheckCircle2 size={15} color="#16A34A" /> <span>{isBn ? 'জনগণের স্বার্থে অবিচল সাহস' : 'Fearless Public Interest Focus'}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
