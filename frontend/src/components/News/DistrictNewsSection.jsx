import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { MapPin, Clock, ArrowRight, ChevronDown, Compass } from 'lucide-react';
import { bangladeshDistricts } from '../../data/initialData';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function DistrictNewsSection() {
  const { language, articles, openArticle, setActiveCategory } = useNews();
  const isBn = language === 'bn';

  // Retrieve user's saved district or default to 'dhaka'
  const [selectedDistrictId, setSelectedDistrictId] = useState(() => {
    return localStorage.getItem('jonogon_user_district') || 'dhaka';
  });

  // Persist user selection
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrictId(newDistrict);
    localStorage.setItem('jonogon_user_district', newDistrict);
  };

  // Find active district object
  const allDistrictsFlat = bangladeshDistricts.flatMap((div) => div.districts);
  const selectedDistrictObj =
    allDistrictsFlat.find((d) => d.id === selectedDistrictId) ||
    { id: 'dhaka', nameBn: 'ঢাকা', nameEn: 'Dhaka' };

  // Filter articles matching this district
  const districtNameBn = selectedDistrictObj.nameBn;
  const districtNameEn = selectedDistrictObj.nameEn.toLowerCase();

  const matchingArticles = articles.filter((a) => {
    if (a.district === selectedDistrictId) return true;
    if (a.titleBn && a.titleBn.includes(districtNameBn)) return true;
    if (a.contentBn && a.contentBn.includes(districtNameBn)) return true;
    if (a.titleEn && a.titleEn.toLowerCase().includes(districtNameEn)) return true;
    return false;
  });

  // If specific district articles are fewer than 4, fill with regional / district / saradesh news
  const fallbackPool = articles.filter(
    (a) => a.category === 'district' || a.category === 'saradesh' || a.category === 'bangladesh'
  );

  const displayList = matchingArticles.length > 0 ? matchingArticles : fallbackPool;
  const cardsToShow = displayList.slice(0, 4);

  return (
    <section className="my-district-section" style={{ marginBottom: 32 }}>
      {/* Section Header with Dynamic "আমার {{District}}" and Dropdown */}
      <div className="section-header district-section-header">
        <div className="district-title-wrap">
          <h2 className="section-title district-title">
            <span className="district-icon-wrap">
              <MapPin size={22} color="var(--primary-red)" />
            </span>
            <span>
              {isBn ? `আমার ${selectedDistrictObj.nameBn}` : `My ${selectedDistrictObj.nameEn}`}
            </span>
          </h2>
          <span className="district-subtitle-badge">
            {isBn ? 'স্থানীয় সংবাদ' : 'Local News'}
          </span>
        </div>

        <div className="district-controls-wrap">
          {/* District Dropdown Selector */}
          <div className="district-select-wrapper">
            <Compass size={15} className="district-select-icon" />
            <select
              value={selectedDistrictId}
              onChange={handleDistrictChange}
              className="district-select-dropdown"
              aria-label={isBn ? 'জেলা নির্বাচন করুন' : 'Select District'}
              title={isBn ? 'আপনার জেলা নির্বাচন করুন' : 'Select your district'}
            >
              {bangladeshDistricts.map((division) => (
                <optgroup
                  key={division.divisionEn}
                  label={isBn ? division.divisionBn : division.divisionEn}
                >
                  {division.districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {isBn ? dist.nameBn : dist.nameEn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={14} className="district-chevron-icon" />
          </div>

          <button
            onClick={() => setActiveCategory('district')}
            className="section-link"
          >
            <span>{isBn ? 'সব খবর' : 'View All'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Info notice if fallback is shown for a district with no dedicated news yet */}
      {matchingArticles.length === 0 && (
        <div className="district-fallback-note">
          <span>
            {isBn
              ? `💡 এই মুহূর্তে ${selectedDistrictObj.nameBn} জেলার সরাসরি সংবাদ কম থাকায় সারাদেশ ও বিভাগের তাজা সংবাদ দেখানো হচ্ছে:`
              : `💡 Currently showing regional & countrywide updates for ${selectedDistrictObj.nameEn}:`}
          </span>
        </div>
      )}

      {/* 4-Card Responsive Grid */}
      <div className="district-news-grid">
        {cardsToShow.map((item) => (
          <article
            key={`dist-${item.id}`}
            className="district-news-card"
            onClick={() => openArticle(item)}
            title={isBn ? item.titleBn : item.titleEn}
          >
            <div className="district-card-img-wrap">
              <img
                src={item.imageUrl || FALLBACK_NEWS_IMG}
                alt={isBn ? item.titleBn : item.titleEn}
                className="district-card-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_NEWS_IMG;
                }}
              />
              <span className="district-tag-pill">
                📍 {matchingArticles.length > 0 ? selectedDistrictObj.nameBn : (item.categoryBn || 'সারাদেশ')}
              </span>
            </div>

            <div className="district-card-body">
              <h3 className="district-card-title">
                {isBn ? item.titleBn : item.titleEn}
              </h3>
              {item.excerptBn && (
                <p className="district-card-excerpt">
                  {isBn ? item.excerptBn : item.excerptEn}
                </p>
              )}
              <div className="district-card-footer">
                <Clock size={12} color="var(--primary-red)" />
                <span>{isBn ? item.dateBn : item.dateEn}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
