import api from './api';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
  access_justification: string;
  requested_role_id: number;
  requested_area_id?: number;
}

export interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    phone: string;
    organization: string;
    department: string;
    position: string;
    access_justification: string;
    role: {
      id: number;
      name: string;
      role_type: string;
    };
    area?: {
      id: number;
      name: string;
    };
    approval_status: string;
  };
  date_joined: string;
}

export interface ApprovalData {
  action: 'approve' | 'reject';
  role_id?: number;
  area_id?: number;
  rejection_reason?: string;
}

const DEMO_MODE = false;

export const userService = {
  register: async (data: RegisterData) => {
    const { data: response } = await api.post('/users/users/register/', data);
    return response;
  },

  verifyEmail: async (token: string) => {
    const { data } = await api.post('/users/users/verify-email/', { token });
    return data;
  },

  getPendingApprovals: async (): Promise<PendingUser[]> => {
    const { data } = await api.get('/users/users/pending-approvals/');
    return data;
  },

  approveReject: async (userId: number, approvalData: ApprovalData) => {
    const { data } = await api.post(`/users/users/${userId}/approve-reject/`, approvalData);
    return data;
  },

  getAllUsers: async () => {
    const { data } = await api.get('/users/users/');
    return data;
  },

  getRoles: async () => {
    const { data } = await api.get('/users/roles/');
    return data;
  },

  getAreas: async () => {
    const { data } = await api.get('/users/areas/');
    return data;
  },
};
