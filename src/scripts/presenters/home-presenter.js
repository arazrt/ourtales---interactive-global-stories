import { BasePresenter } from './base-presenter';
import { renderHome, bindHomeEvents } from '../view/home-view';
import { logDebug, logError } from '../view/base-view';
import { StoryModel } from '../models/story-model';
import { DetailPresenter } from './detail-presenter';

export class HomePresenter extends BasePresenter {
  constructor() {
    super();
    this.model = new StoryModel();
  }

  async render() {
    try {
      logDebug('Rendering home page');
      const response = await this.model.getAllStories();
      logDebug('Got response', response);
      
      if (response && response.listStory) {
        // Pass offline information to the view if available
        const offlineInfo = response.offline ? {
          offline: !navigator.onLine,
          message: response.message
        } : null;
        
        renderHome(this.main, response.listStory, offlineInfo);
      } else {
        this.showError('Format data tidak valid');
      }
    } catch (error) {
      logError('Error rendering home', error);
      this.showError('Gagal memuat cerita');
    }
  }
}
