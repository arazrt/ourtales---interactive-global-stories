export function renderHome(container, allStories, offlineInfo = null) {
  container.classList.add('fade-in');

  try {
    // Handle offline state
    if (offlineInfo?.offline) {
      container.innerHTML = `
        <div>
          <h2 class="home-title">
            ${allStories.length === 0 ? '📱 Offline Mode' : 'Daftar Cerita'}
          </h2>
          <h3 class="home-subtitle">
            ${offlineInfo.message || 'Showing cached stories while offline'}
          </h3>
          ${allStories.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-wifi-slash" style="font-size: 48px; color: #C599B6;"></i>
              <h2>Tidak ada cerita tersimpan</h2>
              <p>Silakan koneksikan ke internet untuk melihat cerita terbaru</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    // If we have stories (either online or offline), render them
    if (allStories.length > 0) {
      const storiesHTML = `
        <div class="card-container">
          ${allStories.map((story , index)=> {
            // Remove any query parameters from the photo URL
            const cleanPhotoUrl = story.photoUrl; // jangan hilangkan query string
            const cacheBustedUrl = `${cleanPhotoUrl}?v=${index}`;
            return `
              <div class="story-card">
                <img src="${cleanPhotoUrl}" 
                  alt="Cerita oleh ${story.name}" 
                  class="story-img" 
                  loading="lazy"
                  onerror="this.onerror=null; this.src='/icons/placeholder.png';"
                  onload="console.log('Image loaded:', this.src)"
                />
                <div class="story-content">
                  <h3 class="story-name">
                    <i class="fa-solid fa-user"></i>${story.name}
                  </h3>
                  <p class="story-desc">${story.description}</p>
                  <div class="story-date" style="margin-bottom: 8px;">
                    <small>
                      <i class="fa-solid fa-calendar-days" style="margin-right: 5px;"></i>
                      ${new Date(story.createdAt).toLocaleDateString()}
                    </small><br>
                    <small>
                      <i class="fa-solid fa-clock" style="margin-right: 5px;"></i>
                      ${new Date(story.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                  <button class="view-details-btn" data-story-id="${story.id}">Lihat Detail</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // If we're in offline mode, append to the offline message
      if (offlineInfo?.offline) {
        container.querySelector('div').insertAdjacentHTML('beforeend', storiesHTML);
      } else {
        // Normal online mode
        container.innerHTML = `
          <div>
            <h2 class="home-title">Daftar Cerita</h2>
            <h3 class="home-subtitle">
              Temukan cerita dari setiap sudut pandang dan bagikan kisahmu!
            </h3>
            ${storiesHTML}
          </div>
        `;
      }
    }

    // Preload images for offline use
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      allStories.forEach(story => {
        if (story.photoUrl) {
          // Create a new image element for preloading
          const img = new Image();
          // img.crossOrigin = 'anonymous';
          
          // Add error handling before setting src
          img.onerror = async () => {
            console.error('Failed to preload image:', story.photoUrl);
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
      });
    }

    container.querySelectorAll('.fade-in').forEach(el => el.classList.add('loaded'));

    bindHomeEvents({
      onStoryClick: (storyId) => {
        window.location.hash = `#story/${storyId}`;
      }
    });

  } catch (err) {
    console.error('Gagal render halaman:', err);
    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #C599B6;"></i>
        <h2>Terjadi Kesalahan</h2>
        <p>Gagal memuat daftar cerita. Silakan coba lagi nanti.</p>
      </div>
    `;
  }
}

export function bindHomeEvents({ onStoryClick }) {
  const buttons = document.querySelectorAll('.view-details-btn');
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const storyId = event.target.getAttribute('data-story-id');
      onStoryClick(storyId);
    });
  });
}