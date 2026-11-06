/**
 * Prayer Time & Holiday Utility for Jonogon News
 * Synchronized with Muslims Day (Karachi Method, Hanafi Madhab, Asia/Dhaka)
 * Calculates accurate 5 Waqt prayer times, Sahri, Iftar, Sunrise, and Bangladesh Govt Holidays
 */

import { Coordinates, CalculationMethod, Madhab, PrayerTimes } from 'adhan';
import { toBengaliNumerals } from './weatherService';
import { bangladeshDistricts } from '../data/initialData';

export const BANGLADESH_GOVT_HOLIDAYS = [
  { nameBn: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস', nameEn: 'International Mother Language Day', month: 2, day: 21, typeBn: 'জাতীয় দিবস', typeEn: 'National Day' },
  { nameBn: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মবার্ষিকী', nameEn: 'National Children’s Day', month: 3, day: 17, typeBn: 'সাধারণ ছুটি', typeEn: 'Public Holiday' },
  { nameBn: 'স্বাধীনতা ও জাতীয় দিবস', nameEn: 'Independence Day of Bangladesh', month: 3, day: 26, typeBn: 'জাতীয় দিবস', typeEn: 'National Day' },
  { nameBn: 'পহেলা বৈশাখ (বাংলা নববর্ষ)', nameEn: 'Bengali New Year', month: 4, day: 14, typeBn: 'সাধারণ ছুটি', typeEn: 'Public Holiday' },
  { nameBn: 'মে দিবস (আন্তর্জাতিক শ্রমিক দিবস)', nameEn: 'May Day', month: 5, day: 1, typeBn: 'সাধারণ ছুটি', typeEn: 'Public Holiday' },
  { nameBn: 'বুদ্ধ পূর্ণিমা', nameEn: 'Buddha Purnima', month: 5, day: 23, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'ঈদুল আযহা (কোরবানি ঈদ)', nameEn: 'Eid-ul-Adha', month: 6, day: 17, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'পবিত্র আশুরা', nameEn: 'Holy Ashura', month: 7, day: 17, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'জাতীয় শোক দিবস', nameEn: 'National Mourning Day', month: 8, day: 15, typeBn: 'সাধারণ ছুটি', typeEn: 'Public Holiday' },
  { nameBn: 'শুভ জন্মাষ্টমী', nameEn: 'Janmashtami', month: 8, day: 26, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)', nameEn: 'Eid-e-Miladunnabi (PBUH)', month: 9, day: 16, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'দুর্গাপূজা (বিজয়া দশমী)', nameEn: 'Durga Puja (Bijoya Dashami)', month: 10, day: 13, typeBn: 'ধর্মীয় ছুটি', typeEn: 'Religious Holiday' },
  { nameBn: 'শহীদ বুদ্ধিজীবী দিবস', nameEn: 'Martyred Intellectuals Day', month: 12, day: 14, typeBn: 'বিশেষ দিবস', typeEn: 'Special Memorial Day' },
  { nameBn: 'বিজয় দিবস', nameEn: 'Victory Day of Bangladesh', month: 12, day: 16, typeBn: 'জাতীয় দিবস', typeEn: 'National Day' },
  { nameBn: 'যিশু খ্রিস্টের জন্মদিন (বড়দিন)', nameEn: 'Christmas Day', month: 12, day: 25, typeBn: 'সাধারণ ছুটি', typeEn: 'Public Holiday' }
];

/**
 * Get next upcoming Bangladesh government holiday from today
 */
export function getNextGovtHoliday() {
  const now = new Date();
  const currentYear = now.getFullYear();

  let nextHoliday = null;
  let minDiffMs = Infinity;

  for (const h of BANGLADESH_GOVT_HOLIDAYS) {
    let holidayDate = new Date(currentYear, h.month - 1, h.day, 23, 59, 59);
    // If holiday already passed this year, check next year
    if (holidayDate < now) {
      holidayDate = new Date(currentYear + 1, h.month - 1, h.day, 23, 59, 59);
    }

    const diffMs = holidayDate.getTime() - now.getTime();
    if (diffMs > 0 && diffMs < minDiffMs) {
      minDiffMs = diffMs;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      nextHoliday = {
        ...h,
        fullDateBn: `${toBengaliNumerals(h.day)} ${monthNamesBn[h.month - 1]} ${toBengaliNumerals(holidayDate.getFullYear())}`,
        fullDateEn: `${h.day} ${monthNamesEn[h.month - 1]} ${holidayDate.getFullYear()}`,
        daysLeft,
        daysLeftBn: toBengaliNumerals(daysLeft)
      };
    }
  }

  return nextHoliday;
}

// Map districts to geographic coordinates
const districtCoordsMap = {};
if (bangladeshDistricts && Array.isArray(bangladeshDistricts)) {
  for (const div of bangladeshDistricts) {
    if (div.districts) {
      for (const d of div.districts) {
        districtCoordsMap[d.id] = { lat: d.lat, lng: d.lng };
      }
    }
  }
}

// In-flight background fetch tracker to prevent duplicate HTTP calls
const pendingMonthlyFetches = new Set();

/**
 * Background fetch to sync exact monthly schedule from Muslims Day API proxy
 */
function syncMuslimsDayMonthInBackground(districtId, year, month) {
  if (typeof window === 'undefined') return;

  const cacheKey = `janogon_prayer_times_${districtId}_${year}_${month}`;
  if (pendingMonthlyFetches.has(cacheKey)) return;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return; // Valid monthly cache already present
      }
    }
  } catch (e) {
    // Continue fetch on cache error
  }

  pendingMonthlyFetches.add(cacheKey);

  const apiEndpoint = (typeof window !== 'undefined' && window.location.pathname.startsWith('/janogon'))
    ? `/janogon/api/prayer_times.php?city=${encodeURIComponent(districtId)}&year=${year}&month=${month}`
    : `/api/prayer_times.php?city=${encodeURIComponent(districtId)}&year=${year}&month=${month}`;

  fetch(apiEndpoint)
    .then((res) => {
      if (!res.ok) throw new Error('Proxy network response was not ok');
      return res.json();
    })
    .then((data) => {
      if (data && Array.isArray(data.days) && data.days.length > 0) {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          window.dispatchEvent(new CustomEvent('prayer-times-synced', { detail: { districtId, year, month } }));
        } catch (storageErr) {
          // Ignore localStorage quota errors
        }
      }
    })
    .catch(() => {
      // Graceful fallback to astronomical calculation
    })
    .finally(() => {
      pendingMonthlyFetches.delete(cacheKey);
    });
}

/**
 * Format hours and minutes to 12-hour AM/PM format (Bengali & English)
 */
function formatTime12(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const hStr = h12 < 10 ? `0${h12}` : `${h12}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  const timeEn = `${hStr}:${mStr} ${period}`;
  const timeBn = `${toBengaliNumerals(hStr)}:${toBengaliNumerals(mStr)} ${period}`;
  return { timeBn, timeEn, rawMinutes: h * 60 + m };
}

/**
 * Calculate accurate prayer times matching Muslims Day (Karachi + Hanafi + Asia/Dhaka)
 * Uses cached Muslims Day API data when available, and astronomical adhan engine as instant offline fallback.
 */
export function calculatePrayerTimes(districtId = 'dhaka') {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  // Background sync for Muslims Day API
  syncMuslimsDayMonthInBackground(districtId, year, month);

  // Retrieve coordinates (Default: Dhaka 23.8103, 90.4125)
  const coordsInfo = districtCoordsMap[districtId] || { lat: 23.8103, lng: 90.4125 };
  const coordinates = new Coordinates(coordsInfo.lat, coordsInfo.lng);

  // Configure Karachi Calculation Method & Hanafi Madhab
  const params = CalculationMethod.Karachi();
  params.madhab = Madhab.Hanafi;
  // Calibration adjustments to strictly mirror Muslims Day astronomical tables
  params.adjustments.fajr = -1;
  params.adjustments.dhuhr = 3;
  params.adjustments.asr = 1;

  const adhanTimes = new PrayerTimes(coordinates, now, params);

  // Default times computed via adhan
  let fajrH = adhanTimes.fajr.getHours();
  let fajrM = adhanTimes.fajr.getMinutes();

  let dhuhrH = adhanTimes.dhuhr.getHours();
  let dhuhrM = adhanTimes.dhuhr.getMinutes();

  let asrH = adhanTimes.asr.getHours();
  let asrM = adhanTimes.asr.getMinutes();

  let maghribH = adhanTimes.maghrib.getHours();
  let maghribM = adhanTimes.maghrib.getMinutes();

  let ishaH = adhanTimes.isha.getHours();
  let ishaM = adhanTimes.isha.getMinutes();

  let sunriseH = adhanTimes.sunrise.getHours();
  let sunriseM = adhanTimes.sunrise.getMinutes();

  // Check localStorage for Muslims Day exact day schedule
  if (typeof window !== 'undefined') {
    try {
      const cacheKey = `janogon_prayer_times_${districtId}_${year}_${month}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.days)) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const todaySchedule = parsed.days.find((d) => d.date === dateStr);
          if (todaySchedule) {
            if (todaySchedule.fajr) {
              const [h, m] = todaySchedule.fajr.split(':').map(Number);
              fajrH = h; fajrM = m;
            }
            if (todaySchedule.dhuhr) {
              const [h, m] = todaySchedule.dhuhr.split(':').map(Number);
              dhuhrH = h; dhuhrM = m;
            }
            if (todaySchedule.asr) {
              const [h, m] = todaySchedule.asr.split(':').map(Number);
              asrH = h; asrM = m;
            }
            if (todaySchedule.maghrib) {
              const [h, m] = todaySchedule.maghrib.split(':').map(Number);
              maghribH = h; maghribM = m;
            }
            if (todaySchedule.isha) {
              const [h, m] = todaySchedule.isha.split(':').map(Number);
              ishaH = h; ishaM = m;
            }
          }
        }
      }
    } catch (e) {
      // Fallback already assigned
    }
  }

  // Sahri ends 5 minutes prior to Fajr start
  const fajrTotalMin = fajrH * 60 + fajrM;
  const sahriTotalMin = (fajrTotalMin - 5 + 1440) % 1440;
  const sahriH = Math.floor(sahriTotalMin / 60);
  const sahriM = sahriTotalMin % 60;

  // Iftar time is exactly Maghrib start
  const iftarH = maghribH;
  const iftarM = maghribM;

  const baseTimes = {
    fajr: { h: fajrH, m: fajrM, nameBn: 'ফজর', nameEn: 'Fajr', icon: 'moon' },
    sunrise: { h: sunriseH, m: sunriseM, nameBn: 'সূর্যোদয়', nameEn: 'Sunrise', icon: 'sun' },
    dhuhr: { h: dhuhrH, m: dhuhrM, nameBn: 'যোহর', nameEn: 'Dhuhr', icon: 'sun' },
    asr: { h: asrH, m: asrM, nameBn: 'আসর', nameEn: 'Asr', icon: 'cloud-sun' },
    maghrib: { h: maghribH, m: maghribM, nameBn: 'মাগরিব', nameEn: 'Maghrib', icon: 'moon' },
    isha: { h: ishaH, m: ishaM, nameBn: 'ইশা', nameEn: 'Isha', icon: 'moon' },
    sahri: { h: sahriH, m: sahriM, nameBn: 'সেহরি শেষ', nameEn: 'Sahri Ends', icon: 'moon' },
    iftar: { h: iftarH, m: iftarM, nameBn: 'ইফতার', nameEn: 'Iftar', icon: 'sun' }
  };

  const list = [
    { id: 'fajr', ...baseTimes.fajr, ...formatTime12(baseTimes.fajr.h, baseTimes.fajr.m) },
    { id: 'dhuhr', ...baseTimes.dhuhr, ...formatTime12(baseTimes.dhuhr.h, baseTimes.dhuhr.m) },
    { id: 'asr', ...baseTimes.asr, ...formatTime12(baseTimes.asr.h, baseTimes.asr.m) },
    { id: 'maghrib', ...baseTimes.maghrib, ...formatTime12(baseTimes.maghrib.h, baseTimes.maghrib.m) },
    { id: 'isha', ...baseTimes.isha, ...formatTime12(baseTimes.isha.h, baseTimes.isha.m) }
  ];

  // Determine current/next active prayer waqt
  let nextWaqt = list[0]; // defaults to next day's Fajr
  for (const p of list) {
    if (p.rawMinutes > currentMinutes) {
      nextWaqt = p;
      break;
    }
  }

  // Calculate countdown minutes remaining
  let diffMinutes = nextWaqt.rawMinutes - currentMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Next day Fajr cycle
  }

  const hoursRemaining = Math.floor(diffMinutes / 60);
  const minsRemaining = diffMinutes % 60;

  const remainingTextBn = hoursRemaining > 0 
    ? `${toBengaliNumerals(hoursRemaining)} ঘণ্টা ${toBengaliNumerals(minsRemaining)} মিনিট বাকি`
    : `${toBengaliNumerals(minsRemaining)} মিনিট বাকি`;

  const remainingTextEn = hoursRemaining > 0 
    ? `${hoursRemaining}h ${minsRemaining}m left`
    : `${minsRemaining}m left`;

  const sahriObj = { ...baseTimes.sahri, ...formatTime12(baseTimes.sahri.h, baseTimes.sahri.m) };
  const iftarObj = { ...baseTimes.iftar, ...formatTime12(baseTimes.iftar.h, baseTimes.iftar.m) };
  const sunriseObj = { ...baseTimes.sunrise, ...formatTime12(baseTimes.sunrise.h, baseTimes.sunrise.m) };

  return {
    prayers: list,
    nextWaqt,
    remainingTextBn,
    remainingTextEn,
    sahri: sahriObj,
    iftar: iftarObj,
    sunrise: sunriseObj
  };
}
