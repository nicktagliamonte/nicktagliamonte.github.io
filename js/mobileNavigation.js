document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.getElementById("mobile-menu-icon");
  const overlayMenu = document.getElementById("overlay-menu");

  if (menuIcon && overlayMenu) {
    menuIcon.addEventListener("click", () => {
      overlayMenu.classList.toggle("show");
    });

    overlayMenu.addEventListener("click", (e) => {
      if (e.target === overlayMenu) {
        overlayMenu.classList.remove("show");
      }
    });
  }
});
