export function themeLoader(){
  const themeSwitch = document.getElementById('theme-switch');

  themeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    // Update the theme setting in localStorage
    if(document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark-mode');
    } else {
      localStorage.setItem('theme', 'light-mode');
    }

    console.log("Theme: ", localStorage.getItem('theme'));
  });

// On page load, apply the stored theme
  window.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme');
    if(storedTheme) {
      document.body.classList.add(storedTheme);
    }
  });
}