<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2>Orden de Trabajo</h2>
        <h4 class="text-primary">{{ workOrder.codigo }}</h4>
      </div>
      <div>
        <router-link to="/work-orders" class="btn btn-secondary me-2">
          <i class="fas fa-arrow-left"></i> Volver
        </router-link>
        <button 
          v-if="canUpdateStatus && currentValidTransitions.includes('completada')" 
          class="btn btn-success" 
          @click="updateStatus('completada')"
        >
          <i class="fas fa-check"></i> Completar
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Cargando orden de trabajo...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else>
      <div class="row">
        <div class="col-md-8">
          <!-- Información General -->
          <div class="card mb-4">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-info-circle text-primary"></i> Información General</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="text-muted small">Estado</label>
                  <div>
                    <span :class="getStatusClass(workOrder.estado)" class="badge fs-6">
                      {{ formatStatus(workOrder.estado) }}
                    </span>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="text-muted small">Fecha Inicio</label>
                  <div>{{ workOrder.fecha_inicio ? formatDate(workOrder.fecha_inicio) : 'No iniciada' }}</div>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="text-muted small">Fecha Fin</label>
                  <div>{{ workOrder.fecha_fin ? formatDate(workOrder.fecha_fin) : 'No finalizada' }}</div>
                </div>
              </div>

              <!-- Cambiar estado -->
              <div v-if="canUpdateStatus && currentValidTransitions.length > 0" class="mt-3">
                <label class="form-label">Cambiar Estado</label>
                <div class="btn-group flex-wrap">
                  <button 
                    v-for="estado in currentValidTransitions" 
                    :key="estado"
                    class="btn btn-outline-secondary"
                    @click="updateStatus(estado)"
                  >
                    {{ formatStatus(estado) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Datos del vehículo y cliente -->
          <div class="card mb-4">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="fas fa-car text-info"></i> Vehículo y Cliente</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-primary">Cliente</h6>
                  <p class="mb-1"><strong>Nombre:</strong> {{ workOrder.vehiculo?.cliente?.nombre || 'N/A' }}</p>
                  <p class="mb-1"><strong>Teléfono:</strong> {{ workOrder.vehiculo?.cliente?.telefono || 'N/A' }}</p>
                  <p class="mb-0"><strong>Email:</strong> {{ workOrder.vehiculo?.cliente?.email || 'N/A' }}</p>
                </div>
                <div class="col-md-6">
                  <h6 class="text-info">Vehículo</h6>
                  <p class="mb-1"><strong>Placa:</strong> {{ workOrder.vehiculo?.placa || 'N/A' }}</p>
                  <p class="mb-1"><strong>Marca:</strong> {{ workOrder.vehiculo?.marca || 'N/A' }}</p>
                  <p class="mb-1"><strong>Modelo:</strong> {{ workOrder.vehiculo?.modelo || 'N/A' }}</p>
                  <p class="mb-0"><strong>Año:</strong> {{ workOrder.vehiculo?.anio || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Servicios -->
          <div class="card mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="fas fa-tools text-warning"></i> Servicios Realizados</h5>
              <button v-if="canAddServices" class="btn btn-sm btn-primary" @click="showAddService = true">
                <i class="fas fa-plus"></i> Agregar Servicio
              </button>
            </div>
            <div class="card-body">
              <div v-if="workOrder.details && workOrder.details.length > 0">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr><th>Servicio</th><th>Notas</th><th>Precio</th><th>Tiempo</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="detail in workOrder.details" :key="detail.id">
                        <td>{{ detail.service?.nombre || 'N/A' }}</td>
                        <td>{{ detail.notas || 'Sin notas' }}</td>
                        <td class="text-end">S/ {{ parseFloat(detail.precio_cobrado).toFixed(2) }}</td>
                        <td>{{ detail.tiempo_real || 'N/R' }} min</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="table-primary">
                        <td colspan="2"><strong>TOTAL</strong></td>
                        <td class="text-end"><strong>S/ {{ parseFloat(workOrder.costo_total).toFixed(2) }}</strong></td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div v-else class="text-center text-muted py-3">
                <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                <p>No hay servicios agregados</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel lateral -->
        <div class="col-md-4">
          <!-- Mecánico -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="mb-0"><i class="fas fa-user-cog text-success"></i> Mecánico</h5></div>
            <div class="card-body">
              <div v-if="workOrder.mecanico" class="text-center">
                <i class="fas fa-user-circle fa-3x text-success mb-2"></i>
                <h6>{{ workOrder.mecanico.nombre }}</h6>
              </div>
              <div v-else class="text-center text-muted">
                <i class="fas fa-user-times fa-3x mb-2"></i>
                <p>No asignado</p>
              </div>
              <div v-if="canAssignMechanic" class="mt-3">
                <label class="form-label">Asignar Mecánico</label>
                <select v-model="selectedMechanic" class="form-select form-select-sm">
                  <option value="">Seleccionar...</option>
                  <option v-for="mech in mechanics" :key="mech.id" :value="mech.id">{{ mech.nombre }}</option>
                </select>
                <button class="btn btn-sm btn-primary mt-2 w-100" @click="assignMechanic" :disabled="!selectedMechanic">Asignar</button>
              </div>
            </div>
          </div>

          <!-- Diagnóstico -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="mb-0"><i class="fas fa-stethoscope text-danger"></i> Diagnóstico</h5></div>
            <div class="card-body">
              <p v-if="workOrder.diagnostico" class="mb-0">{{ workOrder.diagnostico }}</p>
              <p v-else class="text-muted mb-0">Sin diagnóstico registrado</p>
              <div v-if="canAddDiagnosis" class="mt-3">
                <textarea v-model="newDiagnosis" class="form-control form-control-sm" rows="3" placeholder="Agregar diagnóstico..."></textarea>
                <button class="btn btn-sm btn-primary mt-2 w-100" @click="updateDiagnosis" :disabled="!newDiagnosis">Actualizar Diagnóstico</button>
              </div>
            </div>
          </div>

          <!-- Notas -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="mb-0"><i class="fas fa-sticky-note text-warning"></i> Notas Internas</h5></div>
            <div class="card-body">
              <p v-if="workOrder.notas_internas" class="mb-0">{{ workOrder.notas_internas }}</p>
              <p v-else class="text-muted mb-0">Sin notas internas</p>
              <div class="mt-3">
                <textarea v-model="newNotes" class="form-control form-control-sm" rows="2" placeholder="Agregar notas..."></textarea>
                <button class="btn btn-sm btn-primary mt-2 w-100" @click="updateNotes" :disabled="!newNotes">Actualizar Notas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal agregar servicio -->
    <div v-if="showAddService" class="modal-backdrop" @click="showAddService = false"></div>
    <div v-if="showAddService" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Servicio</h5>
            <button type="button" class="btn-close" @click="showAddService = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Servicio</label>
              <select v-model="newService.servicio_id" class="form-select">
                <option value="">Seleccionar...</option>
                <option v-for="service in availableServices" :key="service.id" :value="service.id">{{ service.nombre }} - S/ {{ service.costo_estandar }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Precio</label>
              <input v-model="newService.precio_cobrado" type="number" class="form-control" step="0.01">
            </div>
            <div class="mb-3">
              <label class="form-label">Notas</label>
              <textarea v-model="newService.notas" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddService = false">Cancelar</button>
            <button class="btn btn-primary" @click="addService" :disabled="!newService.servicio_id">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { workOrderService, userService, serviceService } from '@/services/api';

export default {
  name: 'WorkOrderDetail',
  data() {
    return {
      workOrder: { vehiculo: { cliente: {} }, mecanico: null, details: [] },
      loading: true,
      error: '',
      mechanics: [],
      availableServices: [],
      selectedMechanic: '',
      newDiagnosis: '',
      newNotes: '',
      showAddService: false,
      newService: { servicio_id: '', precio_cobrado: '', notas: '' },
      estadosPermitidos: {
        'creada': ['en_progreso', 'cancelada'],
        'en_progreso': ['completada', 'pausada', 'cancelada'],
        'pausada': ['en_progreso', 'cancelada'],
        'completada': ['entregada'],
        'entregada': [],
        'cancelada': []
      }
    }
  },
  computed: {
    canUpdateStatus() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return ['admin', 'mecanico'].includes(user.rol);
    },
    canAssignMechanic() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return ['admin', 'recepcionista'].includes(user.rol);
    },
    canAddServices() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return ['admin', 'mecanico'].includes(user.rol);
    },
    canAddDiagnosis() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return ['admin', 'mecanico'].includes(user.rol);
    },
    currentValidTransitions() {
      if (!this.workOrder || !this.workOrder.estado) return [];
      return this.estadosPermitidos[this.workOrder.estado] || [];
    }
  },
  created() {
    this.loadWorkOrder();
    this.loadMechanics();
    this.loadServices();
  },
  methods: {
    async loadWorkOrder() {
      this.loading = true;
      try {
        const response = await workOrderService.getById(this.$route.params.id);
        this.workOrder = response.data.workOrder;
      } catch (error) {
        console.error('Error al cargar orden:', error);
        this.error = 'Error al cargar la orden de trabajo';
      } finally {
        this.loading = false;
      }
    },
    async loadMechanics() {
      try {
        const response = await userService.getMechanics();
        this.mechanics = response.data.mechanics || [];
      } catch (error) {
        console.error('Error al cargar mecánicos:', error);
      }
    },
    async loadServices() {
      try {
        const response = await serviceService.getAll();
        this.availableServices = response.data.services || [];
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      }
    },
    async updateStatus(estado) {
      try {
        await workOrderService.updateStatus(this.workOrder.id, { estado });
        await this.loadWorkOrder();
      } catch (err) {
        alert(err.response?.data?.error || 'Error al actualizar estado');
      }
    },
    async assignMechanic() {
      if (!this.selectedMechanic) return;
      try {
        await workOrderService.assignMechanic(this.workOrder.id, this.selectedMechanic);
        this.selectedMechanic = '';
        await this.loadWorkOrder();
        alert('Mecánico asignado exitosamente');
      } catch (error) {
        alert('Error al asignar mecánico');
      }
    },
    async updateDiagnosis() {
      if (!this.newDiagnosis) return;
      try {
        await workOrderService.updateStatus(this.workOrder.id, { diagnostico: this.newDiagnosis });
        this.newDiagnosis = '';
        await this.loadWorkOrder();
      } catch (error) {
        alert('Error al actualizar diagnóstico');
      }
    },
    async updateNotes() {
      if (!this.newNotes) return;
      try {
        await workOrderService.updateStatus(this.workOrder.id, { notas_internas: this.newNotes });
        this.newNotes = '';
        await this.loadWorkOrder();
      } catch (error) {
        alert('Error al actualizar notas');
      }
    },
    async addService() {
      if (!this.newService.servicio_id) return;
      try {
        await workOrderService.addServices(this.workOrder.id, [this.newService]);
        this.showAddService = false;
        this.newService = { servicio_id: '', precio_cobrado: '', notas: '' };
        await this.loadWorkOrder();
      } catch (error) {
        alert('Error al agregar servicio');
      }
    },
    getStatusClass(status) {
      const classes = { 'creada': 'bg-secondary', 'en_progreso': 'bg-warning text-dark', 'pausada': 'bg-info', 'completada': 'bg-success', 'entregada': 'bg-primary', 'cancelada': 'bg-danger' };
      return classes[status] || 'bg-secondary';
    },
    formatStatus(status) {
      const statuses = { 'creada': 'Creada', 'en_progreso': 'En Progreso', 'pausada': 'Pausada', 'completada': 'Completada', 'entregada': 'Entregada', 'cancelada': 'Cancelada' };
      return statuses[status] || status;
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  }
}
</script>

<style scoped>
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1040; }
.modal { z-index: 1050; }
.modal.show { display: block; }
</style>