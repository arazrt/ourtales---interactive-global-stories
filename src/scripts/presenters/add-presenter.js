import { BasePresenter } from './base-presenter';
import { renderAdd, bindAddFormEvents } from '../view/add-view';
import { updateMapView, handleGeolocation } from '../view/map-view';
import { navigateToHome, logDebug, logError } from '../view/base-view';
import { StoryModel } from '../models/story-model';
import { AuthModel } from '../models/auth-model';

export class AddPresenter extends BasePresenter {
  constructor() {
    super();
    this.model = new StoryModel();
    this.authModel = new AuthModel();
  }

  render() {
    renderAdd(this.main);
    this.attachEventListeners();
  }

  attachEventListeners() {
    bindAddFormEvents({
      onSubmit: async ({ description, lat, lon, photoBlob }) => {
        try {
          const formData = new FormData();
          formData.append('description', description);
          formData.append('lat', lat);
          formData.append('lon', lon);
          formData.append('photo', photoBlob, 'photo.png');

          logDebug('description', formData.get('description'));
          logDebug('lat', formData.get('lat'));
          logDebug('lon', formData.get('lon'));
          logDebug('photo', formData.get('photo'));
          logDebug('photo type', formData.get('photo')?.type);
          logDebug('photo size (bytes)', formData.get('photo')?.size);

          const token = this.authModel.getToken();
          let response;

          if (token) {
            response = await this.model.addStory(formData);
          } else {
            response = await this.model.addGuestStory(formData);
          }

          if (response?.error) {
            this.showError(response.message || 'Terjadi kesalahan saat menambahkan cerita.');
          } else {
            this.showSuccess('Cerita berhasil ditambahkan!');
            navigateToHome();
          }
        } catch (error) {
          this.showError('Gagal menambahkan cerita');
          logError('Error saat submit', error);
        }
      },
      onMapReady: (mapInstance, setMarker) => {
        handleGeolocation(
          ({ lat, lng }) => {
            updateMapView(mapInstance, lat, lng);
            setMarker(lat, lng, 'Lokasi Anda');
          },
          (error) => {
            logError('Gagal mendapatkan lokasi', error);
            this.showError('Gagal mengakses lokasi. Pastikan izin lokasi telah diberikan.');
          }
        );
      }
    });
  }
}
