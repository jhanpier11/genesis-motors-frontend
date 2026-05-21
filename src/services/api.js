import axios from 'axios';

const API_URL =
  process.env.VUE_APP_API_URL ||
  'https://genesis-motors-backend-9nr6.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
(config)=>{
const token=localStorage.getItem('token');

if(token){
config.headers.Authorization=`Bearer ${token}`;
}

return config;

},
(error)=>Promise.reject(error)
);

api.interceptors.response.use(

(response)=>response,

(error)=>{

if(error.response?.status===401){

localStorage.removeItem('token');
localStorage.removeItem('user');

if(window.location.pathname!='/login'){
window.location.href='/login';
}

}

return Promise.reject(error);

}

);

export default api;

// ======================
// AUTH
// ======================

export const authService = {
  login: (credentials) =>
    api.post('/auth/login', credentials),

  register: (userData) =>
    api.post('/auth/register', userData),

  getProfile: () =>
    api.get('/auth/me')
};

// ======================
// CLIENTES
// ======================

export const clientService = {
  getAll: (params = {}) =>
    api.get('/clients', { params }),

  getById: (id) =>
    api.get(`/clients/${id}`),

  create: (data) =>
    api.post('/clients', data),

  update: (id, data) =>
    api.put(`/clients/${id}`, data),

  delete: (id) =>
    api.delete(`/clients/${id}`)
};

// ======================
// VEHICULOS
// ======================

export const vehicleService = {
  getAll: (params = {}) =>
    api.get('/vehicles', { params }),

  getById: (id) =>
    api.get(`/vehicles/${id}`),

  create: (data) =>
    api.post('/vehicles', data),

  update: (id, data) =>
    api.put(`/vehicles/${id}`, data),

  delete: (id) =>
    api.delete(`/vehicles/${id}`)
};

// ======================
// CITAS
// ======================

export const appointmentService = {
  getAll: (params = {}) =>
    api.get('/appointments', { params }),

  getById: (id) =>
    api.get(`/appointments/${id}`),

  create: (data) =>
    api.post('/appointments', data),

  updateStatus: (id, data) =>
    api.patch(`/appointments/${id}/status`, data),

  cancel: (id, motivo) =>
    api.patch('/appointments/${id}/cancel', { motivo })
};

// ======================
// ORDENES
// ======================

export const workOrderService = {
  getAll: (params = {}) =>
    api.get('/work-orders', { params }),

  getById: (id) =>
    api.get(`/work-orders/${id}`),

  create: (data) =>
    api.post('/work-orders', data),

  updateStatus: (id, data) =>
    api.patch(`/work-orders/${id}/status`, data),

  assignMechanic: (id, mecanico_id) =>
    api.patch(
      `/work-orders/${id}/assign`,
      { mecanico_id }
    ),

  addServices: (id, servicios) =>
    api.post(
      `/work-orders/${id}/services`,
      { servicios }
    )
};

// ======================
// SERVICIOS
// ======================

export const serviceService = {
  getAll: () =>
    api.get('/services'),

  create: (data) =>
    api.post('/services', data),

  update: (id, data) =>
    api.put(`/services/${id}`, data),

  delete: (id) =>
    api.delete(`/services/${id}`)
};

// ======================
// USUARIOS
// ======================

export const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getMechanics: () => api.get('/users/mechanics'),

  // NUEVOS MÉTODOS PARA PERFIL
  updateProfile: (data) => api.put('/users/profile/update', data),
  changePassword: (data) => api.put('/users/change-password', data)
};
// ======================
// DASHBOARD
// ======================

export const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats')
};