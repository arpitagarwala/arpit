// Global Theme Manager for Arpit's Portfolio
// This script must be included in <head> with defer or loaded inline for instant theme application

(function() {
  'use strict';

  // Apply theme immediately (call this inline in <head> for no-flash loading)
  function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return isDark ? 'dark' : 'light';
  }

  // Update theme icon
  function updateIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    if (theme === 'light') {
      icon.className = 'ri-moon-line text-xl';
    } else {
      icon.className = 'ri-sun-line text-xl';
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
      updateIcon('light');
    } else {
      // Switch to dark mode
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      updateIcon('dark');
    }
  };

  // Initialize on page load
  function init() {
    const currentTheme = applyTheme();
    updateIcon(currentTheme);
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also apply immediately if script runs in head
  applyTheme();
})();
