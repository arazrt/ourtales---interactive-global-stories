import Map from '../utils/map.js';
import { isOnline } from '../utils/db.js';

export async function renderMap(container, allStories) {
  container.classList.add('fade-in');

  // Check if we're offline
  const offline = !isOnline();

  container.innerHTML = `
    <div class="map-view" style="max-width: 960px; margin: 0 auto; padding: 20px;">
      <h2 class="page-main-title">Peta Cerita</h2>
      <h3 class="page-subtitle">
        ${offline ? 'Mode Offline - Peta tidak tersedia' : 'Temukan cerita dari berbagai lokasi di seluruh dunia!'}
      </h3>
      
      ${offline ? `
        <div class="offline-map-notice" style="
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 1rem;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        ">
          <i class="fas fa-wifi-slash" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p style="margin: 10px 0;">Peta tidak tersedia dalam mode offline.</p>
          <p style="margin: 0;">Silakan koneksikan ke internet untuk melihat peta.</p>
        </div>
      ` : `
        <div id="stories-map" 
             style="width: 100%; height: 600px; margin: 30px 0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        </div>
      `}
    </div>
  `;

  // Only initialize map if we're online
  if (!offline) {
    try {
      const mapInstance = await Map.build('#stories-map');
      
      allStories.forEach(story => {
        if (story.lat && story.lon) {
          const popupContent = `
            <div style="max-width: 220px; font-family: sans-serif; color: #333;">
              <img src="${story.photoUrl}" alt="${story.name}" 
                   style="width: 100%; height: 130px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              <h4 style="margin: 0 0 8px 0; font-size: 16px;">${story.name}</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.4;">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
              <button onclick="window.location.hash='#story/${story.id}'" 
                      style="margin-top: 10px; padding: 6px 10px; background: #8E44AD; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                Lihat Detail
              </button>
            </div>
          `;
          mapInstance.addMarker([story.lat, story.lon], {}, { content: popupContent });
        }
      });

      if (allStories.length > 0 && allStories[0].lat && allStories[0].lon) {
        mapInstance.setView([allStories[0].lat, allStories[0].lon], 13);
      }
    } catch (err) {
      console.error('Map error:', err);
      container.innerHTML = '<p style="text-align: center; color: red;">Gagal memuat peta</p>';
    }
  }
}

export function renderMapError(container) {
  container.innerHTML = '<p style="text-align: center; color: red;">Gagal memuat peta</p>';
}

export function updateMapView(mapInstance, lat, lng, zoom = 13) {
  if (mapInstance) {
    mapInstance.setView([lat, lng], zoom);
  }
}

export function handleGeolocation(onSuccess, onError) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onSuccess({ lat, lng });
      },
      (error) => {
        onError(error);
      }
    );
  } else {
    onError(new Error('Geolocation not supported'));
  }
}
