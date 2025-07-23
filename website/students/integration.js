// Integration script for embedding PWA into main website
import { Authentication } from '../../src/components/Authentication.js';
import { onUserStateChanged } from '../../src/services/firebaseService.js';

// Initialize the PWA within the website context
class StudentPortalIntegration {
  constructor() {
    this.init();
  }

  init() {
    // Check for existing authentication state
    this.checkAuthState();
    
    // Add custom styling for website integration
    this.addIntegrationStyles();
    
    // Initialize analytics if available
    this.initializeAnalytics();
  }

  checkAuthState() {
    onUserStateChanged((user) => {
      if (user) {
        // User is signed in, show dashboard
        import('../../src/components/Dashboard.js').then(({ Dashboard }) => {
          new Dashboard(user);
        });
      } else {
        // User is signed out, show authentication
        new Authentication();
      }
    });
  }

  addIntegrationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Integration-specific styles */
      .auth-container {
        margin-top: 0;
        min-height: calc(100vh - 80px);
      }
      
      .dashboard-container {
        margin-top: 0;
      }
      
      /* Hide PWA header since we have website header */
      .dashboard-header {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  initializeAnalytics() {
    // Track student portal access
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Student Portal',
        page_location: window.location.href
      });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('MHS Student Portal Loading...');
  new StudentPortalIntegration();
});

export { StudentPortalIntegration };
