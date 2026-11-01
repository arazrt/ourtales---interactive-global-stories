import { AuthModel } from '../models/auth-model';

export class AuthPresenter {
  constructor(view) {
    this.model = new AuthModel();
    this.view = view;
  }

  async loginUser(email, password) {
    this.view.showLoading();
    const response = await this.model.login(email, password);
    this.view.hideLoading();
    if (response.error) {
      this.view.showError(response.message);
    } else {
      this.model.setToken(response.loginResult.token);
      this.view.showSuccess('Login berhasil!');
      this.view.navigateToHome();
    }
  }

  async registerUser(name, email, password) {
    this.view.showLoading();
    const response = await this.model.register(name, email, password);
    this.view.hideLoading();
    if (response.error) {
      this.view.showError(response.message);
    } else {
      this.view.showSuccess('Registrasi berhasil, silakan login.');
    }
  }
} 