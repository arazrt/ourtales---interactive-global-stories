import { renderHome } from './scripts/view/home-view.js';
import { renderAdd } from './scripts/view/add-view.js';
import { renderDetail } from './scripts/view/detail-view.js';
import { renderLogin } from './scripts/view/auth-view.js';

export function routeTo() {
  const hash = location.hash || '#home'; 
  const app = document.getElementById('app');

  if (!app) return; 

  document.startViewTransition(() => {
    if (hash.startsWith('#home')) {
      renderHome(app);
    } else if (hash.startsWith('#add')) {
      renderAdd(app);
    } else if (hash.startsWith('#detail')) {
      const id = hash.split('/')[1]; 
      renderDetail(app, id);
    } else if (hash.startsWith('#login')) {
      renderLogin(app);
    } else {
      app.innerHTML = '<p>Halaman tidak ditemukan</p>';
    }
  });
}
