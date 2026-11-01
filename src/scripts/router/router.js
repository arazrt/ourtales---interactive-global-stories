import { AuthPresenter } from '../presenters/auth-presenter';
import { HomePresenter } from '../presenters/home-presenter';
import { AddPresenter } from '../presenters/add-presenter';
import { DetailPresenter } from '../presenters/detail-presenter';
import { MapPresenter } from '../presenters/map-presenter';
import { AuthView } from '../view/auth-view';
import { getMainContainer } from '../view/base-view';
import { subscribeUser, unsubscribeUser } from '../utils/push';
import { renderHome } from '../view/home-view';
import { renderStoryDetail } from '../view/detail-view';
import { renderSavedStories } from '../view/saved-view';

export class Router {
  constructor() {
    this.routes = {
      login: () => {
        const container = getMainContainer();
        const view = new AuthView(container);
        const presenter = new AuthPresenter(view);
        view.setPresenter(presenter);
      },
      home: () => new HomePresenter().render(),
      add: () => new AddPresenter().render(),
      story: (id) => new DetailPresenter().render(id),
      map: () => new MapPresenter().render(),
      saved: () => renderSavedStories(getMainContainer()),
      '/': renderHome,
      '/story/:id': renderStoryDetail,
      '/saved': renderSavedStories
    };
  }

  init() {
    this.handleRoute();
    this.setupNotificationIcon();
  }

  async setupNotificationIcon() {
    // Create notification icon if it doesn't exist
    if (!document.getElementById('notification-toggle')) {
      const navDiv = document.querySelector('nav > div');
      const notificationBtn = document.createElement('button');
      notificationBtn.id = 'notification-toggle';
      notificationBtn.style.cssText = 'margin-right: 1rem; background: none; border: none; padding: 0; cursor: pointer; display: none;';
      notificationBtn.innerHTML = `
        <i class="far fa-bell" aria-hidden="true" style="color: white;"></i>
        <span class="sr-only">Toggle Notifikasi</span>
      `;
      
      // Insert before login link
      const loginLink = document.getElementById('login-link');
      navDiv.insertBefore(notificationBtn, loginLink);

      // Add click handler
      notificationBtn.addEventListener('click', async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            await unsubscribeUser();
            this.updateNotificationIcon(false);
            alert('Notifikasi berhasil dimatikan');
          } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              await subscribeUser();
              this.updateNotificationIcon(true);
              alert('Notifikasi berhasil diaktifkan');
            } else {
              alert('Izin notifikasi ditolak. Silakan aktifkan notifikasi di pengaturan browser Anda.');
            }
          }
        } catch (err) {
          console.error('Error toggling notifications:', err);
          alert('Terjadi kesalahan saat mengubah status notifikasi');
        }
      });
    }

    // Check initial subscription state
    await this.checkNotificationState();
  }

  async checkNotificationState() {
    const isLoggedIn = !!localStorage.getItem('token');
    const toggleBtn = document.getElementById('notification-toggle');
    
    if (toggleBtn) {
      toggleBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
      
      if (isLoggedIn && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          this.updateNotificationIcon(!!subscription);
          
          // Show initial state alert
          if (subscription && !localStorage.getItem('notifAlertShown')) {
            alert('Notifikasi sudah aktif');
            localStorage.setItem('notifAlertShown', 'true');
          }          
        } catch (err) {
          console.error('Error checking notification state:', err);
          this.updateNotificationIcon(false);
        }
      }
    }
  }

  updateNotificationIcon(isSubscribed) {
    const toggleBtn = document.getElementById('notification-toggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isSubscribed ? 'fas fa-bell' : 'far fa-bell';
        icon.style.color = isSubscribed ? '#FAD0C4' : 'white';
      }
    }
  }

  handleRoute() {
    const hash = location.hash.slice(1) || 'home';
    const isLoggedIn = !!localStorage.getItem('token');
    
    if (hash.startsWith('story/')) {
      // Split on ? to separate the ID from query params
      const [path, queryString] = hash.split('?');
      const storyId = path.split('/')[1];
      console.log('Router: Handling story route with ID:', storyId, 'and query:', queryString);
      this.routes.story(storyId);
      return;
    }

    if ((hash === 'home' || hash === 'map' || hash === 'saved') && !isLoggedIn) {
      this.navigate('login');
      return;
    }
    
    const route = this.routes[hash];
    
    if (route) {
      route();
    } else {
      this.navigate('home');
    }
    
    this.updateNavbar();
    this.checkNotificationState();
  }

  navigate(route) {
    location.hash = route;
  }

  updateNavbar() {
    const isLoggedIn = !!localStorage.getItem('token');
    const logoutBtn = document.getElementById('logout-btn');
    const loginLink = document.getElementById('login-link');
    const savedLink = document.getElementById('saved-link');
    
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'inline-block';
    if (savedLink) savedLink.style.display = isLoggedIn ? 'inline-block' : 'none';
  }
} 