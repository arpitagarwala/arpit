// Global Theme Manager for Arpit's Portfolio
// Include this file on all pages for consistent theming

(function() {
  'use strict';

  // Initialize theme on page load
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark class for light mode (Tailwind's dark mode)
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      updateIcon('sun');
    } else {
      document.documentElement.classList.remove('dark');
      updateIcon('moon');
    }
  }

  // Update theme icon if it exists
  function updateIcon(type) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    if (type === 'sun') {
      icon.className = 'ri-sun-line text-xl';
    } else {
      icon.className = 'ri-moon-line text-xl';
    }
  }

  // Toggle theme function (called by button)
  window.toggleTheme = function() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      // Switch to light mode
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      updateIcon('moon');
    } else {
      // Switch to dark mode
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      updateIcon('sun');
    }
  };

  // Initialize immediately
  initTheme();

  // Re-initialize when DOM is fully loaded (in case script runs before icon loads)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  }
})();
