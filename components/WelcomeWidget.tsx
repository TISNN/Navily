import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, MapPin, Loader2, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  city?: string;
}

export const WelcomeWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good Morning');
    else if (hour < 18) setTimeOfDay('Good Afternoon');
    else setTimeOfDay('Good Evening');
  }, []);

  // Fetch city name from coordinates (reverse geocoding)
  const getCityName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Try Open-Meteo reverse geocoding first
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        // Try to get city name in priority: city > locality > principalSubdivision
        const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || null;
        if (cityName) {
          return cityName;
        }
      }
    } catch (error) {
      console.warn('Reverse geocoding failed, trying alternative', error);
    }

    // Fallback: Try Nominatim (OpenStreetMap)
    try {
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        const address = nominatimData.address;
        if (address) {
          // Try different address components
          return address.city || address.town || address.village || address.municipality || address.county || 'Unknown';
        }
      }
    } catch (error) {
      console.warn('Nominatim geocoding failed', error);
    }

    return 'Current Location'; // Fallback
  };

  // Fetch Weather with fallback to IP-based location
  useEffect(() => {
    const fetchWeatherByLocation = async (latitude: number, longitude: number, cityName?: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.current_weather) {
          // If city name not provided, fetch it
          let finalCityName = cityName;
          if (!finalCityName) {
            finalCityName = await getCityName(latitude, longitude);
          }
          
          setWeather({
            temperature: data.current_weather.temperature,
            weatherCode: data.current_weather.weathercode,
            city: finalCityName
          });
          setError(null);
        } else {
          throw new Error('Invalid weather data received');
        }
      } catch (error) {
        console.error('Weather fetch failed', error);
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    // Try to get location via geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await fetchWeatherByLocation(latitude, longitude);
        },
        async (error) => {
          console.warn('Geolocation denied or failed', error);
          
          // Fallback: Try to get location via IP geolocation
          try {
            const ipResponse = await fetch('https://ipapi.co/json/');
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              if (ipData.latitude && ipData.longitude) {
                // ipapi.co already provides city name
                const cityName = ipData.city || `${ipData.region || ''}, ${ipData.country_name || ''}`.trim();
                await fetchWeatherByLocation(ipData.latitude, ipData.longitude, cityName);
                return;
              }
            }
          } catch (ipError) {
            console.warn('IP geolocation failed', ipError);
          }
          
          // If all methods fail, show unavailable
          setLoading(false);
          setError('Location access denied');
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false // Use less accurate but faster method
        }
      );
    } else {
      // Browser doesn't support geolocation, try IP-based location
      (async () => {
        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            if (ipData.latitude && ipData.longitude) {
              // ipapi.co already provides city name
              const cityName = ipData.city || `${ipData.region || ''}, ${ipData.country_name || ''}`.trim();
              await fetchWeatherByLocation(ipData.latitude, ipData.longitude, cityName);
              return;
            }
          }
        } catch (ipError) {
          console.warn('IP geolocation failed', ipError);
        }
        setLoading(false);
        setError('Geolocation not supported');
      })();
    }
  }, []);

  // Helper to get weather icon
  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return <Sun className="text-yellow-400 animate-pulse-slow" size={32} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-gray-300" size={32} />;
    if (code >= 45 && code <= 48) return <Wind className="text-gray-400" size={32} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={32} />;
    if (code >= 71 && code <= 77) return <Snowflake className="text-white" size={32} />;
    if (code >= 95) return <CloudLightning className="text-purple-400" size={32} />;
    return <Sun className="text-yellow-400" size={32} />; // Default
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-[#0F0F0F] border border-white/5 rounded-sm p-6 relative overflow-hidden group">
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* Header / Greeting */}
        <div>
          <p className="text-xs font-bold text-navily-muted uppercase tracking-widest mb-1">{today}</p>
          <h2 className="text-3xl font-light text-white tracking-tight">
            {timeOfDay}, <br />
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-navily-silver to-navily-muted">
              Evan Xu
            </span>
          </h2>
        </div>

        {/* Weather Section */}
        <div className="flex items-center gap-4 pt-2 border-t border-white/5">
          {loading ? (
             <div className="flex items-center gap-2 text-navily-muted text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Scanning atmosphere...</span>
             </div>
          ) : weather ? (
            <>
              <div className="p-2 bg-white/5 rounded-sm border border-white/5 shadow-inner">
                {getWeatherIcon(weather.weatherCode)}
              </div>
              <div>
                 <div className="text-2xl font-bold text-white leading-none">
                    {Math.round(weather.temperature)}°
                 </div>
                 <div className="text-[10px] text-navily-muted uppercase tracking-widest flex items-center gap-1 mt-1">
                    <MapPin size={10} />
                    <span className="truncate max-w-[120px]" title={weather.city}>
                      {weather.city || 'Current Location'}
                    </span>
                 </div>
              </div>
            </>
          ) : (
             <div className="flex flex-col gap-1 text-navily-muted">
                <div className="flex items-center gap-2">
                  <Sun size={20} className="text-white/20" />
                  <span className="text-xs">Weather unavailable</span>
                </div>
                {error && (
                  <span className="text-[10px] text-navily-muted/70 italic">
                    {error === 'Location access denied' 
                      ? 'Please allow location access' 
                      : error === 'Geolocation not supported'
                      ? 'Browser not supported'
                      : 'Unable to fetch weather'}
                  </span>
                )}
             </div>
          )}
        </div>

      </div>
    </div>
  );
};
