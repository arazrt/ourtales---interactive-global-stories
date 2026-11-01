export default class Map {
  constructor(selector, options = {}) {
      this.container = document.querySelector(selector);
      if (!this.container) {
          throw new Error(`Map container with selector "${selector}" not found.`);
      }

      if (this.container._leaflet_id) {
          this.container._leaflet_id = null; 
      }

      this.map = L.map(this.container).setView([0, 0], 2); 

      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      });

      const mapTilerLayer = L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=nVePt7G9IUwgfutEDIJM', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.maptiler.com/copyright/">MapTiler</a>',
    });
    

      osmLayer.addTo(this.map);

      L.control.layers({
          "OpenStreetMap": osmLayer,
          "MapTiler": mapTilerLayer
      }).addTo(this.map);

      if (options.locate) {
          this.map.locate({ setView: true, maxZoom: 15 });
          this.map.on('locationfound', (e) => {
              this.addMarker([e.latitude, e.longitude], {}, { content: 'Lokasimu Sekarang' });
          });
          this.map.on('locationerror', () => {
              console.warn('Lokasi tidak ditemukan.');
          });
      }
  }

  static async build(selector, options) {
      await new Promise((resolve) => {
          const check = () => {
              if (document.querySelector(selector)) resolve();
              else setTimeout(check, 50);
          };
          check();
      });

      return new Map(selector, options);
  }

  addMapEventListener(event, callback) {
      this.map.on(event, callback);
  }

  onClick(callback) {
    this.map.on('click', (e) => {
      callback(e); 
    });
  }  

  addMarker(coords, options = {}, popup = null) {
      const marker = L.marker(coords, options).addTo(this.map);
      if (popup?.content) {
          marker.bindPopup(popup.content).openPopup();
      }
      return marker;
  }

  setView(coords, zoom = 13) {
      this.map.setView(coords, zoom);
  }

  getMap() {
      return this.map;
  }
}
