import { getAllSavedStories, deleteStory } from '../utils/db';

export async function renderSavedStories(container) {
  try {
    const stories = await getAllSavedStories();
    console.log('All saved stories:', stories);
    
    if (stories.length === 0) {
      container.innerHTML = `
        <div class="saved-stories-page empty-state">
          <i class="far fa-bookmark" style="font-size: 48px; color: #C599B6;"></i>
          <h2>Belum ada cerita tersimpan</h2>
          <p>Simpan cerita favoritmu untuk dibaca kembali nanti</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="saved-stories-page">
        <div class="saved-stories">
          <h1 class="page-main-title">Cerita Tersimpan</h1>
          <div class="stories-grid">
            ${stories.map(story => {
              console.log('Rendering saved story:', story);
              return `
                <div class="story-card" data-id="${story.id}">
                  <img src="${story.photoUrl}" alt="${story.name}" class="story-img">
                  <div class="story-content">
                    <h3 class="story-title">${story.name}</h3>
                    <p class="story-desc">${story.description}</p>
                    <p class="story-date">
                      <small>
                        <i class="fa-solid fa-calendar-days" style="margin-right: 5px;"></i>
                        ${new Date(story.timestamp).toLocaleDateString('id-ID')}
                      </small><br>
                      <small>
                        <i class="fa-solid fa-clock" style="margin-right: 5px;"></i>
                        ${new Date(story.timestamp).toLocaleTimeString('id-ID')}
                      </small>
                    </p>
                    <div class="story-actions">
                      <button class="view-btn" data-id="${story.id}">Lihat Detail</button>
                      <button class="delete-btn" data-id="${story.id}">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    bindSavedEvents(container);
  } catch (error) {
    console.error('Error loading saved stories:', error);
    container.innerHTML = `
      <div class="saved-stories-page error-state">
        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #FAD0C4;"></i>
        <h2>Terjadi Kesalahan</h2>
        <p>Gagal memuat cerita tersimpan. Silakan coba lagi nanti.</p>
      </div>
    `;
  }
}

function bindSavedEvents(container) {
  // View story details
  container.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const storyId = btn.dataset.id;
      console.log('View button clicked for story ID:', storyId);
      console.log('Story card data:', btn.closest('.story-card').dataset);
      window.location.hash = `#story/${storyId}?source=saved`;
    });
  });

  // Delete saved story
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const storyId = btn.dataset.id;
      console.log('Delete button clicked for story ID:', storyId);
      if (confirm('Apakah Anda yakin ingin menghapus cerita ini dari simpanan?')) {
        try {
          await deleteStory(storyId);
          const storyCard = btn.closest('.story-card');
          storyCard.remove();
          
          // Check if there are any stories left
          const remainingStories = container.querySelectorAll('.story-card');
          if (remainingStories.length === 0) {
            container.innerHTML = `
              <div class="saved-stories-page empty-state">
                <i class="far fa-bookmark" style="font-size: 48px; color: #C599B6;"></i>
                <h2>Belum ada cerita tersimpan</h2>
                <p>Simpan cerita favoritmu untuk dibaca kembali nanti</p>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error deleting story:', error);
          alert('Gagal menghapus cerita. Silakan coba lagi nanti.');
        }
      }
    });
  });
} 