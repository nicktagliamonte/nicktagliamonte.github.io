const menuIcon = document.getElementById('mobile-menu-icon');
const overlayMenu = document.getElementById('overlay-menu');

menuIcon.addEventListener('click', () => {
    overlayMenu.classList.toggle('show');
});

// Optional: Close the overlay when clicking outside the nav links
overlayMenu.addEventListener('click', (e) => {
    if (e.target === overlayMenu) {
        overlayMenu.classList.remove('show');
    }
});