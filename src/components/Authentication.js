import { registerUser, loginUser, logoutUser, saveUserProfile } from '../services/firebaseService.js';

class Authentication {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.createAuthContainer();
    this.attachEventListeners();
  }

  createAuthContainer() {
    const authHTML = `
      <div id="auth-container" class="auth-container">
        <div class="auth-form">
          <div class="logo-container">
            <img src="assets/logo.png" alt="MHS Driving School" class="logo">
            <h1>MHS Driving School</h1>
            <p>K53 Road Traffic Signs Learning</p>
          </div>
          
          <form id="login-form" class="form active">
            <h2>Sign In</h2>
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <input type="email" id="login-email" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" required>
            </div>
            <button type="submit" class="btn-primary">Sign In</button>
            <p class="switch-form">
              Don't have an account? <a href="#" id="show-register">Register here</a>
            </p>
          </form>

          <form id="register-form" class="form">
            <h2>Create Account</h2>
            <div class="form-group">
              <label for="register-name">Full Name</label>
              <input type="text" id="register-name" required>
            </div>
            <div class="form-group">
              <label for="register-surname">Surname</label>
              <input type="text" id="register-surname" required>
            </div>
            <div class="form-group">
              <label for="register-id">ID Number</label>
              <input type="text" id="register-id" required>
            </div>
            <div class="form-group">
              <label for="register-email">Email Address</label>
              <input type="email" id="register-email" required>
            </div>
            <div class="form-group">
              <label for="register-password">Password</label>
              <input type="password" id="register-password" required>
            </div>
            <div class="form-group">
              <label for="register-confirm">Confirm Password</label>
              <input type="password" id="register-confirm" required>
            </div>
            <button type="submit" class="btn-primary">Create Account</button>
            <p class="switch-form">
              Already have an account? <a href="#" id="show-login">Sign in here</a>
            </p>
          </form>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = authHTML;
  }

  attachEventListeners() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    });

    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
    });

    loginForm.addEventListener('submit', this.handleLogin.bind(this));
    registerForm.addEventListener('submit', this.handleRegister.bind(this));
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const userCredential = await loginUser(email, password);
      this.currentUser = userCredential.user;
      this.onAuthSuccess();
    } catch (error) {
      this.showError('Login failed: ' + error.message);
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const surname = document.getElementById('register-surname').value;
    const idNumber = document.getElementById('register-id').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await registerUser(email, password);
      this.currentUser = userCredential.user;
      
      // Save additional user data
      await saveUserProfile(userCredential.user.uid, {
        name,
        surname,
        idNumber,
        email,
        createdAt: new Date()
      });

      this.onAuthSuccess();
    } catch (error) {
      this.showError('Registration failed: ' + error.message);
    }
  }

  showError(message) {
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const authForm = document.querySelector('.auth-form');
    authForm.insertBefore(errorDiv, authForm.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  onAuthSuccess() {
    // Redirect to dashboard
    import('../components/Dashboard.js').then(({ Dashboard }) => {
      new Dashboard(this.currentUser);
    });
  }
}

export { Authentication };
