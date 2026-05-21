<template>
  <div>
    <h2 class="mb-4">Mis Órdenes de Trabajo</h2>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Código</th>
                <th>Vehículo</th>
                <th>Mecánico</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td><span class="badge bg-dark">{{ order.codigo }}</span></td>
                <td>{{ order.vehiculo?.marca }} {{ order.vehiculo?.modelo }} - {{ order.vehiculo?.placa }}</td>
                <td>{{ order.mecanico?.nombre || 'No asignado' }}</td>
                <td>
                  <span :class="getStatusClass(order.estado)" class="badge">
                    {{ formatStatus(order.estado) }}
                  </span>
                </td>
                <td>S/ {{ order.costo_total }}</td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="5" class="text-center">No tienes órdenes de trabajo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'ClientOrders',
  data() {
    return { orders: [] }
  },
  created() {
    this.loadOrders();
  },
  methods: {
    async loadOrders() {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`${API_URL}/client-portal/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.orders = response.data.workOrders || [];
      } catch (error) {
        console.error('Error:', error);
      }
    },
    getStatusClass(status) {
      const classes = {
        'creada': 'bg-secondary',
        'en_progreso': 'bg-warning text-dark',
        'completada': 'bg-success',
        'entregada': 'bg-primary',
        'cancelada': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    },
    formatStatus(status) {
      const statuses = {
        'creada': 'Creada',
        'en_progreso': 'En Progreso',
        'completada': 'Completada',
        'entregada': 'Entregada',
        'cancelada': 'Cancelada'
      };
      return statuses[status] || status;
    }
  }
}
</script>