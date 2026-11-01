const DB_NAME = 'ourTalesDB';
const DB_VERSION = 2;
const STORES = {
  SAVED_STORIES: 'savedStories',
  CACHED_STORIES: 'cachedStories',
  USER_PREFERENCES: 'userPreferences',
  OFFLINE_QUEUE: 'offlineQueue'
};

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.SAVED_STORIES)) {
        const savedStore = db.createObjectStore(STORES.SAVED_STORIES, { keyPath: 'id' });
        savedStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CACHED_STORIES)) {
        const cachedStore = db.createObjectStore(STORES.CACHED_STORIES, { keyPath: 'id' });
        cachedStore.createIndex('timestamp', 'timestamp', { unique: false });
        cachedStore.createIndex('category', 'category', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        const prefsStore = db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
        prefsStore.createIndex('type', 'type', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        queueStore.createIndex('type', 'type', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const saveStory = async (story) => {
  console.log('Saving story to IndexedDB:', story);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SAVED_STORIES], 'readwrite');
    const store = transaction.objectStore(STORES.SAVED_STORIES);
    
    const storyWithTimestamp = {
      ...story,
      timestamp: new Date().getTime()
    };
    console.log('Story with timestamp:', storyWithTimestamp);

    const request = store.put(storyWithTimestamp);

    request.onsuccess = () => {
      console.log('Successfully saved story to IndexedDB');
      resolve(storyWithTimestamp);
    };
    request.onerror = () => {
      console.error('Error saving story to IndexedDB:', request.error);
      reject(request.error);
    };
  });
};

export const deleteStory = async (storyId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SAVED_STORIES], 'readwrite');
    const store = transaction.objectStore(STORES.SAVED_STORIES);
    const request = store.delete(storyId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllSavedStories = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SAVED_STORIES], 'readonly');
    const store = transaction.objectStore(STORES.SAVED_STORIES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const isStorySaved = async (storyId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SAVED_STORIES], 'readonly');
    const store = transaction.objectStore(STORES.SAVED_STORIES);
    const request = store.get(storyId);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
};

export const cacheStory = async (story) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_STORIES], 'readwrite');
    const store = transaction.objectStore(STORES.CACHED_STORIES);
    const request = store.put({
      ...story,
      timestamp: Date.now(),
      cached: true
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCachedStories = async (category = null) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_STORIES], 'readonly');
    const store = transaction.objectStore(STORES.CACHED_STORIES);
    let request;

    if (category) {
      const index = store.index('category');
      request = index.getAll(category);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCachedStory = async (storyId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_STORIES], 'readonly');
    const store = transaction.objectStore(STORES.CACHED_STORIES);
    const request = store.get(storyId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveUserPreference = async (pref) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORES.USER_PREFERENCES);
    const request = store.put({
      ...pref,
      timestamp: Date.now()
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getUserPreferences = async (type = null) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.USER_PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORES.USER_PREFERENCES);
    let request;

    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const queueOfflineAction = async (action) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.add({
      ...action,
      timestamp: Date.now(),
      status: 'pending'
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getOfflineQueue = async (type = null) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.OFFLINE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    let request;

    if (type) {
      const index = store.index('type');
      request = index.getAll(type);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearOfflineQueue = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.OFFLINE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_QUEUE);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const isOnline = () => {
  return navigator.onLine;
};

export const setupOfflineHandling = () => {
  window.addEventListener('online', async () => {
    try {
      const queue = await getOfflineQueue();
      if (queue.length > 0) {
        console.log('Processing offline queue...');
        await clearOfflineQueue();
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  });

  window.addEventListener('offline', () => {
    console.log('Application is offline');
  });
};

export const getSavedStory = async (storyId) => {
  console.log('Getting saved story from IndexedDB:', storyId);
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SAVED_STORIES], 'readonly');
    const store = transaction.objectStore(STORES.SAVED_STORIES);
    const request = store.get(storyId);

    request.onsuccess = () => {
      console.log('Saved story result:', request.result);
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('Error getting saved story:', request.error);
      reject(request.error);
    };
  });
};