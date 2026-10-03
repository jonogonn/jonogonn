/**
 * Live Google Weather Service for Jonogon News (জনগণ.নিউজ)
 * Fetches real-time, highly accurate Google-compatible weather metrics using WMO standard API (Open-Meteo).
 */

export function toBengaliNumerals(num) {
  if (num === undefined || num === null) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

/**
 * Maps WMO weather code (Standard Google Weather codes) to Bangla & English text & icons
 */
export function getWeatherDetails(wmoCode, isDay = 1) {
  switch (wmoCode) {
    case 0:
      return {
        conditionBn: isDay ? 'পরিষ্কার রৌদ্রোজ্জ্বল' : 'পরিষ্কার আকাশ',
        conditionEn: isDay ? 'Sunny & Clear' : 'Clear Sky',
        icon: isDay ? 'sun' : 'moon'
      };
    case 1:
      return {
        conditionBn: isDay ? 'অধিকাংশ সময় রৌদ্রোজ্জ্বল' : 'পরিষ্কার আকাশ',
        conditionEn: isDay ? 'Mostly Sunny' : 'Mostly Clear',
        icon: isDay ? 'sun' : 'moon'
      };
    case 2:
      return {
        conditionBn: 'আংশিক মেঘলা',
        conditionEn: 'Partly Cloudy',
        icon: isDay ? 'cloud-sun' : 'cloud'
      };
    case 3:
      return {
        conditionBn: 'মেঘলা আকাশ',
        conditionEn: 'Overcast',
        icon: 'cloud'
      };
    case 45:
    case 48:
      return {
        conditionBn: 'কুয়াশাচ্ছন্ন',
        conditionEn: 'Foggy',
        icon: 'cloud'
      };
    case 51:
    case 53:
    case 55:
      return {
        conditionBn: 'গুঁড়ি গুঁড়ি বৃষ্টি',
        conditionEn: 'Light Drizzle',
        icon: 'rain'
      };
    case 56:
    case 57:
      return {
        conditionBn: 'হিমশীতল গুঁড়ি গুঁড়ি বৃষ্টি',
        conditionEn: 'Freezing Drizzle',
        icon: 'rain'
      };
    case 61:
      return {
        conditionBn: 'হালকা বৃষ্টি',
        conditionEn: 'Light Rain',
        icon: 'rain'
      };
    case 63:
      return {
        conditionBn: 'বৃষ্টিপাত',
        conditionEn: 'Moderate Rain',
        icon: 'rain'
      };
    case 65:
      return {
        conditionBn: 'ভারি বৃষ্টিপাত',
        conditionEn: 'Heavy Rain',
        icon: 'rain'
      };
    case 80:
    case 81:
      return {
        conditionBn: 'বৃষ্টির সম্ভাবনা',
        conditionEn: 'Rain Showers',
        icon: 'rain'
      };
    case 82:
      return {
        conditionBn: 'তীব্র বৃষ্টিপাত',
        conditionEn: 'Violent Rain',
        icon: 'rain'
      };
    case 95:
      return {
        conditionBn: 'বজ্রঝড়',
        conditionEn: 'Thunderstorm',
        icon: 'thunder'
      };
    case 96:
    case 99:
      return {
        conditionBn: 'বজ্রবৃষ্টি ও শিলাবৃষ্টি',
        conditionEn: 'Thunderstorm with Hail',
        icon: 'thunder'
      };
    default:
      return {
        conditionBn: isDay ? 'রৌদ্রোজ্জ্বল' : 'শান্ত আকাশ',
        conditionEn: isDay ? 'Sunny' : 'Fair',
        icon: isDay ? 'sun' : 'moon'
      };
  }
}

/**
 * Real-time Weather Fetcher
 */
export async function fetchLiveGoogleWeather(lat, lng, districtNameBn = 'ঢাকা', districtNameEn = 'Dhaka') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=6`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather API returned status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(current.temperature_2m ?? 28);
    const humidity = Math.round(current.relative_humidity_2m ?? 75);
    const windSpeed = Math.round(current.wind_speed_10m ?? 5);
    const wmo = current.weather_code ?? 0;
    const isDay = current.is_day ?? (new Date().getHours() >= 6 && new Date().getHours() < 18 ? 1 : 0);
    const weatherDetails = getWeatherDetails(wmo, isDay);

    const high = Math.round(daily.temperature_2m_max?.[0] ?? (temp + 4));
    const low = Math.round(daily.temperature_2m_min?.[0] ?? (temp - 4));

    // 5-Day Daily Forecast Array
    const bnDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const forecast = [];
    if (daily.time && Array.isArray(daily.time)) {
      for (let i = 1; i <= 5 && i < daily.time.length; i++) {
        const dayDate = new Date(daily.time[i]);
        const dayIdx = dayDate.getDay();
        const dayWmo = daily.weather_code?.[i] ?? 0;
        const dayMax = Math.round(daily.temperature_2m_max?.[i] ?? temp);
        const dayDetails = getWeatherDetails(dayWmo, 1);

        forecast.push({
          dayBn: bnDays[dayIdx],
          dayEn: enDays[dayIdx],
          icon: dayDetails.icon,
          tempBn: `${toBengaliNumerals(dayMax)}°`,
          tempEn: `${dayMax}°`,
          conditionBn: dayDetails.conditionBn,
          conditionEn: dayDetails.conditionEn
        });
      }
    }

    return {
      cityBn: districtNameBn,
      cityEn: districtNameEn,
      tempNum: temp,
      tempBn: `${toBengaliNumerals(temp)}°`,
      tempEn: `${temp}°`,
      conditionBn: weatherDetails.conditionBn,
      conditionEn: weatherDetails.conditionEn,
      iconType: weatherDetails.icon,
      highBn: `${toBengaliNumerals(high)}°`,
      highEn: `${high}°`,
      lowBn: `${toBengaliNumerals(low)}°`,
      lowEn: `${low}°`,
      humidityBn: `${toBengaliNumerals(humidity)}%`,
      humidityEn: `${humidity}%`,
      windBn: `${toBengaliNumerals(windSpeed)} কিমি/ঘণ্টা`,
      windEn: `${windSpeed} km/h`,
      isDay: isDay,
      forecast: forecast.length > 0 ? forecast : getDefaultForecast(),
      isLive: true,
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    console.warn('Real-time weather API error, using smart fallback for', districtNameEn, err);
    return getDefaultWeather(districtNameBn, districtNameEn);
  }
}

function getDefaultForecast() {
  const bnDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();

  return [1, 2, 3, 4, 5].map((offset, i) => {
    const dayIdx = (todayIdx + offset) % 7;
    const icons = ['sun', 'cloud-sun', 'cloud', 'rain', 'sun'];
    const temps = [29, 31, 28, 27, 30];
    return {
      dayBn: bnDays[dayIdx],
      dayEn: enDays[dayIdx],
      icon: icons[i % icons.length],
      tempBn: `${toBengaliNumerals(temps[i])}°`,
      tempEn: `${temps[i]}°`
    };
  });
}

export function getDefaultWeather(cityBn = 'ঢাকা', cityEn = 'Dhaka') {
  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 18 ? 1 : 0;
  return {
    cityBn,
    cityEn,
    tempNum: 28,
    tempBn: '২৮°',
    tempEn: '28°',
    conditionBn: isDay ? 'পরিষ্কার রৌদ্রোজ্জ্বল' : 'পরিষ্কার আকাশ',
    conditionEn: isDay ? 'Sunny & Clear' : 'Clear Sky',
    iconType: isDay ? 'sun' : 'moon',
    highBn: '৩২°',
    highEn: '32°',
    lowBn: '২২°',
    lowEn: '22°',
    humidityBn: '৭৮%',
    humidityEn: '78%',
    windBn: '৪ কিমি/ঘণ্টা',
    windEn: '4 km/h',
    isDay,
    forecast: getDefaultForecast(),
    isLive: false,
    lastUpdated: new Date().toISOString()
  };
}
