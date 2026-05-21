<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Vehículos</h2>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="fas fa-plus"></i> Nuevo Vehículo
      </button>
    </div>

    <!-- Buscador -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                v-model="search" 
                type="text" 
                class="form-control" 
                placeholder="Buscar por placa, marca o modelo..."
                @input="filterVehicles"
              >
            </div>
          </div>
          <div class="col-md-4">
            <select v-model="filterClient" class="form-select" @change="loadVehicles">
              <option value="">Todos los clientes</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de vehículos -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Color</th>
                <th>Cliente</th>
                <th>Kilometraje</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in filteredVehicles" :key="vehicle.id">
                <td>
                  <span class="badge bg-dark">{{ vehicle.placa }}</span>
                </td>
                <td>{{ vehicle.marca }}</td>
                <td>{{ vehicle.modelo }}</td>
                <td>{{ vehicle.anio }}</td>
                <td>
                  <span :style="{backgroundColor: vehicle.color}" class="color-dot"></span>
                  {{ vehicle.color || 'N/A' }}
                </td>
                <td>{{ vehicle.cliente?.nombre || 'N/A' }}</td>
                <td>{{ formatKilometraje(vehicle.kilometraje) }}</td>
                <td>
                  <button class="btn btn-sm btn-info me-1" @click="viewVehicle(vehicle)" title="Ver">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-warning me-1" @click="editVehicle(vehicle)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteVehicle(vehicle.id)" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="8" class="text-center">No hay vehículos registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar vehículo -->
    <div v-if="showForm" class="modal-backdrop" @click="closeForm"></div>
    <div v-if="showForm" class="modal show d-block">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-car"></i>
              {{ editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveVehicle">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Cliente *</label>
                  <select v-model="form.cliente_id" class="form-select" required>
                    <option value="">Seleccionar cliente...</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.nombre }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Placa *</label>
                  <input v-model="form.placa" type="text" class="form-control" 
                    placeholder="ABC-123" required maxlength="10">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Marca *</label>
                  <select v-model="form.marca" class="form-select" required>
                    <option value="">Seleccionar marca...</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes Benz">Mercedes Benz</option>
                    <option value="Audi">Audi</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Modelo *</label>
                  <input v-model="form.modelo" type="text" class="form-control" 
                    placeholder="Ej: Corolla" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Año *</label>
                  <input v-model="form.anio" type="number" class="form-control" 
                    placeholder="2024" required min="1900" :max="currentYear + 1">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Color</label>
                  <input v-model="form.color" type="text" class="form-control" 
                    placeholder="Rojo">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Kilometraje</label>
                  <input v-model="form.kilometraje" type="number" class="form-control" 
                    placeholder="50000">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">VIN (Número de chasis)</label>
                  <input v-model="form.vin" type="text" class="form-control" 
                    placeholder="1HGBH41JXMN109186" maxlength="17">
                </div>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeForm">
                  <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-save"></i>
                  {{ editingVehicle ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ver detalles -->
    <div v-if="viewingVehicle" class="modal-backdrop" @click="viewingVehicle = null"></div>
    <div v-if="viewingVehicle" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">
              <i class="fas fa-car"></i> Detalles del Vehículo
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="viewingVehicle = null"></button>
          </div>
          <div class="modal-body">
            <div class="text-center mb-3">
              <i class="fas fa-car fa-4x text-info"></i>
            </div>
            <table class="table table-bordered">
              <tr><th>Placa</th><td><span class="badge bg-dark fs-6">{{ viewingVehicle.placa }}</span></td></tr>
              <tr><th>Marca</th><td>{{ viewingVehicle.marca }}</td></tr>
              <tr><th>Modelo</th><td>{{ viewingVehicle.modelo }}</td></tr>
              <tr><th>Año</th><td>{{ viewingVehicle.anio }}</td></tr>
              <tr><th>Color</th><td>{{ viewingVehicle.color || 'No especificado' }}</td></tr>
              <tr><th>Kilometraje</th><td>{{ formatKilometraje(viewingVehicle.kilometraje) }}</td></tr>
              <tr><th>VIN</th><td>{{ viewingVehicle.vin || 'No especificado' }}</td></tr>
              <tr><th>Cliente</th><td>{{ viewingVehicle.cliente?.nombre }}</td></tr>
              <tr><th>Teléfono</th><td>{{ viewingVehicle.cliente?.telefono || 'N/A' }}</td></tr>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="viewingVehicle = null">Cerrar</button>
            <button class="btn btn-warning" @click="viewingVehicle = null; editVehicle(viewingVehicle)">
              <i class="fas fa-edit"></i> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'VehicleList',

  data() {
    return {
      vehicles: [],
      clients: [],
      filteredVehicles: [],
      search: '',
      filterClient: '',
      showForm: false,
      editingVehicle: null,
      viewingVehicle: null,
      loading: false,
      error: '',
      currentYear: new Date().getFullYear(),

      form: {
        cliente_id: '',
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        kilometraje: '',
        vin: ''
      }
    };
  },

  created() {
    this.loadVehicles();
    this.loadClients();
  },

  methods: {

    async loadVehicles() {

      try {

        const params = {};

        if (this.filterClient) {
          params.cliente_id =
            this.filterClient;
        }

        const response =
          await api.get(
            '/vehicles',
            { params }
          );

        this.vehicles =
          response.data?.vehicles || [];

        this.filterVehicles();

      } catch (error) {

        console.log(error);

        alert(
          error.response?.data?.error ||
          'Error cargando vehículos'
        );
      }
    },

    async loadClients() {

      try {

        const response =
          await api.get('/clients');

        this.clients =
          response.data?.clients || [];

      } catch (error) {

        console.log(error);

        alert(
          error.response?.data?.error ||
          'Error cargando clientes'
        );
      }
    },

    filterVehicles() {

      if (!this.search) {

        this.filteredVehicles =
          this.vehicles;

        return;
      }

      const text =
        this.search.toLowerCase();

      this.filteredVehicles =
        this.vehicles.filter(v =>

          v.placa?.toLowerCase().includes(text) ||

          v.marca?.toLowerCase().includes(text) ||

          v.modelo?.toLowerCase().includes(text)

        );
    },

    editVehicle(vehicle) {

      this.editingVehicle =
        vehicle;

      this.form = {

        cliente_id:
          vehicle.cliente_id,

        placa:
          vehicle.placa,

        marca:
          vehicle.marca,

        modelo:
          vehicle.modelo,

        anio:
          vehicle.anio,

        color:
          vehicle.color || '',

        kilometraje:
          vehicle.kilometraje || '',

        vin:
          vehicle.vin || ''
      };

      this.showForm = true;
    },

    viewVehicle(vehicle) {

      this.viewingVehicle =
        vehicle;
    },

    closeForm() {

      this.showForm =
        false;

      this.editingVehicle =
        null;

      this.error =
        '';

      this.form = {

        cliente_id: '',
        placa: '',
        marca: '',
        modelo: '',
        anio: '',
        color: '',
        kilometraje: '',
        vin: ''
      };
    },

    async saveVehicle() {

      this.loading = true;

      this.error = '';

      try {

        if (this.editingVehicle) {

          await api.put(
            `/vehicles/${this.editingVehicle.id}`,
            this.form
          );

        } else {

          await api.post(
            '/vehicles',
            this.form
          );
        }

        this.closeForm();

        await this.loadVehicles();

      } catch (err) {

  console.log('ERROR COMPLETO:', err);

  console.log('STATUS:',
    err.response?.status
  );

  console.log('DATA:',
    err.response?.data
  );

  alert(
    JSON.stringify(
      err.response?.data ||
      err.message,
      null,
      2
    )
  );

  this.error =
    err.response?.data?.error ||

    err.response?.data?.message ||

    'Error al guardar vehículo';
} finally {

        this.loading = false;
      }
    },

    async deleteVehicle(id) {

      if (
        !confirm(
          '¿Eliminar vehículo?'
        )
      ) {
        return;
      }

      try {

        await api.delete(
          `/vehicles/${id}`
        );

        await this.loadVehicles();

        alert(
          'Vehículo eliminado exitosamente'
        );

      } catch (error) {

        alert(

          error.response?.data?.error ||

          'Error eliminando vehículo'
        );
      }
    },

    formatKilometraje(km) {

      if (!km) {
        return 'N/A';
      }

      return (
        km
          .toString()
          .replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ','
          ) +
        ' km'
      );
    }
  }
};
</script>

<style scoped>
.color-dot {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 5px;
  border: 1px solid #ddd;
  vertical-align: middle;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

.modal.show {
  display: block;
}

.badge.bg-dark {
  font-size: 0.9rem;
  padding: 5px 10px;
}
</style>