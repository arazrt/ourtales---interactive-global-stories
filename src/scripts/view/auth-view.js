export class AuthView {
  constructor(container) {
    this.container = container;
    this.presenter = null;
    this.render();
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card" id="login-section">
          <h2>Masuk ke Our Tales</h2>
          <form id="login-form" aria-label="Form Login">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" name="login-email" autocomplete="username" required />
            <label for="login-password">Kata Sandi</label>
            <input type="password" id="login-password" name="login-password" autocomplete="current-password" required minlength="8" />
            <button type="submit">Masuk</button>
          </form>
          <p><a href="#" id="show-register">Belum punya akun?</a></p>
        </div>
        <div class="auth-card" id="register-section" style="display: none;">
          <h3>Daftar ke Our Tales</h3>
          <form id="register-form" aria-label="Form Registrasi">
            <label for="name">Nama</label>
            <input type="text" id="name" name="name" required />
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" name="reg-email" autocomplete="new-email" required />
            <label for="reg-password">Kata Sandi</label>
            <input type="password" id="reg-password" name="reg-password" autocomplete="new-password" required minlength="8" />
            <button type="submit">Daftar</button>
          </form>
          <p><a href="#" id="show-login">Sudah punya akun? Masuk</a></p>
        </div>
      </div>
      <div id="loading-overlay" class="fade-in" style="display: none;"></div>
    `;
    this.bindEvents();
  }

  bindEvents() {
    const loginForm = this.container.querySelector('#login-form');
    const registerForm = this.container.querySelector('#register-form');
    const loadingOverlay = this.container.querySelector('#loading-overlay');
    const loginSection = this.container.querySelector('#login-section');
    const registerSection = this.container.querySelector('#register-section');
    const showRegisterLink = this.container.querySelector('#show-register');
    const showLoginLink = this.container.querySelector('#show-login');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm['login-email'].value;
      const password = loginForm['login-password'].value;
      if (this.presenter) this.presenter.loginUser(email, password);
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = registerForm.name.value;
      const email = registerForm['reg-email'].value;
      const password = registerForm['reg-password'].value;
      if (this.presenter) this.presenter.registerUser(name, email, password);
    });

    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
    });

    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
    });
  }

  showLoading() {
    const overlay = this.container.querySelector('#loading-overlay');
    overlay.style.display = 'block';
    overlay.classList.add('fade-in');
    overlay.classList.remove('fade-out');
  }

  hideLoading() {
    const overlay = this.container.querySelector('#loading-overlay');
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 1000);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message fade-in';
    errorDiv.textContent = message;
    this.container.insertBefore(errorDiv, this.container.firstChild);
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message fade-in';
    successDiv.textContent = message;
    this.container.insertBefore(successDiv, this.container.firstChild);
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  navigateToHome() {
    location.hash = '#home';
  }
}
  