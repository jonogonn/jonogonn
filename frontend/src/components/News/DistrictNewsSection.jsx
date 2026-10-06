import React, { useState, useEffect } from 'react';
import { useNews } from '../../context/NewsContext';
import { MapPin, Clock, ArrowRight, ChevronDown, Compass, LocateFixed, Loader2, CheckCircle2 } from 'lucide-react';
import { bangladeshDistricts, findClosestDistrict } from '../../data/initialData';

const FALLBACK_NEWS_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

export default function DistrictNewsSection() {
  const { language, articles, openArticle, setActiveCategory, userDistrict, setUserDistrict, homepageSections } = useNews();
  const isBn = language === 'bn';

  // Section visibility check from homepageSections
  const secConfig = (homepageSections || []).find((s) => s.id === 'districtNewsSection');
  if (secConfig && secConfig.isVisible === false) return null;

  // Flat list of all 64 districts
  const allDistrictsFlat = bangladeshDistricts.flatMap((div) => div.districts);

  const selectedDistrictId = userDistrict || 'dhaka';

  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'gps-success' | 'ip-success' | 'manual' | 'error'

  // Function to detect real-time user location via GPS or IP
  const detectUserLocation = (isUserClick = false) => {
    setIsLocating(true);

    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const { district } = findClosestDistrict(latitude, longitude);
            if (district && district.id) {
              setUserDistrict(district.id);
              setLocationStatus('gps-success');
            }
          } catch (err) {
            console.error('Geo match error:', err);
          } finally {
            setIsLocating(false);
          }
        },
        async (geoError) => {
          console.warn('GPS Geolocation prompt dismissed or failed, attempting IP-based fallback...', geoError);
          // Fallback Tier 2: IP-based real-time geolocation
          try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              const { district } = findClosestDistrict(data.latitude, data.longitude);
              if (district && district.id) {
                setUserDistrict(district.id);
                setLocationStatus('ip-success');
              }
            } else if (data && data.city) {
              const cityLower = data.city.toLowerCase();
              const matched = allDistrictsFlat.find(
                (d) =>
                  d.id === cityLower ||
                  d.nameEn.toLowerCase().includes(cityLower) ||
                  cityLower.includes(d.nameEn.toLowerCase())
              );
              if (matched) {
                setUserDistrict(matched.id);
                setLocationStatus('ip-success');
              }
            }
          } catch (ipErr) {
            console.warn('IP location fetch failed:', ipErr);
            if (isUserClick) setLocationStatus('error');
          } finally {
            setIsLocating(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 300000 // Cache for 5 mins
        }
      );
    } else {
      // Direct IP fallback if navigator.geolocation not supported
      fetch('https://ipapi.co/json/')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.latitude && data.longitude) {
            const { district } = findClosestDistrict(data.latitude, data.longitude);
            if (district) {
              setUserDistrict(district.id);
              setLocationStatus('ip-success');
            }
          }
        })
        .catch(() => {
          if (isUserClick) setLocationStatus('error');
        })
        .finally(() => setIsLocating(false));
    }
  };

  // Automatically detect real-time location on initial mount if not already saved
  useEffect(() => {
    detectUserLocation(false);
  }, []);

  // Handle manual dropdown selection
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setUserDistrict(newDistrict);
    setLocationStatus('manual');
  };

  // Find active district object
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
      {/* Section Header with Dynamic "My District" and Dropdown */}
      <div className="section-header district-section-header">
        <div className="district-header-main-group">
          <div className="district-title-wrap">
            <h2 className="section-title district-title">
              <span className="district-icon-wrap">
                <MapPin size={20} color="var(--primary-red)" />
              </span>
              <span>
                {isBn ? `আমার ${selectedDistrictObj.nameBn}` : `My ${selectedDistrictObj.nameEn}`}
              </span>
            </h2>
            <span className="district-subtitle-badge">
              {isBn ? 'স্থানীয় সংবাদ' : 'Local News'}
            </span>
          </div>

          <button
            onClick={() => setActiveCategory('district')}
            className="section-link district-view-all-btn"
          >
            <span>{isBn ? 'সব খবর' : 'View All'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="district-controls-wrap">
          {/* Quick GPS Real-time Locate Me Button */}
          <button
            type="button"
            onClick={() => detectUserLocation(true)}
            className={`district-locate-btn ${isLocating ? 'locating' : ''}`}
            title={isBn ? 'রিয়েলটাইম লোকেশন দিয়ে জেলা সনাক্ত করুন' : 'Auto-detect district via real-time location'}
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 size={14} className="spin-animate" />
            ) : (
              <LocateFixed size={14} />
            )}
            <span>{isLocating ? (isBn ? 'সনাক্ত হচ্ছে...' : 'Locating...') : (isBn ? 'লাইভ লোকেশন' : 'Detect Location')}</span>
          </button>

          {/* District Dropdown Selector */}
          <div className="district-select-wrapper">
            <Compass size={14} className="district-select-icon" />
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

