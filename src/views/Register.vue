<template>
  <div class="register-container">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6">
          <div class="card shadow-lg">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-car fa-3x text-primary mb-3"></i>
                <h2>Genesis Motors</h2>
                <p class="text-muted">Crear Cuenta de Cliente</p>
              </div>
              
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label">Nombre completo *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input v-model="form.nombre" type="text" class="form-control" 
                      placeholder="Ingresa tu nombre completo" required>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input v-model="form.email" type="email" class="form-control" 
                      placeholder="correo@ejemplo.com" required>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Teléfono</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-phone"></i></span>
                    <input v-model="form.telefono" type="text" class="form-control" 
                      placeholder="999 888 777">
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Contraseña *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" 
                      class="form-control" placeholder="Mínimo 6 caracteres" required minlength="6">
                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Confirmar Contraseña *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input v-model="form.confirmPassword" type="password" class="form-control" 
                      placeholder="Repite tu contraseña" required minlength="6">
                  </div>
                </div>
                
                <div v-if="error" class="alert alert-danger alert-dismissible fade show">
                  <i class="fas fa-exclamation-triangle"></i> {{ error }}
                  <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <div v-if="success" class="alert alert-success">
                  <i class="fas fa-check-circle"></i> {{ success }}
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
              </form>
              
              <div class="text-center">
                <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
              </div>

              <hr>
              
              <div class="text-center">
                <p class="text-muted small">
                  <i class="fas fa-shield-alt"></i> 
                  ¿Eres empleado? El administrador debe crear tu cuenta.
                  <br>Contacta a tu supervisor.
                </p>
                <router-link to="/" class="btn btn-link btn-sm">← Volver al inicio</router-link>
              </div>
            </div>
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
  name: 'RegisterView',
  data() {
    return {
      form: {
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: '',
      success: '',
      showPassword: false
    }
  },
  methods: {
    async handleRegister() {
      this.error = '';
      this.success = '';
      
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Las contraseñas no coinciden';
        return;
      }
      
      if (this.form.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await axios.post(`${API_URL}/auth/register-client`, {
          nombre: this.form.nombre,
          email: this.form.email,
          telefono: this.form.telefono,
          password: this.form.password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.success = '¡Cuenta creada exitosamente! Redirigiendo a tu portal...';
        setTimeout(() => {
          this.$router.push('/portal');
        }, 2000);
        
      } catch (err) {
        this.error = err.response?.data?.error || 'Error al crear la cuenta';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border: none;
  border-radius: 15px;
}
</style>