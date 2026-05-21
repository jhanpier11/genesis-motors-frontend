<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Catálogo de Servicios</h2>
      <button class="btn btn-primary" @click="showForm = true" v-if="isAdmin">
        <i class="fas fa-plus"></i> Nuevo Servicio
      </button>
    </div>

    <div class="row">
      <div class="col-md-4 mb-3" v-for="service in services" :key="service.id">
        <div class="card h-100 service-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title">{{ service.nombre }}</h5>
              <span class="badge bg-primary">S/ {{ service.costo_estandar }}</span>
            </div>
            <p class="card-text text-muted">{{ service.descripcion || 'Sin descripción' }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="fas fa-clock"></i> {{ service.tiempo_estimado || 'N/D' }} min
              </small>
              <div v-if="isAdmin">
                <button class="btn btn-sm btn-warning me-1" @click="editService(service)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteService(service.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="services.length === 0" class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-tools fa-3x text-muted mb-3"></i>
          <h4>No hay servicios registrados</h4>
          <p class="text-muted">Los servicios aparecerán aquí cuando sean creados</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar servicio -->
    <div v-if="showForm" class="modal-backdrop" @click="closeForm"></div>
    <div v-if="showForm" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-wrench"></i>
              {{ editingService ? 'Editar Servicio' : 'Nuevo Servicio' }}
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveService">
              <div class="mb-3">
                <label class="form-label">Nombre del Servicio *</label>
                <input v-model="form.nombre" type="text" class="form-control" 
                  placeholder="Ej: Cambio de Aceite" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea v-model="form.descripcion" class="form-control" rows="3" 
                  placeholder="Describa el servicio..."></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Costo Estándar (S/) *</label>
                  <input v-model="form.costo_estandar" type="number" class="form-control" 
                    step="0.01" min="0" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tiempo Estimado (minutos)</label>
                  <input v-model="form.tiempo_estimado" type="number" class="form-control" 
                    min="0">
                </div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'import.meta.env.VITE_APP_API_URL';

export default {
  name: 'ServiceList',
  data() {
    return {
      services: [],
      showForm: false,
      editingService: null,
      loading: false,
      error: '',
      isAdmin: false,
      form: {
        nombre: '',
        descripcion: '',
        costo_estandar: '',
        tiempo_estimado: ''
      }
    }
  },
  created() {
    this.checkRole();
    this.loadServices();
  },
  methods: {
    checkRole() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.isAdmin = user.rol === 'admin';
    },
    async loadServices() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.services = response.data.services;
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      }
    },
    editService(service) {
      this.editingService = service;
      this.form = {
        nombre: service.nombre,
        descripcion: service.descripcion || '',
        costo_estandar: service.costo_estandar,
        tiempo_estimado: service.tiempo_estimado || ''
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
      this.editingService = null;
      this.error = '';
      this.form = {
        nombre: '',
        descripcion: '',
        costo_estandar: '',
        tiempo_estimado: ''
      };
    },
    async saveService() {
      this.loading = true;
      this.error = '';
      
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        if (this.editingService) {
          await axios.put(`${API_URL}/services/${this.editingService.id}`, this.form, config);
        } else {
          await axios.post(`${API_URL}/services`, this.form, config);
        }
        
        this.closeForm();
        this.loadServices();
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al guardar servicio';
      } finally {
        this.loading = false;
      }
    },
    async deleteService(id) {
      if (!confirm('¿Está seguro de desactivar este servicio?')) return;
      
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.loadServices();
      } catch (error) {
        alert('Error al eliminar servicio');
      }
    }
  }
}
</script>

<style scoped>
.service-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.modal.show {
  display: block;
}
</style>