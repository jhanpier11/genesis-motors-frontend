<template>
  <div class="container-fluid">
    <h2>Nueva Orden de Trabajo</h2>
    
    <div class="card mt-3">
      <div class="card-body">
        <form @submit.prevent="saveWorkOrder">
          <div class="mb-3">
            <label class="form-label">Vehículo *</label>
            <select v-model="form.vehiculo_id" class="form-select" required>
              <option value="">Seleccionar vehículo...</option>
              <option v-for="vehicle in vehicles" :key="vehicle.id" :value="vehicle.id">
                {{ vehicle.marca }} {{ vehicle.modelo }} - {{ vehicle.placa }} 
                ({{ vehicle.cliente?.nombre }})
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Mecánico</label>
            <select v-model="form.mecanico_id" class="form-select">
              <option value="">Seleccionar mecánico...</option>
              <option v-for="mechanic in mechanics" :key="mechanic.id" :value="mechanic.id">
                {{ mechanic.nombre }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Diagnóstico</label>
            <textarea v-model="form.diagnostico" class="form-control" rows="3"></textarea>
          </div>

          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Creando...' : 'Crear Orden' }}
            </button>
            <router-link to="/work-orders" class="btn btn-secondary">Cancelar</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { vehicleService, userService, workOrderService } from '@/services/api';

export default {
  name: 'WorkOrderForm',
  data() {
    return {
      vehicles: [],
      mechanics: [],
      loading: false,
      error: '',
      form: {
        vehiculo_id: '',
        mecanico_id: '',
        diagnostico: ''
      }
    };
  },
  created() {
    this.loadVehicles();
    this.loadMechanics();
  },
  methods: {
    async loadVehicles() {
      try {
        const response = await vehicleService.getAll();
        this.vehicles = response.data?.vehicles || [];
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
      }
    },
    async loadMechanics() {
      try {
        const response = await userService.getMechanics();
        this.mechanics = response.data?.mechanics || [];
      } catch (error) {
        console.error('Error al cargar mecánicos:', error);
      }
    },
    async saveWorkOrder() {
      this.loading = true;
      this.error = '';
      try {
        console.log('Enviando orden:', this.form);
        await workOrderService.create(this.form);
        this.$router.push('/work-orders');
      } catch (err) {
        console.log('ERROR:', err.response?.data);
        this.error =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error al crear orden';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>