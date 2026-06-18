<template>
  <div class="container-fluid">
    <h2>Nueva Cita</h2>
    
    <div class="card mt-3">
      <div class="card-body">
        <form @submit.prevent="saveAppointment">
          <!-- Cliente -->
          <div class="mb-3">
              <label class="form-label" for="cliente">Cliente</label>
              <select id="cliente" v-model="form.cliente_id" class="form-select" required @change="loadVehicles">
              <option value="">Seleccionar cliente...</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.nombre }} - {{ client.telefono || 'Sin teléfono' }}
              </option>
            </select>
          </div>

          <!-- Vehículo -->
          <div class="mb-3">
            <label class="form-label">Vehículo *</label>
            <select v-model="form.vehiculo_id" class="form-select" required :disabled="!form.cliente_id">
              <option value="">Seleccionar vehículo...</option>
              <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.marca }} {{ vehicle.modelo }} - {{ vehicle.placa }}
              </option>
            </select>
          </div>

          <!-- Fecha y Hora -->
          <div class="mb-3">
            <label class="form-label">Fecha y Hora *</label>
            <input v-model="form.fecha_hora" type="datetime-local" class="form-control" required>
          </div>

          <!-- Descripción -->
          <div class="mb-3">
            <label class="form-label">Descripción del Problema</label>
            <textarea v-model="form.descripcion_problema" class="form-control" rows="3" 
              placeholder="Describa el problema del vehículo..."></textarea>
          </div>

          <!-- Notas -->
          <div class="mb-3">
            <label class="form-label">Notas Adicionales</label>
            <textarea v-model="form.notas" class="form-control" rows="2" 
              placeholder="Notas internas..."></textarea>
          </div>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Agendar Cita
            </button>
            <router-link to="/appointments" class="btn btn-secondary">Cancelar</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'AppointmentForm',
  data() {
    return {
      clients: [],
      vehicles: [],
      loading: false,
      error: '',
      success: '',
      form: {
        cliente_id: '',
        vehiculo_id: '',
        fecha_hora: '',
        descripcion_problema: '',
        notas: ''
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
        const response = await api.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.clients = response.data.clients;
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    },
    async loadVehicles() {
      if (!this.form.cliente_id) {
        this.vehicles = [];
        this.form.vehiculo_id = '';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`${API_URL}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { cliente_id: this.form.cliente_id }
        });
        this.vehicles = response.data.vehicles;
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
      }
    },
    async saveAppointment() {
      this.loading = true;
      this.error = '';
      this.success = '';

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/appointments`, this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.success = 'Cita agendada exitosamente';
        
        // Limpiar formulario
        setTimeout(() => {
          this.$router.push('/appointments');
        }, 1500);
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al agendar cita';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>