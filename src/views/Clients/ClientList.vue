<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Clientes</h2>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Nuevo Cliente
      </button>
    </div>

    <!-- Buscador -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="input-group">
          <span class="input-group-text"><i class="fas fa-search"></i></span>
          <input 
            v-model="search" 
            type="text" 
            class="form-control" 
            placeholder="Buscar por nombre, email o teléfono..."
            @input="loadClients"
          >
        </div>
      </div>
    </div>

    <!-- Tabla de clientes -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Vehículos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in clients" :key="client.id">
                <td>{{ client.nombre }}</td>
                <td>{{ client.telefono || 'N/A' }}</td>
                <td>{{ client.email || 'N/A' }}</td>
                <td>
                  <span class="badge bg-info">{{ client.vehicles?.length || 0 }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="editClient(client)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteClient(client.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="clients.length === 0">
                <td colspan="5" class="text-center">No hay clientes registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar cliente -->
    <div v-if="showForm" class="modal-backdrop" @click="closeForm"></div>
    <div v-if="showForm" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingClient ? 'Editar Cliente' : 'Nuevo Cliente' }}</h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveClient">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input v-model="form.nombre" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input v-model="form.telefono" type="text" class="form-control">
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control">
              </div>
              <div class="mb-3">
                <label class="form-label">Dirección</label>
                <textarea v-model="form.direccion" class="form-control" rows="2"></textarea>
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

import { swal } from '@/services/swal';

import api from '@/services/api';

export default {
  name: 'ClientList',
  data() {
    return {
      clients: [],
      search: '',
      showForm: false,
      editingClient: null,
      loading: false,
      error: '',
      form: {
        nombre: '',
        telefono: '',
        email: '',
        direccion: ''
      }
    }
  },
  created() {
    this.loadClients();
  },
  methods: {
    async loadClients() {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/clients', {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: this.search }
        });
        this.clients = response.data.clients;
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    },
    editClient(client) {
      this.editingClient = client;
      this.form = {
        nombre: client.nombre,
        telefono: client.telefono || '',
        email: client.email || '',
        direccion: client.direccion || ''
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
      this.editingClient = null;
      this.error = '';
      this.form = {
        nombre: '',
        telefono: '',
        email: '',
        direccion: ''
      };
    },
    async saveClient() {
      this.loading = true;
      this.error = '';
      
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        if (this.editingClient) {
          await axios.put(`${API_URL}/clients/${this.editingClient.id}`, this.form, config);
        } else {
          await axios.post(`${API_URL}/clients`, this.form, config);
        }
        
        this.closeForm();
        this.loadClients();
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al guardar cliente';
      } finally {
        this.loading = false;
      }
    },
    // En methods:
    async deleteClient(id) {
      const result = await swal.confirm(
        '¿Eliminar cliente?',
        'Esta acción no se puede deshacer. Se eliminarán todos los datos del cliente.'
      );
      
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`${API_URL}/clients/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await this.loadClients();
          swal.success('Eliminado', 'Cliente eliminado exitosamente');
        } catch (error) {
          swal.error('Error', 'No se pudo eliminar el cliente');
        }
      }
    }
  }
}
</script>

<style scoped>
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