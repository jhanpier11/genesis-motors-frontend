<template>
  <div class="container-fluid">
    <h2 class="mb-4">Mi Perfil</h2>
    
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-user-edit text-primary"></i> Datos Personales
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input v-model="profile.nombre" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="profile.email" type="email" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input v-model="profile.telefono" type="text" class="form-control">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="profileLoading">
                <span v-if="profileLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-save"></i>
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div class="col-md-6 mb-4">
        <div class="card shadow">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-key text-warning"></i> Cambiar Contraseña
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Contraseña Actual</label>
                <input v-model="passwordForm.currentPassword" type="password" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Nueva Contraseña</label>
                <input v-model="passwordForm.newPassword" type="password" class="form-control" required minlength="6">
              </div>
              <div class="mb-3">
                <label class="form-label">Confirmar Nueva Contraseña</label>
                <input v-model="passwordForm.confirmPassword" type="password" class="form-control" required>
              </div>
              <button type="submit" class="btn btn-warning" :disabled="passwordLoading">
                <span v-if="passwordLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-key"></i>
                Cambiar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-white">
            <h5 class="mb-0">
              <i class="fas fa-info-circle text-info"></i> Información de Cuenta
            </h5>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <tr>
                <th>Rol</th>
                <td>
                  <span :class="getRoleClass(userRole)" class="badge">
                    {{ formatRole(userRole) }}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>
                  <span class="badge bg-success">Activo</span>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/api';

export default {
  name: 'ProfileView',
  data() {
    return {
      profile: {
        nombre: '',
        email: '',
        telefono: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      profileLoading: false,
      passwordLoading: false,
      userRole: ''
    }
  },
  created() {
    this.loadProfile();
  },
  methods: {
    loadProfile() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.profile.nombre = user.nombre || '';
      this.profile.email = user.email || '';
      this.profile.telefono = user.telefono || '';
      this.userRole = user.rol || '';
    },
    async updateProfile() {
      this.profileLoading = true;
      try {
        await userService.updateProfile(this.profile);

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nombre = this.profile.nombre;
        user.email = this.profile.email;
        user.telefono = this.profile.telefono;
        localStorage.setItem('user', JSON.stringify(user));

        alert('Perfil actualizado correctamente');
      } catch (error) {
        alert(error.response?.data?.error || 'Error al actualizar perfil');
      } finally {
        this.profileLoading = false;
      }
    },
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      if (this.passwordForm.newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      this.passwordLoading = true;
      try {
        await userService.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword
        });

        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        alert('Contraseña cambiada exitosamente');
      } catch (error) {
        alert(error.response?.data?.error || 'Error al cambiar contraseña');
      } finally {
        this.passwordLoading = false;
      }
    },
    getRoleClass(rol) {
      const classes = {
        'admin': 'bg-danger',
        'mecanico': 'bg-primary',
        'recepcionista': 'bg-info',
        'cliente': 'bg-success'
      };
      return classes[rol] || 'bg-secondary';
    },
    formatRole(rol) {
      const roles = {
        'admin': 'Administrador',
        'mecanico': 'Mecánico',
        'recepcionista': 'Recepcionista',
        'cliente': 'Cliente'
      };
      return roles[rol] || rol;
    }
  }
}
</script>