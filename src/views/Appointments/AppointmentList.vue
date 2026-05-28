<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Citas</h2>
      <div>
        <router-link to="/appointments/calendar" class="btn btn-info me-2">
          <i class="fas fa-calendar"></i> Calendario
        </router-link>
        <router-link to="/appointments/create" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nueva Cita
        </router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4 mb-2">
            <label class="form-label">Fecha</label>
            <input v-model="filters.fecha" type="date" class="form-control" @change="loadAppointments">
          </div>
          <div class="col-md-4 mb-2">
            <label class="form-label">Estado</label>
            <select v-model="filters.estado" class="form-select" @change="loadAppointments">
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div class="col-md-4 mb-2 d-flex align-items-end">
            <button class="btn btn-secondary w-100" @click="clearFilters">
              <i class="fas fa-times"></i> Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de citas -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in appointments" :key="appointment.id">
                <td>{{ formatDate(appointment.fecha_hora) }}</td>
                <td>{{ appointment.cliente?.nombre || 'N/A' }}</td>
                <td>{{ appointment.vehiculo?.marca }} {{ appointment.vehiculo?.modelo }}</td>
                <td>
                  <span :class="getStatusClass(appointment.estado)" class="badge">
                    {{ formatStatus(appointment.estado) }}
                  </span>
                </td>
                <td>
                  <!-- Botones de acción -->
                  <button 
                    v-if="appointment.estado === 'pendiente'"
                    class="btn btn-sm btn-success me-1" 
                    @click="updateStatus(appointment.id, 'confirmada')"
                    title="Confirmar"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="['pendiente', 'confirmada'].includes(appointment.estado)"
                    class="btn btn-sm btn-danger" 
                    @click="cancelAppointment(appointment.id)"
                    title="Cancelar"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <button 
                    v-if="appointment.estado === 'confirmada'"
                    class="btn btn-sm btn-primary me-1" 
                    @click="updateStatus(appointment.id, 'en_progreso')"
                    title="Iniciar"
                  >
                    <i class="fas fa-play"></i>
                  </button>
                  <button 
                    v-if="appointment.estado === 'en_progreso'"
                    class="btn btn-sm btn-success me-1" 
                    @click="updateStatus(appointment.id, 'completada')"
                    title="Completar"
                  >
                    <i class="fas fa-check-double"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="appointments.length === 0">
                <td colspan="5" class="text-center">No hay citas programadas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { appointmentService } from '@/services/api';

export default {
  name: 'AppointmentList',
  data() {
    return {
      appointments: [],
      filters: { fecha: '', estado: '' }
    }
  },
  created() {
    this.loadAppointments();
  },
  methods: {
    async loadAppointments() {
      try {
        const params = {};
        if (this.filters.fecha) params.fecha = this.filters.fecha;
        if (this.filters.estado) params.estado = this.filters.estado;
        
        const response = await appointmentService.getAll(params);
        this.appointments = response.data.appointments || [];
      } catch (error) {
        console.error('Error al cargar citas:', error);
      }
    },
    async updateStatus(id, estado) {
      try {
        await appointmentService.updateStatus(id, { estado });
        this.loadAppointments();
        alert('Estado actualizado correctamente');
      } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.error || 'Error al actualizar cita');
      }
    },
    async cancelAppointment(id) {
      const motivo = prompt('Motivo de cancelación:');
      if (!motivo) return;
      
      try {
        await appointmentService.cancel(id, motivo);
        this.loadAppointments();
        alert('Cita cancelada');
      } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.error || 'Error al cancelar cita');
      }
    },
    async updateStatus(id, estado) {
      try {
        await appointmentService.updateStatus(id, { estado });
        this.loadAppointments();
      } catch (error) {
        alert('Error al actualizar cita: ' + (error.response?.data?.error || ''));
      }
    },
    async cancelAppointment(id) {
      const motivo = prompt('Motivo de cancelación:');
      if (!motivo) return;
      
      try {
        await appointmentService.cancel(id, motivo);
        this.loadAppointments();
      } catch (error) {
        alert('Error al cancelar cita');
      }
    },
    clearFilters() {
      this.filters = { fecha: '', estado: '' };
      this.loadAppointments();
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('es-PE', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
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