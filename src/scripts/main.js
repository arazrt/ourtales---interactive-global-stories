import '../styles/styles.css';
import { Router } from './router/router';
import { AuthPresenter } from './presenters/auth-presenter';
import { HomePresenter } from './presenters/home-presenter';
import { AddPresenter } from './presenters/add-presenter';
import { DetailPresenter } from './presenters/detail-presenter';
import { setupOfflineHandling, isOnline } from './utils/db.js';

class App {
  static instance = null;

  constructor() {
    if (App.instance) {
      return App.instance;
    }
    App.instance = this;
    this.router = new Router();
    this.init();
  }

  async init() {
    await this.registerServiceWorker();
    this.setupEventListeners();
    this.setupOfflineHandling();
    this.router.init();
  }

  async registerServiceWorker() {
    // Only register service worker in production mode
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check if push notifications are supported
        if ('PushManager' in window) {
          console.log('Push notifications are supported');
        } else {
          console.warn('Push notifications are not supported');
        }

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });

        // Handle service worker errors
        registration.addEventListener('error', (error) => {
          console.error('Service Worker error:', error);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker registration skipped in development mode');
    }
  }

  setupOfflineHandling() {
    // Setup offline event handling
    setupOfflineHandling();

    // Add offline indicator to UI
    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background-color: #ff4444;
      color: white;
      border-radius: 4px;
      display: none;
      z-index: 1000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    offlineIndicator.textContent = 'You are offline';
    document.body.appendChild(offlineIndicator);

    // Update offline indicator based on connection status
    const updateOfflineIndicator = () => {
      offlineIndicator.style.display = isOnline() ? 'none' : 'block';
    };

    window.addEventListener('online', updateOfflineIndicator);
    window.addEventListener('offline', updateOfflineIndicator);
    updateOfflineIndicator(); // Initial state
  }

  setupEventListeners() {
    // Remove any existing event listeners
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      const newLogoutBtn = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      const confirmLogout = confirm("Apakah anda yakin ingin logout?");
      if (!confirmLogout) return;
      localStorage.clear();  
      this.router.navigate('login');
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
      if (event.state?.page === 'detail') {
        const detailPresenter = new DetailPresenter();
        detailPresenter.render(event.state.story, event.state.page);
      } else {
        this.router.handleRoute();
      }
    });

    // Handle hash changes (but not on initial load)
    let isInitialLoad = true;
    window.addEventListener('hashchange', () => {
      if (!isInitialLoad) {
        this.router.handleRoute();
      }
    });

    // Handle initial page load
    window.addEventListener('load', () => {
      isInitialLoad = false;
      this.router.handleRoute();
    });

    // Add offline-aware fetch handling
    const originalFetch = window.fetch;
    window.fetch = async (resource, options) => {
      try {
        const response = await originalFetch(resource, options);
        return response;
      } catch (error) {
        if (!isOnline()) {
          // Handle offline state
          console.log('Offline fetch attempt:', resource);
          // You can implement custom offline handling here
          // For example, queue the request for later
          if (options?.method === 'POST' || options?.method === 'PUT') {
            // Queue offline actions for later
            await queueOfflineAction({
              type: 'fetch',
              resource,
              options,
              timestamp: Date.now()
            });
          }
          // Return a graceful offline response
          return new Response(JSON.stringify({
            status: 'offline',
            message: 'You are offline. This action will be queued.',
            timestamp: Date.now()
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-Offline': 'true'
            }
          });
        }
        throw error;
      }
    };
  }
}

// Create a single instance of App
const app = new App();

