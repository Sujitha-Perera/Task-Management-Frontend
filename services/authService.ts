import api from './api';

export interface UserCredentials {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

const authService = {
  register: async (userData: UserCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: UserCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },
};

export default authService;
