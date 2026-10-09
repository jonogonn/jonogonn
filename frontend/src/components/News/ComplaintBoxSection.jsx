import React, { useState } from 'react';
import { useNews } from '../../context/NewsContext';
import {
  Play,
  Volume2,
  Settings,
  Maximize,
  Tv,
  X,
  ShieldCheck,
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Send,
  Lock
} from 'lucide-react';
import { bangladeshDistricts } from '../../data/initialData';

export default function ComplaintBoxSection() {
  const { language, settings } = useNews();
  const isBn = language === 'bn';

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isOpeningPaper, setIsOpeningPaper] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'corruption',
    district: 'dhaka',
    name: '',
    phone: '',
    description: '',
    isAnonymous: true,
    file: null
  });

  const [fileName, setFileName] = useState('');

  const categories = [
    { id: 'corruption', nameBn: 'দুর্নীতি ও অনিয়ম', nameEn: 'Corruption & Irregularities' },
    { id: 'public_service', nameBn: 'নাগরিক সেবা ও ভোগান্তি', nameEn: 'Public Service Issues' },
    { id: 'health', nameBn: 'স্বাস্থ্য ও চিকিৎসা সেবা', nameEn: 'Healthcare & Hospital' },
    { id: 'education', nameBn: 'শিক্ষা ও শিক্ষাপ্রতিষ্ঠান', nameEn: 'Education & Institutions' },
    { id: 'road_transport', nameBn: 'সড়ক ও যোগাযোগ ব্যবস্থা', nameEn: 'Roads & Transport' },
    { id: 'crime_fraud', nameBn: 'প্রতারণা ও সামাজিক অপরাধ', nameEn: 'Fraud & Crime' },
    { id: 'other', nameBn: 'অন্যান্য অভিযোগ', nameEn: 'Other Issues' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const handleOpenModal = () => {
    setIsOpeningPaper(true);
    setTimeout(() => {
      setIsFormModalOpen(true);
      setIsOpeningPaper(false);
    }, 240);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const newTrackingId = `JONOGON-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingId(newTrackingId);

    // Save to local storage
    const existing = JSON.parse(localStorage.getItem('jonogon_complaints') || '[]');
    const newComplaint = {
      id: newTrackingId,
      ...formData,
      fileName: fileName,
      file: undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    try {
      localStorage.setItem('jonogon_complaints', JSON.stringify([newComplaint, ...existing]));
    } catch (e) {}

    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'corruption',
      district: 'dhaka',
      name: '',
      phone: '',
      description: '',
      isAnonymous: true,
      file: null
    });
    setFileName('');
    setIsSubmitted(false);
  };

  const closeFormModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsFormModalOpen(false);
      setIsClosingModal(false);
      resetForm();
    }, 220);
  };

  return (
    <section className="complaint-box-section">
      <div className="container">
        {/* Section Header */}
        <div className="complaint-section-header">
          <div className="complaint-title-wrap">
            <span className="complaint-accent-bar"></span>
            <h2 className="complaint-section-title">
              {isBn ? (
                <>
                  অভিযোগ <span className="text-red">বক্স</span>
                </>
              ) : (
                <>
                  Complaint <span className="text-red">Box</span>
                </>
              )}
            </h2>
          </div>

          <div className="complaint-header-subtitle">
            <p>{isBn ? 'আপনার অভিযোগ আমাদের জানান,' : 'Share your grievance with us,'}</p>
            <p>{isBn ? 'সুস্থ সমাজ গঠনে আপনার অংশগ্রহণ গুরুত্বপূর্ণ।' : 'Your voice is crucial in building a better society.'}</p>
          </div>
        </div>

        {/* Master Card Layout: Video (Left) | Complaint Box & CTA (Right) */}
        <div className="complaint-main-card">
          {/* Left Column: Video Player */}
          <div className="complaint-video-col">
            <div
              className="complaint-video-player-wrap"
              onClick={() => setIsVideoModalOpen(true)}
              title={isBn ? 'ভিডিওটি দেখতে ক্লিক করুন' : 'Click to watch investigative report'}
            >
              <img
                src="/complaint-video-poster.jpg"
                alt="Bangladesh Investigative Report"
                className="complaint-video-poster-img"
              />
              
              {/* Center Play Button with Ripple Animation */}
              <div className="complaint-video-play-btn">
                <Play size={24} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: 3 }} />
              </div>

              {/* Bottom Custom Video Player Bar (Exact Match to Screenshot) */}
              <div className="complaint-player-bottom-bar" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="complaint-player-ctrl-btn"
                  onClick={() => setIsVideoModalOpen(true)}
                  aria-label="Play Video"
                >
                  <Play size={14} fill="#FFFFFF" color="#FFFFFF" />
                </button>

                <div className="complaint-player-time">0:00 / 2:18</div>

                <div className="complaint-player-track">
                  <div className="complaint-player-progress"></div>
                </div>

                <div className="complaint-player-actions">
                  <button type="button" className="complaint-player-ctrl-btn" aria-label="Volume">
                    <Volume2 size={15} />
                  </button>
                  <button type="button" className="complaint-player-ctrl-btn" aria-label="Settings">
                    <Settings size={15} />
                  </button>
                  <button type="button" className="complaint-player-ctrl-btn" aria-label="Theater Mode">
                    <Tv size={15} />
                  </button>
                  <button
                    type="button"
                    className="complaint-player-ctrl-btn"
                    onClick={() => setIsVideoModalOpen(true)}
                    aria-label="Fullscreen"
                  >
                    <Maximize size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Complaint Box & Action Trigger */}
          <div className="complaint-action-col">
            <div
              className={`complaint-3d-box-wrap ${isOpeningPaper ? 'paper-launching' : ''}`}
              onClick={handleOpenModal}
              title={isBn ? 'অভিযোগ ফরম খুলুন' : 'Open Complaint Form'}
            >
              {/* Animated Emerging Paper from Box Slot */}
              <div className={`complaint-emerging-paper ${isOpeningPaper ? 'flying-out' : ''}`}>
                <div className="paper-fold"></div>
                <div className="paper-line paper-line-title"></div>
                <div className="paper-line"></div>
                <div className="paper-line"></div>
                <div className="paper-stamp">✓</div>
              </div>

              <img
                src="/complaint-box.png"
                alt="3D Red Complaint Box"
                className="complaint-3d-box-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/complaint-box.jpg';
                }}
              />
            </div>

            <div className="complaint-action-content">
              <h3 className="complaint-action-title">
                {isBn ? 'আপনার অভিযোগ জানান' : 'Submit Your Grievance'}
              </h3>
              <p className="complaint-action-desc">
                {isBn
                  ? 'দুর্নীতি, অনিয়ম, ভোগান্তি, পরিষেবা সংকটসহ যেকোনো সমস্যার বিষয়ে আমাদের জানাতে পারেন।'
                  : 'You can report issues regarding corruption, public service crisis, harassment, or negligence.'}
              </p>
              <p className="complaint-privacy-note">
                <Lock size={13} color="var(--primary-red)" style={{ display: 'inline', marginRight: 4 }} />
                {isBn ? 'আপনার তথ্য সম্পূর্ণ গোপন রাখা হবে।' : 'Your identity will be kept strictly confidential.'}
              </p>

              <button
                type="button"
                className="complaint-cta-btn"
                onClick={handleOpenModal}
              >
                <span>{isBn ? 'অভিযোগ জানাতে ক্লিক করুন' : 'Click to Submit Complaint'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          POPUP MODAL: Complaint Submission Form (সুন্দর ট্রানজিশন)
          ======================================================== */}
      {isFormModalOpen && (
        <div className={`complaint-modal-overlay ${isClosingModal ? 'modal-closing' : ''}`} onClick={closeFormModal}>
          <div
            className={`complaint-modal-dialog ${isClosingModal ? 'modal-closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="complaint-modal-header">
              <div className="complaint-modal-title-group">
                <h3 className="complaint-modal-title">
                  {isBn ? 'জনগণ অভিযোগ বক্স' : 'Jonogon Complaint Box'}
                </h3>
                <span className="complaint-modal-badge">
                  <ShieldCheck size={14} />
                  <span>{isBn ? '১০০% গোপনীয় ও নিরাপদ' : '100% Confidential & Secure'}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="complaint-modal-close-btn"
                aria-label="Close Modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="complaint-modal-body">
              {isSubmitted ? (
                /* Success State */
                <div className="complaint-success-card">
                  <div className="complaint-success-icon-wrap">
                    <CheckCircle2 size={54} color="#22C55E" />
                  </div>
                  <h4 className="complaint-success-title">
                    {isBn ? 'আপনার অভিযোগটি সফলভাবে জমা হয়েছে!' : 'Your Complaint Has Been Submitted!'}
                  </h4>
                  <p className="complaint-success-desc">
                    {isBn
                      ? 'জনগণ.নিউজ অনুসন্ধানী সাংবাদিক দল বিষয়টি গুরুত্বের সাথে যাচাই করে সত্য তুলে ধরবে।'
                      : 'Our investigative journalism team will review and verify your grievance with highest priority.'}
                  </p>

                  <div className="complaint-tracking-box">
                    <span className="tracking-label">
                      {isBn ? 'অভিযোগ ট্র্যাকিং আইডি:' : 'Tracking Reference ID:'}
                    </span>
                    <span className="tracking-code">{trackingId}</span>
                  </div>

                  <div className="complaint-success-actions">
                    <button
                      type="button"
                      className="complaint-btn-secondary"
                      onClick={resetForm}
                    >
                      {isBn ? 'আরেকটি অভিযোগ দিন' : 'Submit Another'}
                    </button>
                    <button
                      type="button"
                      className="complaint-btn-primary"
                      onClick={closeFormModal}
                    >
                      {isBn ? 'সম্পন্ন করুন' : 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Input State */
                <form onSubmit={handleSubmit} className="complaint-form">
                  {/* Notice Banner */}
                  <div className="complaint-notice-banner">
                    <AlertCircle size={16} color="var(--primary-red)" style={{ flexShrink: 0 }} />
                    <span>
                      {isBn
                        ? 'আপনার নাম ও যোগাযোগের তথ্য সম্পূর্ণ ঐচ্ছিক। পরিচয় গোপন রাখতে চাইলে ঘরগুলো খালি রাখুন।'
                        : 'Your name and contact details are completely optional. Leave blank to stay anonymous.'}
                    </span>
                  </div>

                  {/* 1. Complaint Title */}
                  <div className="complaint-form-group">
                    <label className="complaint-label" htmlFor="complaint-title">
                      {isBn ? 'অভিযোগের শিরোনাম / মূল বিষয়' : 'Complaint Title / Subject'} <span className="required-star">*</span>
                    </label>
                    <input
                      id="complaint-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder={isBn ? 'যেমন: আমাদের এলাকায় রাস্তার উন্নয়ন কাজে অনিয়ম...' : 'e.g. Irregularities in local road construction...'}
                      className="complaint-input"
                      required
                    />
                  </div>

                  {/* 2. Category & District (2-Column) */}
                  <div className="complaint-form-row">
                    <div className="complaint-form-group">
                      <label className="complaint-label" htmlFor="complaint-cat">
                        {isBn ? 'অভিযোগের ধরন / ক্যাটাগরি' : 'Category'}
                      </label>
                      <select
                        id="complaint-cat"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="complaint-select"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {isBn ? c.nameBn : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="complaint-form-group">
                      <label className="complaint-label" htmlFor="complaint-dist">
                        {isBn ? 'সংশ্লিষ্ট জেলা' : 'District'}
                      </label>
                      <select
                        id="complaint-dist"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="complaint-select"
                      >
                        {bangladeshDistricts.map((div) => (
                          <optgroup key={div.divisionEn} label={isBn ? div.divisionBn : div.divisionEn}>
                            {div.districts.map((d) => (
                              <option key={d.id} value={d.id}>
                                {isBn ? d.nameBn : d.nameEn}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. Detailed Description */}
                  <div className="complaint-form-group">
                    <label className="complaint-label" htmlFor="complaint-desc">
                      {isBn ? 'ঘটনার বিস্তারিত বিবরণ' : 'Detailed Description'} <span className="required-star">*</span>
                    </label>
                    <textarea
                      id="complaint-desc"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder={isBn ? 'কোথায়, কবে এবং কী ঘটেছে তা স্পষ্টভাবে লিখুন...' : 'Describe when, where and what happened in detail...'}
                      className="complaint-textarea"
                      required
                    />
                  </div>

                  {/* 4. Optional Name & Phone (2-Column) */}
                  <div className="complaint-form-row">
                    <div className="complaint-form-group">
                      <label className="complaint-label" htmlFor="complaint-name">
                        {isBn ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (Optional)'}
                      </label>
                      <input
                        id="complaint-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={isBn ? 'পরিচয় গোপন রাখতে চাইলে খালি রাখুন' : 'Leave empty for anonymity'}
                        className="complaint-input"
                      />
                    </div>

                    <div className="complaint-form-group">
                      <label className="complaint-label" htmlFor="complaint-phone">
                        {isBn ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Mobile Number (Optional)'}
                      </label>
                      <input
                        id="complaint-phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={isBn ? 'প্রয়োজনে তথ্য যাচাইয়ের জন্য' : 'For verification if needed'}
                        className="complaint-input"
                      />
                    </div>
                  </div>

                  {/* 5. Proof / Attachment File Upload */}
                  <div className="complaint-form-group">
                    <label className="complaint-label">
                      {isBn ? 'ছবি / নথি / প্রমাণাদি সংযুক্তি (যদি থাকে)' : 'Attach Document / Photo Evidence (Optional)'}
                    </label>
                    <div className="complaint-file-upload-box">
                      <input
                        type="file"
                        id="complaint-file-input"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                        className="complaint-file-hidden"
                      />
                      <label htmlFor="complaint-file-input" className="complaint-file-dropzone">
                        <Upload size={20} color="var(--primary-red)" />
                        <span className="file-dropzone-text">
                          {fileName ? (
                            <strong className="text-red">📎 {fileName}</strong>
                          ) : isBn ? (
                            'ছবি বা পিডিএফ ফাইল নির্বাচন করতে ক্লিক করুন'
                          ) : (
                            'Click to upload photo or document (Max 15MB)'
                          )}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 6. Anonymous Checkbox */}
                  <div className="complaint-checkbox-group">
                    <label className="complaint-checkbox-label">
                      <input
                        type="checkbox"
                        name="isAnonymous"
                        checked={formData.isAnonymous}
                        onChange={handleInputChange}
                        className="complaint-checkbox"
                      />
                      <span>
                        {isBn
                          ? 'আমার পরিচয় সম্পূর্ণরূপে গোপন রাখুন (জনগণ.নিউজ কারও কাছে পরিচয় প্রকাশ করবে না)'
                          : 'Keep my identity 100% confidential'}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="complaint-form-footer">
                    <button type="button" onClick={closeFormModal} className="complaint-btn-secondary">
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button type="submit" className="complaint-btn-primary">
                      <Send size={16} />
                      <span>{isBn ? 'অভিযোগ জমা দিন' : 'Submit Grievance'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP MODAL: Investigative Video Player
          ======================================================== */}
      {isVideoModalOpen && (
        <div className="complaint-modal-overlay" onClick={() => setIsVideoModalOpen(false)}>
          <div
            className="complaint-video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="complaint-video-modal-header">
              <h4 className="complaint-video-modal-title">
                {isBn ? 'জনগণের অভিযোগ ও অনুসন্ধানী প্রতিবেদন' : 'Public Grievance & Investigative Report'}
              </h4>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="complaint-modal-close-btn"
                aria-label="Close Video"
              >
                <X size={18} />
              </button>
            </div>
            <div className="complaint-video-iframe-wrap">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Investigative Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="complaint-video-iframe"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
