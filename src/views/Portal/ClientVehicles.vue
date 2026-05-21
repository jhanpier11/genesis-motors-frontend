<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Mis Vehículos</h2>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Agregar Vehículo
      </button>
    </div>

    <div class="row">
      <div v-if="vehicles.length === 0" class="col-12">
        <div class="text-center py-5">
          <i class="fas fa-car fa-4x text-muted mb-3"></i>
          <h4>No tienes vehículos registrados</h4>
          <p>Agrega tu primer vehículo para agendar citas</p>
          <button class="btn btn-primary" @click="showForm = true">
            Agregar Vehículo
          </button>
        </div>
      </div>
      <div v-for="vehicle in vehicles" :key="vehicle.id" class="col-md-4 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="text-center mb-3">
              <i class="fas fa-car fa-3x text-primary"></i>
            </div>
            <h5 class="card-title">{{ vehicle.marca }} {{ vehicle.modelo }}</h5>
            <p class="card-text">
              <strong>Placa:</strong> <span class="badge bg-dark">{{ vehicle.placa }}</span><br>
              <strong>Año:</strong> {{ vehicle.anio }}<br>
              <strong>Color:</strong> {{ vehicle.color || 'No especificado' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar vehículo -->
    <div v-if="showForm" class="modal-backdrop" @click="showForm = false"></div>
    <div v-if="showForm" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Vehículo</h5>
            <button type="button" class="btn-close" @click="showForm = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addVehicle">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Marca *</label>
                  <select v-model="form.marca" class="form-select" required>
                    <option value="">Seleccionar...</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Modelo *</label>
                  <input v-model="form.modelo" type="text" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Año *</label>
                  <input v-model="form.anio" type="number" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Placa *</label>
                  <input v-model="form.placa" type="text" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Color</label>
                  <input v-model="form.color" type="text" class="form-control">
                </div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                {{ loading ? 'Guardando...' : 'Registrar Vehículo' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

const API_URL = process.env.VUE_APP_API_URL;

export default {
  name: 'ClientVehicles',
  data() {
    return {
      vehicles: [],
      showForm: false,
      loading: false,
      error: '',
      form: { marca: '', modelo: '', anio: '', placa: '', color: '' }
    }
  },
  created() {
    this.loadVehicles();
  },
  methods: {
    async loadVehicles() {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`${API_URL}/client-portal/vehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.vehicles = response.data.vehicles || [];
      } catch (error) {
        console.error('Error:', error);
      }
    },
    async addVehicle() {
      this.loading = true;
      this.error = '';
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/client-portal/vehicles`, this.form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.showForm = false;
        this.form = { marca: '', modelo: '', anio: '', placa: '', color: '' };
        this.loadVehicles();
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al registrar vehículo';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1040; }
.modal { z-index: 1050; }
.modal.show { display: block; }
</style>