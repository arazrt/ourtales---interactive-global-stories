import { BasePresenter } from './base-presenter';
import { renderMap, renderMapError } from '../view/map-view';
import { getStoriesWithLocation } from '../api/story-api';
import { AuthModel } from '../models/auth-model';

export class MapPresenter extends BasePresenter {
  constructor() {
    super();
    this.authModel = new AuthModel();
  }

  async render() {
    try {
      const token = this.authModel.getToken();
      const allStories = await getStoriesWithLocation(token);
      renderMap(this.main, allStories);
    } catch (err) {
      console.error('Failed to fetch stories for map:', err);
      renderMapError(this.main);
    }
  }
} 