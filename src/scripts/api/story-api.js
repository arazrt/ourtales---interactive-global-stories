export async function getStoriesWithLocation(token, page = 1, size = 100) {
  const url = `https://story-api.dicoding.dev/v1/stories?page=${page}&size=${size}&location=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.listStory;
}

export async function addStory(formData) {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
    }

    const file = formData.get('photo'); 
    if (file && file.size > 1048576) {  
      throw new Error('Ukuran file foto terlalu besar. Maksimal 1MB.');
    }
    
    if (!file) {
      throw new Error('File foto diperlukan.');
    }

    const res = await fetch('https://story-api.dicoding.dev/v1/stories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Terjadi kesalahan saat menambahkan cerita.');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error adding story:', err);
    throw err; 
  }
}

export async function getStoryById(id, token) {
  try {
    const res = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || `Terjadi kesalahan saat mengambil cerita dengan ID: ${id}`);
    }

    const data = await res.json();
    return data.story; 
  } catch (err) {
    console.error('Error fetching story detail:', err);
    throw err;
  }
}

export async function getAllStories(token, page = 1, size = 10) {
  const url = `https://story-api.dicoding.dev/v1/stories?page=${page}&size=${size}&location=0`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data = await res.json();
  return data.listStory;
}

export async function addGuestStory(formData) {
  try {
    const res = await fetch('https://story-api.dicoding.dev/v1/stories/guest', {
      method: 'POST',
      body: formData, 
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Terjadi kesalahan saat menambahkan cerita.');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error adding guest story:', err);
    throw err;
  }
}
