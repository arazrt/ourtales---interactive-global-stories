import { API_BASE_URL } from '../config';
import { addGuestStory } from '../api/story-api';
import { getCachedStories, cacheStory, isOnline, getCachedStory, getSavedStory } from '../utils/db';

export class StoryModel {
  async getAllStories() {
    const STORY_LIMIT = 12; // Consistent limit for both online and offline modes
    
    try {
      console.log('Fetching all stories without pagination');
      
      // Check if we're online
      if (!isOnline()) {
        console.log('Offline mode: fetching from cache');
        const cachedStories = await getCachedStories();
        
        if (cachedStories && cachedStories.length > 0) {
          // Sort cached stories by timestamp (newest first) and limit to STORY_LIMIT
          const sortedStories = cachedStories
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, STORY_LIMIT);
            
          return {
            listStory: sortedStories,
            pageInfo: {
              hasNextPage: false,
              hasPrevPage: false,
              currentPage: 1,
              pageSize: STORY_LIMIT
            },
            offline: true,
            message: 'Showing cached stories while offline'
          };
        }
        
        // If no cached stories, return empty list with offline message
        return {
          listStory: [],
          pageInfo: {
            hasNextPage: false,
            hasPrevPage: false,
            currentPage: 1,
            pageSize: 0
          },
          offline: true,
          message: 'You are offline. No cached stories available.'
        };
      }

      // Online mode: fetch from API
      const response = await fetch(`${API_BASE_URL}/stories?size=${STORY_LIMIT}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.listStory || !Array.isArray(data.listStory)) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      // Cache the stories for offline use
      data.listStory.forEach(story => {
        cacheStory(story).catch(err => 
          console.error('Error caching story:', err)
        );
      });

      return {
        listStory: data.listStory.slice(0, STORY_LIMIT),
        pageInfo: {
          hasNextPage: false,
          hasPrevPage: false,
          currentPage: 1,
          pageSize: STORY_LIMIT,
        }
      };
    } catch (error) {
      console.error('Error fetching stories:', error);
      
      // If we're offline and there was an error, try to get cached stories
      if (!isOnline()) {
        try {
          const cachedStories = await getCachedStories();
          if (cachedStories && cachedStories.length > 0) {
            // Sort cached stories by timestamp (newest first) and limit to STORY_LIMIT
            const sortedStories = cachedStories
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, STORY_LIMIT);
              
            return {
              listStory: sortedStories,
              pageInfo: {
                hasNextPage: false,
                hasPrevPage: false,
                currentPage: 1,
                pageSize: STORY_LIMIT
              },
              offline: true,
              message: 'Showing cached stories while offline'
            };
          }
        } catch (cacheError) {
          console.error('Error fetching cached stories:', cacheError);
        }
      }
      
      throw new Error('Gagal memuat cerita');
    }
  }

  async getStoryById(id) {
    try {
      console.log('Getting story by ID:', id);
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const isFromSavedStories = urlParams.get('source') === 'saved';
      console.log('Is from saved stories:', isFromSavedStories);

      // If coming from saved stories, try to get from saved stories store first
      if (isFromSavedStories) {
        console.log('Attempting to get story from saved stories store');
        const savedStory = await getSavedStory(id);
        console.log('Saved story result:', savedStory);
        if (savedStory) {
          console.log('Found story in saved stories store');
          return savedStory;
        }
        console.log('Story not found in saved stories store');
      }

      // Check if we're offline
      if (!isOnline()) {
        console.log('Offline mode: fetching story from cache');
        const cachedStory = await getCachedStory(id);
        console.log('Cached story result:', cachedStory);
        
        if (cachedStory) {
          console.log('Found story in cache');
          return cachedStory;
        }
        
        console.log('Story not found in cache');
        throw new Error('Story not found in cache');
      }

      // Online mode: fetch from API
      console.log('Online mode: fetching from API');
      const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }

      const data = await response.json();
      console.log('API response:', data);
      
      // Cache the story for offline use
      await cacheStory(data.story).catch(err => 
        console.error('Error caching story:', err)
      );

      return data.story;
    } catch (error) {
      console.error('Error in getStoryById:', error);
      // If we're offline and there was an error, try to get from cache again
      if (!isOnline()) {
        try {
          const cachedStory = await getCachedStory(id);
          if (cachedStory) {
            return cachedStory;
          }
        } catch (cacheError) {
          console.error('Error fetching cached story:', cacheError);
        }
      }
      
      throw new Error('Gagal memuat detail cerita');
    }
  }

  async addStory(storyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: storyData, 
      });

      if (!response.ok) {
        throw new Error('Failed to add story');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: true,
        message: 'Gagal menambahkan cerita',
      };
    }
  }

  async addGuestStory(storyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/guest`, {
        method: 'POST',
        body: storyData, 
      });

      if (!response.ok) {
        throw new Error('Failed to add guest story');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: true,
        message: 'Gagal menambahkan cerita tamu',
      };
    }
  }

  async getLocationName(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.display_name || 'Lokasi tidak tersedia';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Lokasi tidak tersedia';
    }
  }
}
