import { BasePresenter } from './base-presenter';
import { renderStoryDetail, renderStoryDetailError } from '../view/detail-view';
import { navigateBack } from '../view/base-view';
import { StoryModel } from '../models/story-model';

export class DetailPresenter extends BasePresenter {
  constructor() {
    super();
    this.model = new StoryModel();
  }

  async render(storyId) {
    try {
      console.log('DetailPresenter: Rendering story with ID:', storyId);
      console.log('URL params:', new URLSearchParams(window.location.hash.split('?')[1]));
      
      const story = await this.model.getStoryById(storyId);
      console.log('DetailPresenter: Got story data:', story);
      
      const locationName = story.lat && story.lon ? 
        await this.model.getLocationName(story.lat, story.lon) : 
        'Lokasi tidak tersedia';
      
      console.log('DetailPresenter: Got location name:', locationName);
      
      await renderStoryDetail(this.main, {
        story,
        locationName,
        onBack: () => {
          navigateBack();
        }
      });
    } catch (error) {
      console.error('DetailPresenter: Error rendering story detail:', error);
      console.error('Error stack:', error.stack);
      renderStoryDetailError(this.main);
    }
  }
}