import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Export for direct fetch usage (e.g., in components that need custom fetch calls)
export const API_BASE_URL = API_URL;

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    if (typeof window !== 'undefined') {
      this.client.interceptors.request.use((config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });
    }
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/admin/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('admin_token', response.data.access_token);
    }
    return response.data;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  // Drivers
  async getDrivers() {
    const response = await this.client.get('/admin/drivers');
    return response.data;
  }

  async getActiveDrivers() {
    const response = await this.client.get('/admin/drivers/active');
    return response.data;
  }

  async updateDriverStatus(driverId: string, status: string) {
    const response = await this.client.patch(`/admin/drivers/${driverId}/status`, { status });
    return response.data;
  }

  // View driver funds (read-only)
  async getDriversWithFunds() {
    const response = await this.client.get('/admin/drivers/funds');
    return response.data;
  }

  // Note: Manual fund addition methods have been removed
  // Admins can only approve/reject fund requests submitted by drivers

  // Users
  async getUsers() {
    const response = await this.client.get('/admin/users');
    return response.data;
  }

  async blockUser(userId: string) {
    const response = await this.client.patch(`/admin/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId: string) {
    const response = await this.client.patch(`/admin/users/${userId}/unblock`);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/admin/users/${userId}`);
    return response.data;
  }

  // Rides
  async getActiveRides() {
    const response = await this.client.get('/admin/rides/active');
    return response.data;
  }

  async getAllRides() {
    const response = await this.client.get('/admin/rides');
    return response.data;
  }

  // Config
  async getAllConfig() {
    const response = await this.client.get('/admin/config');
    return response.data;
  }

  async getConfigByName(name: string) {
    const response = await this.client.get(`/admin/config/${name}`);
    return response.data;
  }

  async updateConfig(name: string, value: string) {
    const response = await this.client.patch(`/admin/config/${name}`, { value });
    return response.data;
  }

  async bulkUpdateConfig(updates: Array<{ name: string; value: string }>) {
    const response = await this.client.patch('/admin/config', { updates });
    return response.data;
  }

  // Ride Cleanup Management
  async getStuckRides() {
    const response = await this.client.get('/admin/rides/stuck');
    return response.data;
  }

  async manualCleanup() {
    const response = await this.client.post('/admin/rides/cleanup');
    return response.data;
  }

  async getCleanupStats() {
    const response = await this.client.get('/admin/rides/cleanup-stats');
    return response.data;
  }
}

export const apiService = new ApiService();

