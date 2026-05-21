<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Panel de Control</h2>
      <small class="text-muted">{{ currentDate }}</small>
    </div>
    
    <!-- Tarjetas de estadísticas -->
    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-md-6">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Citas Hoy
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.citasHoy }}</div>
              </div>
              <div class="col-auto">
                <i class="fas fa-calendar-check fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card border-left-warning shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Órdenes Pendientes
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.ordenesPendientes }}</div>
              </div>
              <div class="col-auto">
                <i class="fas fa-tools fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card border-left-success shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Completadas Hoy
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.ordenesCompletadas }}</div>
              </div>
              <div class="col-auto">
                <i class="fas fa-check-circle fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card border-left-info shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Clientes Nuevos
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.clientesNuevos }}</div>
              </div>
              <div class="col-auto">
                <i class="fas fa-users fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <router-link to="/appointments/create" class="text-decoration-none">
          <div class="card bg-primary text-white shadow h-100 quick-card">
            <div class="card-body text-center">
              <i class="fas fa-calendar-plus fa-3x mb-3"></i>
              <h5>Nueva Cita</h5>
              <p class="small mb-0">Agendar una cita para un cliente</p>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/work-orders/create" class="text-decoration-none">
          <div class="card bg-success text-white shadow h-100 quick-card">
            <div class="card-body text-center">
              <i class="fas fa-file-alt fa-3x mb-3"></i>
              <h5>Nueva Orden</h5>
              <p class="small mb-0">Crear orden de trabajo</p>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/clients" class="text-decoration-none">
          <div class="card bg-info text-white shadow h-100 quick-card">
            <div class="card-body text-center">
              <i class="fas fa-user-plus fa-3x mb-3"></i>
              <h5>Clientes</h5>
              <p class="small mb-0">Gestionar clientes</p>
            </div>
          </div>
        </router-link>
      </div>
      <div class="col-md-3">
        <router-link to="/vehicles" class="text-decoration-none">
          <div class="card bg-warning text-white shadow h-100 quick-card">
            <div class="card-body text-center">
              <i class="fas fa-car fa-3x mb-3"></i>
              <h5>Vehículos</h5>
              <p class="small mb-0">Gestionar vehículos</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Actividad reciente -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-clock text-primary"></i> Citas Recientes
            </h5>
          </div>
          <div class="card-body">
            <div v-if="recentAppointments.length === 0" class="text-center text-muted py-3">
              <i class="fas fa-calendar-times fa-2x mb-2"></i>
              <p>No hay citas recientes</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="app in recentAppointments" :key="app.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ app.cliente?.nombre }}</strong>
                    <br>
                    <small class="text-muted">
                      <i class="fas fa-car"></i> {{ app.vehiculo?.marca }} {{ app.vehiculo?.modelo }}
                    </small>
                  </div>
                  <span :class="getStatusClass(app.estado)" class="badge">
                    {{ app.estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-tasks text-warning"></i> Órdenes Activas
            </h5>
          </div>
          <div class="card-body">
            <div v-if="activeOrders.length === 0" class="text-center text-muted py-3">
              <i class="fas fa-clipboard-check fa-2x mb-2"></i>
              <p>No hay órdenes activas</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="order in activeOrders" :key="order.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ order.codigo }}</strong>
                    <br>
                    <small class="text-muted">
                      {{ order.vehiculo?.cliente?.nombre }} - {{ order.vehiculo?.placa }}
                    </small>
                  </div>
                  <div class="text-end">
                    <span :class="getOrderStatusClass(order.estado)" class="badge">
                      {{ order.estado }}
                    </span>
                    <br>
                    <small class="text-muted">S/ {{ order.costo_total }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Gráfico de órdenes por estado -->
<div class="row mt-4">
  <div class="col-md-6">
    <div class="card shadow">
      <div class="card-header bg-white">
        <h5 class="mb-0">Órdenes por Estado</h5>
      </div>
      <div class="card-body">
        <canvas id="ordersChart"></canvas>
      </div>
    </div>
  </div>

  <div class="col-md-6">
    <div class="card shadow">
      <div class="card-header bg-white">
        <h5 class="mb-0">Actividad Reciente</h5>
      </div>
      <div class="card-body">
        <div class="timeline">
          <div v-for="(activity, index) in recentActivities" :key="index" class="timeline-item">
            <div class="timeline-marker" :class="getActivityClass(activity.type)"></div>
            <div class="timeline-content">
              <h6 class="mb-1">{{ activity.title }}</h6>
              <small class="text-muted">{{ activity.description }}</small>
              <br>
              <small class="text-muted">{{ formatDate(activity.date) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</template>

<script>

import Chart from 'chart.js/auto';

import api from '@/services/api';

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        citasHoy: 0,
        ordenesPendientes: 0,
        ordenesCompletadas: 0,
        clientesNuevos: 0,
        // Inicializamos los valores para el gráfico
        creadas: 0,
        enProgreso: 0,
        completadas: 0,
        entregadas: 0
      },
      recentAppointments: [],
      activeOrders: [],
      recentActivities: [],
      currentDate: new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  mounted() {
    this.loadDashboardData();
  },
  methods: {
    async loadDashboardData() {
        try {
          const token = localStorage.getItem('token');

          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };

          const [statsRes, appointmentsRes, ordersRes] =
            await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/appointments',{
            params:{estado:'pendiente'}
            }),
            api.get('/work-orders',{
            params:{estado:'en_progreso'}
            })
            ]);

          this.stats =
            statsRes.data?.stats || {
              citasHoy: 0,
              ordenesPendientes: 0,
              ordenesCompletadas: 0,
              clientesNuevos: 0,
              creadas: 0,
              enProgreso: 0,
              completadas: 0,
              entregadas: 0
            };

          this.recentAppointments =
            (appointmentsRes.data?.appointments || [])
            .slice(0, 5);

          this.activeOrders =
            (ordersRes.data?.workOrders || [])
            .slice(0, 5);

          this.$nextTick(() => {
            this.initChart();
          });

        } catch (error) {
          console.error(
            'Error al cargar dashboard:',
            error
          );

          this.stats = {
            citasHoy: 0,
            ordenesPendientes: 0,
            ordenesCompletadas: 0,
            clientesNuevos: 0,
            creadas: 0,
            enProgreso: 0,
            completadas: 0,
            entregadas: 0
          };
        }
      },
    initChart() {
      const ctx = document.getElementById('ordersChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Creadas', 'En Progreso', 'Completadas', 'Entregadas'],
            datasets: [{
              data: [
                this.stats.creadas || 0, 
                this.stats.enProgreso || 0, 
                this.stats.completadas || 0, 
                this.stats.entregadas || 0
              ],
              backgroundColor: ['#6c757d', '#ffc107', '#28a745', '#007bff']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
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
    getOrderStatusClass(status) {
      const classes = {
        'creada': 'bg-secondary',
        'en_progreso': 'bg-warning text-dark',
        'completada': 'bg-success',
        'entregada': 'bg-info',
        'cancelada': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    }
  }
}
</script>


<style scoped>
.border-left-primary {
  border-left: 4px solid #4e73df;
}

.border-left-warning {
  border-left: 4px solid #f6c23e;
}

.border-left-success {
  border-left: 4px solid #1cc88a;
}

.border-left-info {
  border-left: 4px solid #36b9cc;
}

.quick-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.quick-card:hover {
  transform: scale(1.05);
}

.text-gray-300 {
  color: #dddfeb;
}

.text-gray-800 {
  color: #5a5c69;
}
</style>