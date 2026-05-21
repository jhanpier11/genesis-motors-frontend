<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-dark">Órdenes de Trabajo</h2>
      <router-link to="/work-orders/create" class="btn btn-primary shadow-sm">
        <i class="fas fa-plus me-2"></i> Nueva Orden
      </router-link>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row align-items-end">
          <div class="col-md-3 mb-2">
            <label class="form-label fw-semibold">Filtrar por Estado</label>
            <select v-model="filters.estado" class="form-select" @change="loadWorkOrders">
              <option value="">Todos los estados</option>
              <option value="creada">Creada</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="entregada">Entregada</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Código</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Mecánico</th>
                <th>Estado</th>
                <th>Costo Total</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in workOrders" :key="order.id">
                <td class="ps-4">
                  <router-link :to="`/work-orders/${order.id}`" class="text-decoration-none">
                    <span class="badge bg-dark px-3 py-2">{{ order.codigo }}</span>
                  </router-link>
                </td>
                <td class="fw-medium">{{ order.vehiculo?.cliente?.nombre || 'N/A' }}</td>
                <td>
                  <small class="text-muted d-block">{{ order.vehiculo?.placa }}</small>
                  {{ order.vehiculo?.marca }} {{ order.vehiculo?.modelo }}
                </td>
                <td>
                  <span class="text-secondary">
                    <i class="fas fa-user-wrench me-1"></i>
                    {{ order.mecanico?.nombre || 'Sin asignar' }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(order.estado)" class="badge rounded-pill">
                    {{ formatStatus(order.estado) }}
                  </span>
                </td>
                <td class="fw-bold text-dark">S/ {{ order.costo_total }}</td>
                <td class="text-center">
                  <router-link :to="`/work-orders/${order.id}`" class="btn btn-outline-info btn-sm">
                    <i class="fas fa-eye"></i> Detalle
                  </router-link>
                </td>
              </tr>
              <tr v-if="workOrders.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-folder-open d-block mb-2 fa-2x"></i>
                  No se encontraron órdenes de trabajo.
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
import api from '@/services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'WorkOrderList',
  data() {
    return {
      workOrders: [],
      filters: {
        estado: ''
      }
    }
  },
  created() {
    this.loadWorkOrders();
  },
  methods: {
    async loadWorkOrders() {
      try {
        const token = localStorage.getItem('token');
        const params = {};
        if (this.filters.estado) params.estado = this.filters.estado;
        
        const response = await api.get('/work-orders', {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        // Asegúrate de que el backend envíe los datos en esta estructura
        this.workOrders = response.data.workOrders || response.data;
      } catch (error) {
        console.error('Error al cargar órdenes:', error);
      }
    },
    getStatusClass(status) {
      const classes = {
        'creada': 'bg-secondary',
        'en_progreso': 'bg-warning text-dark',
        'completada': 'bg-success',
        'entregada': 'bg-info',
        'cancelada': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    },
    formatStatus(status) {
      // Formatea el texto para que se vea mejor (ej: en_progreso -> En Progreso)
      return status.replace('_', ' ').toUpperCase();
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales para un look más profesional */
.table thead th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-bottom: 2px solid #dee2e6;
}
.card {
  border-radius: 12px;
}
.btn-primary {
  background-color: #0d6efd;
  border: none;
}
</style>