import { renderHome } from './home-view.js';
import { saveStory, deleteStory, isStorySaved, isOnline } from '../utils/db';

let mapInstance = null;

export async function renderStoryDetail(container, { story, locationName, onBack }) {
  const isLoggedIn = !!localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const isFromSavedStories = urlParams.get('source') === 'saved';
  const offline = !isOnline();
  
  // Remove any query parameters from the photo URL
  const cleanPhotoUrl = story.photoUrl.split('?')[0];
  
  // Clear any existing map instance
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  container.innerHTML = `
    <div class="fade-in detail-wrapper">
      <div class="detail-card">
        <img src="${cleanPhotoUrl}" 
             alt="Cerita oleh ${story.name}" 
             class="detail-img" 
             loading="lazy"
             onerror="this.onerror=null; this.src='/icons/placeholder.png';"
              />
        <div class="detail-content">
          <h2 class="detail-title">${story.name}</h2>
          <p class="detail-desc">${story.description}</p>
          <p class="detail-date"><strong>Tanggal:</strong> ${new Date(story.createdAt).toLocaleString()}</p>
          <p class="detail-location"><strong>Lokasi:</strong> ${story.lat}, ${story.lon}</p>
          
          ${offline ? `
            <div class="offline-map-notice" style="
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 1rem;
              border-radius: 8px;
              margin: 16px 0;
              text-align: center;
            ">
              <i class="fas fa-wifi-slash" style="font-size: 24px; margin-bottom: 10px;"></i>
              <p style="margin: 10px 0;">Peta tidak tersedia dalam mode offline.</p>
              <p style="margin: 0;">Silakan koneksikan ke internet untuk melihat peta.</p>
            </div>
          ` : `
            <div id="map" class="detail-map" style="width: 100%; height: 300px; margin: 16px 0; border-radius: 8px; overflow: hidden;"></div>
          `}
          
          <button class="back-btn">Kembali</button>
          ${isLoggedIn && !isFromSavedStories ? `
            <button id="save-story-btn" class="save-btn" style="margin-left: 10px; background-color: #C599B6;">
              <span>Simpan Cerita</span>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Preload image for offline use
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller && story.photoUrl) {
    // Create a new image element
    const img = new Image();
    // img.crossOrigin = 'anonymous';
    
    // Add error handling before setting src
    img.onerror = async () => {
      console.error('Failed to preload image:', story.photoUrl);
      // Try to fetch through service worker
      try {
        const response = await fetch(story.photoUrl, {
          credentials: 'omit',
          cache: 'force-cache'
        });
        if (response.ok) {
          console.log('[SW] Successfully cached image:', story.photoUrl);
        } else {
          console.error('[SW] Failed to cache image:', story.photoUrl);
          img.src = '/icons/placeholder.png';
        }
      } catch (err) {
        console.error('[SW] Failed to fetch image:', err);
        img.src = '/icons/placeholder.png';
      }
    };
    
    // Set the source after error handler is in place
    img.src = story.photoUrl;
  }

  // Initialize save button state only if not from saved stories
  if (isLoggedIn && !isFromSavedStories) {
    updateSaveButtonState(story.id);
  }

  bindDetailEvents({
    onBack,
    onMapReady: async (map) => {
      try {
        if (!offline && story.lat && story.lon) {
          map.setView([story.lat, story.lon], 13);
          
          L.marker([story.lat, story.lon])
            .addTo(map)
            .bindPopup(`
              <div style="max-width: 200px;">
                <h4 style="margin: 0 0 8px 0;">${story.name}</h4>
                <p style="margin: 0 0 8px 0;">${story.description}</p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <i class="fa-solid fa-location-dot"></i> ${locationName}
                </p>
              </div>
            `)
            .openPopup();
        }
      } catch (error) {
        console.error('Error setting up map:', error);
      }
    },
    onSave: async () => {
      try {
        const isSaved = await isStorySaved(story.id);
        if (isSaved) {
          await deleteStory(story.id);
          alert('Cerita berhasil dihapus dari simpanan');
        } else {
          await saveStory(story);
          alert('Cerita berhasil disimpan');
        }
        updateSaveButtonState(story.id);
      } catch (error) {
        console.error('Error saving/deleting story:', error);
        alert('Terjadi kesalahan saat menyimpan/menghapus cerita');
      }
    }
  });
}

async function updateSaveButtonState(storyId) {
  const saveBtn = document.getElementById('save-story-btn');
  if (saveBtn) {
    const isSaved = await isStorySaved(storyId);
    const text = saveBtn.querySelector('span');
    
    if (isSaved) {
      text.textContent = 'Hapus dari Simpanan';
      saveBtn.style.backgroundColor = '#FAD0C4';
    } else {
      text.textContent = 'Simpan Cerita';
      saveBtn.style.backgroundColor = '#C599B6';
    }
  }
}

export function bindDetailEvents({ onBack, onMapReady, onSave }) {
  // Remove any existing event listeners
  const existingBackBtn = document.querySelector('.back-btn');
  if (existingBackBtn) {
    const newBackBtn = existingBackBtn.cloneNode(true);
    existingBackBtn.parentNode.replaceChild(newBackBtn, existingBackBtn);
    newBackBtn.addEventListener('click', onBack);
  }

  const mapContainer = document.getElementById('map');
  if (mapContainer && !mapInstance) {
    mapInstance = L.map('map');
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    const mapTilerLayer = L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=nVePt7G9IUwgfutEDIJM', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
    });

    L.control.layers({
      "OpenStreetMap": osmLayer,
      "MapTiler": mapTilerLayer
    }).addTo(mapInstance);

    onMapReady(mapInstance);
  } else if (mapInstance) {
    // If we have an existing map instance, just update its view
    onMapReady(mapInstance);
  }

  // Add save button event listener
  const saveBtn = document.getElementById('save-story-btn');
  if (saveBtn) {
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', onSave);
  }
}

export function renderStoryDetailError(container) {
  // Clear map instance on error
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  container.innerHTML = '<div class="error-message">Gagal memuat detail cerita</div>';
}
