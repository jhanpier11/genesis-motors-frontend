<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Calendario de Citas</h2>
      <router-link to="/appointments/create" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nueva Cita
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div id="calendar"></div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'AppointmentCalendar',
  data() {
    return {
      calendar: null
    }
  },
  mounted() {
    this.initCalendar();
  },
  methods: {
    async initCalendar() {
      const token = localStorage.getItem('token');
      
      // Cargar citas
      const response = await api.get(`${API_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const events = response.data.appointments.map(app => ({
        id: app.id,
        title: `${app.cliente?.nombre} - ${app.vehiculo?.marca} ${app.vehiculo?.modelo}`,
        start: app.fecha_hora,
        backgroundColor: this.getEventColor(app.estado),
        borderColor: this.getEventColor(app.estado),
        extendedProps: {
          estado: app.estado,
          cliente: app.cliente?.nombre,
          vehiculo: `${app.vehiculo?.marca} ${app.vehiculo?.modelo}`,
          descripcion: app.descripcion_problema
        }
      }));

      const calendarEl = document.getElementById('calendar');
      this.calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'es',
        events: events,
        editable: false,
        eventClick: (info) => {
          alert(`
            Cliente: ${info.event.extendedProps.cliente}
            Vehículo: ${info.event.extendedProps.vehiculo}
            Estado: ${info.event.extendedProps.estado}
            Descripción: ${info.event.extendedProps.descripcion || 'Sin descripción'}
          `);
        }
      });
      
      this.calendar.render();
    },
    getEventColor(estado) {
      const colors = {
        'pendiente': '#ffc107',
        'confirmada': '#17a2b8',
        'en_progreso': '#007bff',
        'completada': '#28a745',
        'cancelada': '#dc3545'
      };
      return colors[estado] || '#6c757d';
    }
  },
  beforeUnmount() {
    if (this.calendar) {
      this.calendar.destroy();
    }
  }
}
</script>

<style>
#calendar {
  max-width: 100%;
  margin: 0 auto;
}

.fc-event {
  cursor: pointer;
  padding: 5px;
}
</style>