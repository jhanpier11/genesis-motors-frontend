import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'


// Vistas públicas
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Profile from './views/Profile.vue'

// Panel admin
import Dashboard from './views/Dashboard.vue'
import ClientList from './views/Clients/ClientList.vue'
import VehicleList from './views/Vehicles/VehicleList.vue'
import AppointmentList from './views/Appointments/AppointmentList.vue'
import AppointmentForm from './views/Appointments/AppointmentForm.vue'
import AppointmentCalendar from './views/Appointments/AppointmentCalendar.vue'
import WorkOrderList from './views/WorkOrders/WorkOrderList.vue'
import WorkOrderForm from './views/WorkOrders/WorkOrderForm.vue'
import WorkOrderDetail from './views/WorkOrderDetail.vue'
import ServiceList from './views/Services/ServiceList.vue'
import UserList from './views/Users/UserList.vue'

// Portal cliente
import ClientLayout from './views/Portal/ClientLayout.vue'
import ClientHome from './views/Portal/ClientHome.vue'
import ClientAppointments from './views/Portal/ClientAppointments.vue'
import ClientOrders from './views/Portal/ClientOrders.vue'
import ClientVehicles from './views/Portal/ClientVehicles.vue'
import NewAppointment from './views/Portal/NewAppointment.vue'

const routes = [
  // Públicas
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guest: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true, title: 'Mi Perfil' } },
  
  // Panel admin
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/clients', name: 'Clients', component: ClientList, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/vehicles', name: 'Vehicles', component: VehicleList, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/appointments', name: 'Appointments', component: AppointmentList, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/appointments/create', name: 'AppointmentCreate', component: AppointmentForm, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/appointments/calendar', name: 'AppointmentCalendar', component: AppointmentCalendar, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/work-orders', name: 'WorkOrders', component: WorkOrderList, meta: { requiresAuth: true } },
  { path: '/work-orders/create', name: 'WorkOrderCreate', component: WorkOrderForm, meta: { requiresAuth: true, roles: ['admin', 'recepcionista'] } },
  { path: '/work-orders/:id', name: 'WorkOrderDetail', component: WorkOrderDetail, meta: { requiresAuth: true } },
  { path: '/services', name: 'Services', component: ServiceList, meta: { requiresAuth: true } },
  { path: '/users', name: 'Users', component: UserList, meta: { requiresAuth: true, roles: ['admin'] } },
  
  // Portal cliente
  {
    path: '/portal',
    component: ClientLayout,
    meta: { requiresAuth: true, roles: ['cliente'] },
    children: [
      { path: '', name: 'PortalHome', component: ClientHome },
      { path: 'appointments', name: 'PortalAppointments', component: ClientAppointments },
      { path: 'appointments/new', name: 'PortalNewAppointment', component: NewAppointment },
      { path: 'orders', name: 'PortalOrders', component: ClientOrders },
      { path: 'vehicles', name: 'PortalVehicles', component: ClientVehicles }
    ]
  },

  { path: '/:pathMatch(.*)*', component: { template: '<div class="container mt-5 text-center"><h1>404</h1><p>Página no encontrada</p></div>' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

    router.beforeEach((to, from, next) => {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      
      document.title = to.name ? `Genesis Motors - ${to.name}` : 'Genesis Motors'
      
      if (to.meta.requiresAuth && !token) {
        next('/login')
        return
      }

    
      if (to.meta.guest && token) {
        if (user?.rol === 'cliente') {
          next('/portal')
        } else {
          next('/dashboard')
        }
        return
      }
      
      if (to.meta.roles && user) {
        if (!to.meta.roles.includes(user.rol)) {
          // Redirigir según el rol
          if (user.rol === 'cliente') {
            next('/portal')
          } else if (user.rol === 'mecanico') {
            next('/work-orders')
          } else {
            next('/dashboard')
          }
          return
        }
      }
      
      if (to.path === '/dashboard' && user?.rol === 'mecanico') {
        next('/work-orders')
        return
      }
      
      next()
    })

const app = createApp(App)
app.use(router)
app.mount('#app')