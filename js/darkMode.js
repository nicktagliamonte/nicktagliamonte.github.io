document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const overlaySunIcon = document.querySelector(".overlay-sun-icon");

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", function () {
      document.body.classList.toggle("dark-mode");

      const header = document.querySelector("header");
      header.classList.toggle("dark-mode");

      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card) => card.classList.toggle("dark-mode"));

      localStorage.setItem("darkMode", this.checked);
    });

    darkModeToggle.checked = localStorage.getItem("darkMode") === "true";
  }

  if (overlaySunIcon) {
    overlaySunIcon.addEventListener("click", function () {
      const isDarkMode = document.body.classList.toggle("dark-mode");
      localStorage.setItem("darkMode", isDarkMode);
    });
  }

  applyDarkMode();
});

// Function to apply dark mode based on saved preference
function applyDarkMode() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", isDarkMode);

  const header = document.querySelector("header");
  header.classList.toggle("dark-mode", isDarkMode);

  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) =>
    card.classList.toggle("dark-mode", isDarkMode)
  );
}
