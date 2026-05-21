<template>
  <div class="login-container">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5">
          <div class="card shadow-lg">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-car fa-3x text-primary mb-3"></i>
                <h2>Genesis Motors</h2>
                <p class="text-muted">Sistema de Gestión de Taller</p>
              </div>
              
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input 
                      v-model="form.email" 
                      type="email" 
                      class="form-control" 
                      placeholder="ejemplo@genesis.com"
                      required
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Contraseña</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input 
                      v-model="form.password" 
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control" 
                      placeholder="Ingrese su contraseña"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ error }}
                  <button type="button" class="btn-close" @click="error = ''"></button>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100 mb-3" 
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </button>
              </form>
              
              <div class="text-center mt-4">
                <button class="btn btn-link text-muted" @click="showRegister = !showRegister">
                  {{ showRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
                </button>
              </div>

              <!-- Formulario de registro -->
              <div v-if="showRegister" class="mt-3">
                <hr>
                <h5 class="text-center mb-3">Crear Cuenta</h5>
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input v-model="registerForm.nombre" type="text" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input v-model="registerForm.email" type="email" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Contraseña</label>
                    <input v-model="registerForm.password" type="password" class="form-control" required minlength="6">
                  </div>
                  <div v-if="registerError" class="alert alert-danger">{{ registerError }}</div>
                  <button type="submit" class="btn btn-success w-100" :disabled="registerLoading">
                    {{ registerLoading ? 'Registrando...' : 'Crear Cuenta' }}
                  </button>
                </form>
              </div>
              
              <div class="text-center text-muted mt-4">
                <small>Genesis Motors © {{ currentYear }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import { authService } from '@/services/api';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      registerForm: {
        nombre: '',
        email: '',
        password: ''
      },
      loading: false,
      registerLoading: false,
      error: '',
      registerError: '',
      showPassword: false,
      showRegister: false,
      currentYear: new Date().getFullYear()
    }
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      this.$router.push('/dashboard');
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';

      try {
        const response = await axios.post(`${API_URL}/auth/login`, this.form);
        
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        if (user.rol === 'cliente') {
          this.$router.push('/portal');
        } else if (user.rol === 'mecanico') {
          this.$router.push('/work-orders');
        } else {
          this.$router.push('/dashboard');
        }
      } catch (err) {
        if (err.response?.data?.error) {
          this.error = err.response.data.error;
        } else if (err.message === 'Network Error') {
          this.error = 'Error de conexión. Verifique que el servidor esté funcionando.';
        } else {
          this.error = 'Error al iniciar sesión. Intente nuevamente.';
        }
      } finally {
        this.loading = false;
      }
    },
    async handleRegister() {
      this.registerLoading = true;
      this.registerError = '';

      try {
        const response = await axios.post(`${API_URL}/auth/register`, this.registerForm);
        
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        this.$router.push('/dashboard');
      } catch (err) {
        if (err.response?.data?.error) {
          this.registerError = err.response.data.error;
        } else if (err.message === 'Network Error') {
          this.registerError = 'Error de conexión. Verifique que el servidor esté funcionando.';
        } else {
          this.registerError = 'Error al registrarse. Intente nuevamente.';
        }
      } finally {
        this.registerLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border: none;
  border-radius: 15px;
}

.card-body {
  padding: 2.5rem;
}

.input-group-text {
  background-color: #f8f9fa;
}
</style>