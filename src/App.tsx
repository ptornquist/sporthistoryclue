import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowLeft, MapPin, Camera, ShoppingBag, Compass, Navigation, Globe, Play, CheckCircle2, Crosshair, Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [showMenu, setShowMenu] = useState(false);
  
  const [selectedWalk, setSelectedWalk] = useState(null);
  const [activeNavigationStop, setActiveNavigationStop] = useState(null);
  const [completedStops, setCompletedStops] = useState([]);
  const [xCoins, setXCoins] = useState(350);
  const [selectedLanguage, setSelectedLanguage] = useState({ code: 'SV', name: 'Svenska', flag: '🇸🇪' });
  const [gpsStatus, setGpsStatus] = useState('Klar');

  // Leaflet Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Promenader i Stockholm
  const walks = [
    { 
      id: 'dif-promenaden', 
      title: 'DIF-promenaden: Från Östermalmstorg...', 
      description: '15 stopp markerade på kartan. Denna promenad presenteras av Folksam – vi främjar hälsa och lärande.', 
      sponsor: 'Folksam',
      time: 'ca 74 min',
      distance: '5.5 km',
      center: [59.3400, 18.0770],
      stops: [
        { id: 1, number: 1, title: 'Östermalmstorg', desc: 'Födelseförsamlingen Hedvig Eleonora.', coords: [59.3400, 18.0770], audio: '03:10' },
        { id: 2, number: 2, title: 'Dramaten', desc: 'Svenska teaterns högborg vid Nybroplan.', coords: [59.3330, 18.0750], audio: '02:45' },
        { id: 3, number: 3, title: 'Berzelii Park', desc: 'Katthavvet som fylldes igen.', coords: [59.3345, 18.0730], audio: '02:15' }
      ]
    },
    { 
      id: 'city-dramatik', 
      title: 'City & Dramatik: Berns, Berzelii Park...', 
      description: 'Berzelii park som en gång var Katthavvet, Norrmalmstorg där Stockholmssyndromet föddes 1973.', 
      sponsor: 'Folksam',
      time: 'ca 79 min',
      distance: '6.0 km',
      center: [59.3330, 18.0720],
      stops: [
        { id: 1, number: 1, title: 'Berns Salonger', desc: 'Konditorn Robert Berns köpte tomten 1862.', coords: [59.3330, 18.0720], audio: '04:12' },
        { id: 2, number: 2, title: 'Berzelii Park', desc: 'Historisk park i centrala Stockholm.', coords: [59.3345, 18.0730], audio: '02:30' }
      ]
    }
  ];

  const attractions = [
    { id: 'a1', title: 'Kungliga Slottet', category: 'Monument', desc: 'Det kungliga residenset.', coords: [59.3257, 18.0720] },
    { id: 'a2', title: 'Vasamuseet', category: 'Museum', desc: 'Världens enda bevarade 1600-talsskepp.', coords: [59.3281, 18.0915] }
  ];

  // Ladda Leaflet CSS och JS dynamiskt
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const loadLeafletScript = () => {
      if (window.L) {
        initLeafletMap();
        return;
      }
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => initLeafletMap();
        document.body.appendChild(script);
      }
    };

    loadLeafletScript();
  }, [selectedWalk, activeTab]);

  const initLeafletMap = () => {
    if (!window.L || !mapContainerRef.current) return;

    const center = selectedWalk ? selectedWalk.center : [59.3250, 18.0700];

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false
      }).setView(center, 14);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, 14);
    }

    updateLeafletMarkers();
  };

  const updateLeafletMarkers = () => {
    if (!window.L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const itemsToMark = (selectedWalk && activeTab === 'map') ? selectedWalk.stops : attractions;

    itemsToMark.forEach((item) => {
      const isDone = completedStops.includes(item.id);
      const isNavTarget = activeNavigationStop && activeNavigationStop.id === item.id;
      const color = isNavTarget ? '#ea580c' : (isDone ? '#16a34a' : '#2563eb');

      const customIcon = window.L.divIcon({
        className: 'custom-pin',
        html: `<div style="background:${color}; color:white; padding:6px 12px; border-radius:20px; font-weight:700; font-size:12px; box-shadow:0 4px 12px rgba(0,0,0,0.3); white-space:nowrap;">📍 ${item.number ? `${item.number}. ` : ''}${item.title} ${isDone ? '✓' : ''}</div>`,
        iconSize: [140, 30],
        iconAnchor: [70, 15]
      });

      const marker = window.L.marker(item.coords, { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        if (item.number) {
          setActiveNavigationStop(item);
        }
      });

      markersRef.current.push(marker);
    });
  };

  const centerToUserLocation = () => {
    if (!window.L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    setGpsStatus('Hämtar GPS...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          map.setView([userLat, userLng], 17);
          setGpsStatus('GPS aktiv');

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLat, userLng]);
          } else {
            const userIcon = window.L.divIcon({
              className: 'user-pin',
              html: `<div style="background:#dc2626; color:white; padding:6px 10px; border-radius:50%; font-weight:700; font-size:11px; box-shadow:0 0 15px rgba(220,38,38,0.7); text-align:center;">👤 Du</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });
            userMarkerRef.current = window.L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
          }
        },
        () => {
          setGpsStatus('Visar startpunkt');
          if (selectedWalk) map.setView(selectedWalk.center, 14);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif', background: '#f8fafc' }}>
      
      {/* 1. KARTVY FULLSCREEN */}
      <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }} />

      {/* TOPPNAVIGATION */}
      <div style={{ 
        position: 'absolute', top: '12px', left: '20px', right: '20px', zIndex: 100, 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: '#ffffff', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#f59e0b', color: '#fff', padding: '6px 12px', borderRadius: '16px', fontWeight: 800, fontSize: '13px' }}>
            X
          </div>
          <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Xplories</span>
          <div style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
            PT Lvl 2
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 700 }}>
            🪙 {xCoins} X-Coins
          </div>
          <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '14px', fontSize: '12px', fontWeight: 600 }}>
            {selectedLanguage.flag} {selectedLanguage.code}
          </div>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Menu size={16} /> Meny
          </button>
        </div>
      </div>

      {/* MENY-OVERLAY */}
      {showMenu && (
        <div style={{ 
          position: 'absolute', top: '70px', right: '20px', width: '280px', zIndex: 120, 
          background: '#ffffff', borderRadius: '18px', boxShadow: '0 15px 35px rgba(0,0,0,0.25)', 
          padding: '16px', border: '1px solid #e2e8f0' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>UTFORSKA XPLORIES</span>
            <button onClick={() => setShowMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={18} color="#64748b" />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => { setActiveTab('walks'); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef3c7', border: 'none', padding: '10px 12px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', color: '#92400e' }}>
              <Compass size={16} /> Promenader
            </button>
            <button onClick={() => { setActiveTab('attractions'); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: 'none', padding: '10px 12px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: '#0f172a' }}>
              <MapPin size={16} color="#16a34a" /> Attraktioner & Landmärken
            </button>
            <button onClick={() => { setActiveTab('admin'); setShowMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f3e8ff', border: 'none', padding: '10px 12px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: '#6b21a8' }}>
              <Shield size={16} /> Admin Panel (/admin)
            </button>
          </div>
        </div>
      )}

      {/* GPS-CENTRERINGSKNAPP */}
      <button 
        onClick={centerToUserLocation}
        style={{ 
          position: 'absolute', bottom: '30px', right: '20px', zIndex: 80, 
          background: '#ffffff', border: '1px solid #cbd5e1', width: '48px', height: '48px', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer' 
        }}
        title="Centrera på min GPS-position"
      >
        <Crosshair size={22} color="#2563eb" />
      </button>

      {/* MODAL FÖR VÄLJ PROMENAD */}
      {activeTab === 'walks' && (
        <div style={{ 
          position: 'absolute', top: '80px', left: '20px', width: '360px', bottom: '20px', zIndex: 90, 
          background: '#ffffff', borderRadius: '18px', boxShadow: '0 15px 35px rgba(0,0,0,0.25)', 
          padding: '20px', overflowY: 'auto' 
        }}>
          <button onClick={() => setActiveTab('map')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 700, cursor: 'pointer', marginBottom: '14px', padding: 0 }}>
            <ArrowLeft size={16} /> Tillbaka till kartan
          </button>
          
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Tillgängliga Promenader</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {walks.map((w) => (
              <div 
                key={w.id}
                onClick={() => { setSelectedWalk(w); setActiveNavigationStop(w.stops[0]); setActiveTab('map'); initLeafletMap(); }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
              >
                <div style={{ background: '#dbeafe', color: '#1e40af', display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, marginBottom: '6px' }}>
                  Sponsor: {w.sponsor}
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>{w.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>{w.description}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>⏱️ {w.time} | 📍 {w.distance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}