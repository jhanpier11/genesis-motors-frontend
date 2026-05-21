<template>
  <div>
    <router-link to="/portal/appointments" class="btn btn-outline-primary mb-3">
      <i class="fas fa-arrow-left"></i> Volver
    </router-link>
    <h2 class="mb-4">Solicitar Nueva Cita</h2>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="createAppointment">
          <div class="mb-3">
            <label class="form-label">Vehículo *</label>
            <select v-model="form.vehiculo_id" class="form-select" required>
              <option value="">Seleccionar vehículo...</option>
              <option v-for="v in myVehicles" :key="v.id" :value="v.id">
                {{ v.marca }} {{ v.modelo }} - {{ v.placa }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Fecha y Hora deseada *</label>
            <input v-model="form.fecha_hora" type="datetime-local" class="form-control" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción del problema *</label>
            <textarea v-model="form.descripcion_problema" class="form-control" rows="4" 
              placeholder="Describe el problema de tu vehículo..." required></textarea>
          </div>
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>
          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Solicitar Cita' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'NewAppointment',
  data() {
    return {
      myVehicles: [],
      loading: false,
      error: '',
      success: '',
      form: { vehiculo_id: '', fecha_hora: '', descripcion_problema: '' }
    }
  },
  created() {
    this.loadMyVehicles();
  },
  methods: {
    async loadMyVehicles() {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`${API_URL}/client-portal/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.myVehicles = response.data.vehicles || [];
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async createAppointment() {
      this.loading = true;
      this.error = '';
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/client-portal/appointments`, this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.success = 'Cita solicitada exitosamente. Le confirmaremos pronto.';
        setTimeout(() => this.$router.push('/portal/appointments'), 2000);
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al solicitar cita';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>