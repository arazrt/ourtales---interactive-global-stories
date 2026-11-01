import { API_BASE_URL } from '../config';

export class AuthModel {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Email atau password salah',
        };
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        error: true,
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      };
    }
  }

  async register(name, email, password) {
    try {
      // Validate input
      if (!name || !email || !password) {
        return {
          error: true,
          message: 'Semua field harus diisi',
        };
      }

      if (password.length < 6) {
        return {
          error: true,
          message: 'Password minimal 6 karakter',
        };
      }

      if (!email.includes('@')) {
        return {
          error: true,
          message: 'Email tidak valid',
        };
      }

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: true,
          message: data.message || 'Gagal melakukan registrasi',
        };
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      return {
        error: true,
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
      };
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }
} 