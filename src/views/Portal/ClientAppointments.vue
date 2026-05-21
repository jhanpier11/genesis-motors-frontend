<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Mis Citas</h2>
      <router-link to="/portal/appointments/new" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nueva Cita
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Vehículo</th>
                <th>Problema</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="app in appointments" :key="app.id">
                <td>{{ formatDate(app.fecha_hora) }}</td>
                <td>{{ app.vehiculo?.marca }} {{ app.vehiculo?.modelo }} - {{ app.vehiculo?.placa }}</td>
                <td>{{ app.descripcion_problema || 'Sin descripción' }}</td>
                <td>
                  <span :class="getStatusClass(app.estado)" class="badge">
                    {{ formatStatus(app.estado) }}
                  </span>
                </td>
              </tr>
              <tr v-if="appointments.length === 0">
                <td colspan="4" class="text-center">No tienes citas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { clientPortalService } from '@/services/api';

export default {
  name: 'ClientAppointments',
  data() {
    return { appointments: [] }
  },
  created() {
    this.loadAppointments();
  },
  methods: {
    async loadAppointments() {
      try {
        const response = await clientPortalService.getMyAppointments();
        this.appointments = response.data.appointments || [];
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