<template>
  <div>
    <h2 class="mb-4">Bienvenido, {{ userName }}</h2>
    
    <!-- Acciones rápidas -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <router-link to="/portal/appointments/new" class="text-decoration-none">
          <div class="card bg-primary text-white quick-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-calendar-plus fa-3x mb-3"></i>
              <h5>Agendar Cita</h5>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/portal/appointments" class="text-decoration-none">
          <div class="card bg-info text-white quick-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-calendar-check fa-3x mb-3"></i>
              <h5>Mis Citas</h5>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/portal/orders" class="text-decoration-none">
          <div class="card bg-success text-white quick-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-clipboard-list fa-3x mb-3"></i>
              <h5>Mis Órdenes</h5>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/portal/vehicles" class="text-decoration-none">
          <div class="card bg-warning text-white quick-card h-100">
            <div class="card-body text-center">
              <i class="fas fa-car fa-3x mb-3"></i>
              <h5>Mis Vehículos</h5>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Próximas citas -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0"><i class="fas fa-clock"></i> Próximas Citas</h5>
      </div>
      <div class="card-body">
        <div v-if="nextAppointments.length === 0" class="text-center py-4">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p>No tienes citas programadas</p>
          <router-link to="/portal/appointments/new" class="btn btn-primary">
            Agendar una cita
          </router-link>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in nextAppointments" :key="app.id">
                <td>{{ formatDate(app.fecha_hora) }}</td>
                <td>{{ app.vehiculo?.marca }} {{ app.vehiculo?.modelo }}</td>
                <td>{{ app.descripcion_problema || 'Sin descripción' }}</td>
                <td>
                  <span :class="getStatusClass(app.estado)" class="badge">
                    {{ formatStatus(app.estado) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'import.meta.env.VITE_APP_API_URL';

export default {
  name: 'ClientHome',
  data() {
    return {
      userName: '',
      nextAppointments: []
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user.nombre || 'Cliente';
    this.loadAppointments();
  },
  methods: {
    async loadAppointments() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/client-portal/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.nextAppointments = (response.data.appointments || []).slice(0, 5);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('es-PE');
    },
    getStatusClass(status) {
      const classes = {
        'pendiente': 'bg-warning text-dark',
        'confirmada': 'bg-info',
        'en_progreso': 'bg-primary',
        'completada': 'bg-success',
        'cancelada': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    },
    formatStatus(status) {
      const statuses = {
        'pendiente': 'Pendiente',
        'confirmada': 'Confirmada',
        'en_progreso': 'En Progreso',
        'completada': 'Completada',
        'cancelada': 'Cancelada'
      };
      return statuses[status] || status;
    }
  }
}
</script>

<style scoped>
.quick-card {
  transition: transform 0.2s;
  cursor: pointer;
}
.quick-card:hover {
  transform: scale(1.05);
}
</style>