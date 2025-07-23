import './styles/main.css';
import { Authentication } from './components/Authentication.js';
import { onUserStateChanged } from './services/firebaseService.js';

// Main entry point
function init() {
  console.log('MHS Driving School PWA Initialized');
  
  // Check if user is already authenticated
  onUserStateChanged((user) => {
    if (user) {
      // User is signed in, show dashboard
      import('./components/Dashboard.js').then(({ Dashboard }) => {
        new Dashboard(user);
      });
    } else {
      // User is signed out, show authentication
      new Authentication();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
