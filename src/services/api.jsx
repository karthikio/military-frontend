import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
  me: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

export const purchaseAPI = {
  create: async (purchaseData) => {
    const response = await api.post('/purchases', purchaseData);
    return response.data;
  },
  list: async (params = {}) => {
    const response = await api.get('/purchases', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },
  update: async (id, purchaseData) => {
    const response = await api.put(`/purchases/${id}`, purchaseData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/purchases/${id}`);
    return response.data;
  },
};


export const transferAPI = {
  list: async (params = {}) => {
    const response = await api.get('/transfers', { params });
    return response.data;
  },
  
  createRequest: async (requestData) => {
    const response = await api.post('/transfers/requests', requestData);
    return response.data;
  },
  
  approve: async (id) => {
    const response = await api.put(`/transfers/${id}/approve`);
    return response.data;
  },
  
  listOpen: async () => {
    const response = await api.get('/transfers/open');
    return response.data;
  },
  
  claim: async (id, supplierData = {}) => {
    const response = await api.put(`/transfers/${id}/claim`, supplierData);
    return response.data;
  },
  
  send: async (id) => {
    const response = await api.put(`/transfers/${id}/send`);
    return response.data;
  },
  
  receive: async (id) => {
    const response = await api.put(`/transfers/${id}/receive`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/transfers/${id}`);
    return response.data;
  },
};


export const baseAPI = {
  list: async () => {
    const response = await api.get('/bases');
    return response.data;
  },
  getByCode: async (code) => {
    const response = await api.get(`/bases/${code}`);
    return response.data;
  },
  create: async (baseData) => {
    const response = await api.post('/bases', baseData);
    return response.data;
  },
  update: async (code, baseData) => {
    const response = await api.put(`/bases/${code}`, baseData);
    return response.data;
  },
  delete: async (code) => {
    const response = await api.delete(`/bases/${code}`);
    return response.data;
  },
};

export const equipmentAPI = {
  list: async (params = {}) => {
    const response = await api.get('/equipment', { params });
    return response.data;
  },
  getByCode: async (code) => {
    const response = await api.get(`/equipment/${code}`);
    return response.data;
  },
  create: async (equipmentData) => {
    const response = await api.post('/equipment', equipmentData);
    return response.data;
  },
  update: async (code, equipmentData) => {
    const response = await api.put(`/equipment/${code}`, equipmentData);
    return response.data;
  },
  delete: async (code) => {
    const response = await api.delete(`/equipment/${code}`);
    return response.data;
  },
};

export const expenditureAPI = {
  create: async (expenditureData) => {
    const response = await api.post('/expenditures', expenditureData);
    return response.data;
  },
  list: async (params = {}) => {
    const response = await api.get('/expenditures', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/expenditures/${id}`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/expenditures/${id}`);
    return response.data;
  },
};

export const dashboardAPI = {
  getBaseDashboard: async (baseCode = null) => {
    const params = baseCode ? { base: baseCode } : {};
    const response = await api.get('/dashboard/base', { params });
    return response.data;
  },
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};


export default api;
