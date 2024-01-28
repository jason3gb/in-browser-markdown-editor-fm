export function themeLoader() {
  const themeSwitch = document.getElementById('theme-switch');
  const darkThemeIcon = document.querySelector('.dark-theme-icon');
  const lightThemeIcon = document.querySelector('.light-theme-icon');

  // Function to update the icon styles and perform other logic for theme change
  function updateTheme(theme) {
    if (theme === 'light-mode') {
      // Apply light theme logic
      document.body.classList.remove('dark-mode');
      // Set light theme icon filter to white
      lightThemeIcon.style.filter = 'brightness(0) invert(1)';
      // Remove filter from dark theme icon
      darkThemeIcon.style.filter = '';

      localStorage.setItem('theme', 'light-mode');
    } else {
      // Apply dark theme logic
      document.body.classList.add('dark-mode');
      // Set dark theme icon filter to white
      darkThemeIcon.style.filter = 'brightness(0) invert(1)';
      // Remove filter from light theme icon
      lightThemeIcon.style.filter = '';

      localStorage.setItem('theme', 'dark-mode');
    }
  }

  // Event listener for change on the theme switch checkbox
  themeSwitch.addEventListener('change', () => {
    const theme = themeSwitch.checked ? 'light-mode' : 'dark-mode';
    updateTheme(theme);
  });

  // On page load, apply the stored theme
  window.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light-mode') {
      themeSwitch.checked = true;
    }
    updateTheme(storedTheme);
  });
}