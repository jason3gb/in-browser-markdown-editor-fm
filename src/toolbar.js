
export function toolbarLoader() {
  // Select the toolbar icon
  const menuBar = document.querySelector('.menu-bar'); // replace 'toolbar-icon-class' with the actual class or id of the toolbar icon
  let isToolbarVisible = false;

  let displayToolbar = (visible) => {
    // Select the toolbar section
    const toolbarSection = document.querySelector('.editor-sidebar'); // replace 'toolbar-section-class' with the actual class or id of the toolbar section
    const toolbarIcon = document.querySelector('.menu-bar > .menu-bar-icon');

    // Toggle the display of the toolbar section
    if (visible) {
      toolbarSection.style.maxWidth = '250px';
      isToolbarVisible = true;
      toolbarIcon.style.backgroundImage = "url('./assets/icon-close.svg')";
    } else {
      toolbarSection.style.maxWidth = '0';
      isToolbarVisible = false;
      toolbarIcon.style.backgroundImage = "url('./assets/icon-menu.svg')";
    }
  }

  displayToolbar(isToolbarVisible);

  // Add a click event listener to the toolbar icon
  menuBar.addEventListener('click', () => {
    isToolbarVisible = !isToolbarVisible;
    displayToolbar(isToolbarVisible);
  });
}