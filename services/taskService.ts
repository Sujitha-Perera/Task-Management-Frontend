import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt?: string;
  userEmail?: string;
  userName?: string;
}

export interface TaskPage {
  content: Task[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  sortBy?: string;
  direction?: string;
  page?: number;
  size?: number;
}

export interface UserInfo {
  email: string;
  name: string;
  role: string;
}

const taskService = {
  getTasks: async (params: TaskFilters): Promise<TaskPage | Task[]> => {
    const response = await api.get('/api/tasks', { params });
    return response.data;
  },
  getTaskById: async (id: number | string): Promise<Task> => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },
  createTask: async (taskData: Partial<Task> & { assignedUserEmail?: string }): Promise<Task> => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  updateTask: async (id: number | string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id: number | string): Promise<void> => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
  markComplete: async (id: number | string, taskData: Partial<Task>): Promise<Task> => {
    const payload = { ...taskData, status: 'DONE' };
    const response = await api.put(`/api/tasks/${id}`, payload);
    return response.data;
  },
  getAllUsers: async (): Promise<UserInfo[]> => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },
};

export default taskService;
