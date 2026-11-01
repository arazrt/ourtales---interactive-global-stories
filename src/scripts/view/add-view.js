import Map from '../utils/map.js';

export function renderAdd(container) {
  container.classList.add('fade-in');

  container.innerHTML = `
    <h2 style="text-align: center; margin-top: 100px;">Tambah Cerita Baru</h2>
    <form id="add-story-form" aria-label="Form Tambah Cerita">
      <label for="description">Deskripsi Cerita</label>
      <textarea id="description" required placeholder="Ketik cerita kamu disini"></textarea>
      
      <div style="display: flex; align-items: center; gap: 1rem; justify-content: center; margin-bottom: 1rem;">
        <button type="button" id="upload-photo-btn">Upload Foto</button>
        <span style="font-weight: bold;">atau</span>
        <button type="button" id="take-photo-btn">Ambil Gambar</button>
      </div>

      <div id="upload-photo-container" style="display: none; background-color:#F4CCE9; padding: 1rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); margin-bottom: 1rem;">
        <label for="photo" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Foto Cerita</label>
        <input type="file" id="photo" accept="image/*" style="padding: 0.5rem; border-radius: 5px; border: 1px solid #56021F;"/>
        <img id="uploaded-preview" style="display: none; margin-top: 1rem; max-width: 100%; border-radius: 8px;" alt="Preview foto yang diupload">
      </div>

      <div id="camera-container" style="display: none;">
        <video id="video" width="320" height="240" autoplay></video>
        <button type="button" id="capture-btn">Ambil Gambar</button>
        <canvas id="canvas" width="320" height="240" style="display: none;"></canvas>
        <img id="captured-image" style="display: none; margin-top: 1rem; max-width: 100%; border-radius: 8px;" alt="Hasil tangkapan kamera">
      </div>
      
      <label for="story-map">Lokasi Cerita</label>
      <div id="story-map" style="width: 100%; height: 300px;"></div>
      
      <input type="hidden" id="latitude" />
      <input type="hidden" id="longitude" />
      
      <button type="submit">Tambah Cerita</button>
    </form>
  `;
}

export function bindAddFormEvents({ onSubmit, onMapReady }) {
  const form = document.querySelector('#add-story-form');
  const uploadPhotoBtn = form.querySelector('#upload-photo-btn');
  const takePhotoBtn = form.querySelector('#take-photo-btn');
  const uploadPhotoContainer = form.querySelector('#upload-photo-container');
  const cameraContainer = form.querySelector('#camera-container');
  const captureBtn = form.querySelector('#capture-btn');
  const videoElement = form.querySelector('#video');
  const canvasElement = form.querySelector('#canvas');
  const capturedImage = form.querySelector('#captured-image');
  const uploadedPreview = form.querySelector('#uploaded-preview');
  const photoInput = form.querySelector('#photo');

  let currentImage = null;

  uploadPhotoBtn.addEventListener('click', () => {
    stopCamera();
    uploadPhotoContainer.style.display = 'block';
    cameraContainer.style.display = 'none';
    photoInput.required = true;
  });

  takePhotoBtn.addEventListener('click', () => {
    cameraContainer.style.display = 'block';
    uploadPhotoContainer.style.display = 'none';
    photoInput.required = false;
    startCamera();
  });

  captureBtn.addEventListener('click', () => {
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    currentImage = canvasElement.toDataURL('image/png');
    capturedImage.src = currentImage;
    capturedImage.style.display = 'block';
  });

  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedPreview.src = e.target.result;
        uploadedPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      uploadedPreview.style.display = 'none';
      uploadedPreview.src = '';
    }
  });

  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
        alert('Gagal mengakses kamera!');
      });
  }

  function stopCamera() {
    const stream = videoElement.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  }

  window.addEventListener('hashchange', stopCamera);
  window.addEventListener('beforeunload', stopCamera);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = form.querySelector('#description').value;
    const latitudeInput = form.querySelector('#latitude');
    const longitudeInput = form.querySelector('#longitude');
    const photo = form.querySelector('#photo').files[0];
    let lat = parseFloat(latitudeInput.value);
    let lon = parseFloat(longitudeInput.value);

    let photoBlob = null;

    if (isNaN(lat) || isNaN(lon)) {
      alert('Gagal mendapatkan lokasi pengguna!');
      return;
    }

    if (photo && photo.size > 1024 * 1024) {
      alert('Foto maksimal 1MB.');
      return;
    }

    if (photo) {
      photoBlob = photo;
    } else if (currentImage) {
      const byteString = atob(currentImage.split(',')[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }
      photoBlob = new Blob([uintArray], { type: 'image/png' });
    }

    if (!photoBlob) {
      alert('Silakan tambahkan foto cerita.');
      return;
    }

    onSubmit({
      description,
      lat,
      lon,
      photoBlob
    });
  });

  setTimeout(async () => {
    const latitudeInput = document.querySelector('#latitude');
    const longitudeInput = document.querySelector('#longitude');

    try {
      const mapInstance = await Map.build('#story-map');
      let marker = null;

      function setMarker(lat, lng, label = 'Lokasi Cerita') {
        if (marker) {
          mapInstance.getMap().removeLayer(marker);
        }
        marker = mapInstance.addMarker([lat, lng], {}, { content: label });
        latitudeInput.value = lat;
        longitudeInput.value = lng;
      }

      mapInstance.onClick((e) => {
        const { lat, lng } = e.latlng;
        setMarker(lat, lng, 'Lokasi Pilihan Anda');
      });

      onMapReady(mapInstance, setMarker);
    } catch (error) {
      console.error("Error building the map:", error);
    }
  }, 100);
}
