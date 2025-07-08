import React from 'react';
import r2wc from '@r2wc/react-to-web-component';
import { GutenbergApp } from './GutenbergApp';
import './styles/main.css';
import './utils/initializeElements.js';

// Create the web component using r2wc
const GutenbergWebComponent = r2wc(GutenbergApp, {
  props: {
    'user-role': 'string',
    'site-url': 'string', 
    'user-id': 'number',
    'settings': 'json',
    'api-nonce': 'string',
    'plugin-version': 'string',
    'is-admin': 'boolean',
    'theme': 'string',
    'tailwind-css': 'string'
  },
  shadow: 'open'
});

// Register the web component
customElements.define('gutenberg-inline-manager', GutenbergWebComponent);

// Inject into Gutenberg when ready
function injectIntoGutenberg() {
  const waitForGutenberg = () => {
    const gutenbergBody = document.querySelector('.interface-interface-skeleton__body');
    
    if (gutenbergBody && !gutenbergBody.querySelector('gutenberg-inline-manager')) {
      // Create the component element
      const manager = document.createElement('gutenberg-inline-manager');
      
      // Give the component proper dimensions - use inline style for dynamic width control
      manager.className = 'block h-full max-h-screen overflow-hidden flex-shrink-0';
      manager.style.width = '60px'; // Default collapsed width - will be controlled by React component
      manager.style.transition = 'width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'; // Smooth transition
      
      // Make the Gutenberg body a flex container to accommodate our sidebar
      gutenbergBody.className = gutenbergBody.className + ' flex';
      
      // Insert as first child in Gutenberg body (left side)
      gutenbergBody.insertBefore(manager, gutenbergBody.firstChild);
    } else if (!gutenbergBody) {
      // Keep checking for Gutenberg
      setTimeout(waitForGutenberg, 100);
    }
  };
  
  // Start checking immediately
  waitForGutenberg();
  
  // Also listen for when Gutenberg loads dynamically
  if (window.wp && window.wp.domReady) {
    window.wp.domReady(waitForGutenberg);
  }
}

// Export for global access
window.GutenbergInlineManager = {
  GutenbergApp,
  injectIntoGutenberg,
  init: () => {
    // Auto-inject when initialized
    injectIntoGutenberg();
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.GutenbergInlineManager.init();
});