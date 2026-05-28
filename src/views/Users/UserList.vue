<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Gestión de Usuarios</h2>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="fas fa-user-plus"></i> Nuevo Usuario
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">
                      {{ user.nombre.charAt(0).toUpperCase() }}
                    </div>
                    {{ user.nombre }}
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="getRoleClass(user.rol)" class="badge">
                    {{ user.rol }}
                  </span>
                </td>
                <td>
                  <span :class="user.activo ? 'bg-success' : 'bg-danger'" class="badge">
                    {{ user.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="editUser(user)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="toggleUserStatus(user)"
                    :title="user.activo ? 'Desactivar' : 'Activar'"
                  >
                    <i :class="user.activo ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>




                  <button 
                    class="btn btn-sm btn-danger ms-1" 
                    @click="deleteUserPermanently(user)"
                    title="Eliminar permanentemente"
                  >
                    <i class="fas fa-trash"></i>
                  </button>





                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="6" class="text-center">No hay usuarios registrados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar usuario -->
    <div v-if="showForm" class="modal-backdrop" @click="closeForm"></div>
    <div v-if="showForm" class="modal show d-block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-cog"></i>
              {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input v-model="form.nombre" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input v-model="form.email" type="email" class="form-control" required>
              </div>
              <div class="mb-3" v-if="!editingUser">
                <label class="form-label">Contraseña *</label>
                <input v-model="form.password" type="password" class="form-control" 
                  required minlength="6">
              </div>
              <div class="mb-3">
                <label class="form-label">Rol *</label>
                <select v-model="form.rol" class="form-select" required>
                  <option value="admin">Administrador</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="mecanico">Mecánico</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>
              <div v-if="error" class="alert alert-danger">{{ error }}</div>
              <div v-if="success" class="alert alert-success">{{ success }}</div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  {{ loading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/api';

export default {
  name: 'UserList',
  data() {
    return {
      users: [],
      showForm: false,
      editingUser: null,
      loading: false,
      error: '',
      success: '',
      form: {
        nombre: '',
        email: '',
        password: '',
        rol: 'mecanico'
      }
    }
  },
  created() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      try {
        const response = await userService.getAll();
        this.users = response.data.users;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    },
    editUser(user) {
      this.editingUser = user;
      this.form = {
        nombre: user.nombre,
        email: user.email,
        password: '',
        rol: user.rol
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
      this.editingUser = null;
      this.error = '';
      this.success = '';
      this.form = {
        nombre: '',
        email: '',
        password: '',
        rol: 'mecanico'
      };
    },
    async saveUser() {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      try {
        if (this.editingUser) {
          const updateData = {
            nombre: this.form.nombre,
            email: this.form.email,
            rol: this.form.rol
          };
          await userService.update(this.editingUser.id, updateData);
          this.success = 'Usuario actualizado exitosamente';
        } else {
          await userService.create(this.form);
          this.success = 'Usuario creado exitosamente';
        }
        
        setTimeout(() => {
          this.closeForm();
          this.loadUsers();
        }, 1500);
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al guardar usuario';
      } finally {
        this.loading = false;
      }
    },
    async toggleUserStatus(user) {
      const action = user.activo ? 'desactivar' : 'activar';
      if (!confirm(`¿Está seguro de ${action} este usuario?`)) return;
      
      try {
        await userService.update(user.id, { activo: !user.activo });
        this.loadUsers();
      } catch (error) {
        alert('Error al cambiar estado del usuario');
      }
    },
    async deleteUserPermanently(user) {
      if (!confirm(`¿Eliminar definitivamente a ${user.nombre}? Esta acción NO se puede deshacer.`)) {
        return;
      }

      try {
        await userService.deletePermanent(user.id); // Aún no existe en el servicio, ver abajo
        this.loadUsers();
        alert('Usuario eliminado permanentemente');
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar usuario');
      }
    },
    getRoleClass(rol) {
      const classes = {
        'admin': 'bg-danger',
        'mecanico': 'bg-primary',
        'recepcionista': 'bg-info'
      };
      return classes[rol] || 'bg-secondary';
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
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
</style>