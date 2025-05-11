document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const overlaySunIcon = document.querySelector(".overlay-sun-icon");
  const iframe = document.querySelector("iframe[src*='sorting-visualizer']");

  function updateIframeMode() {
    if (iframe) {
      const isDarkMode = document.body.classList.contains("dark-mode");
      const baseSrc = "https://nicktagliamonte.github.io/sorting-visualizer";
      iframe.src = `${baseSrc}?mode=${isDarkMode ? "dark" : "light"}`;
    }
  }

  function updateUrlMode(isDarkMode) {
    const url = new URL(window.location);
    url.searchParams.set("mode", isDarkMode ? "dark" : "light");
    window.history.replaceState({}, "", url);
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", function () {
      const isDarkMode = this.checked;
      document.body.classList.toggle("dark-mode", isDarkMode);
      updateIframeMode();
      updateUrlMode(isDarkMode);

      const header = document.querySelector("header");
      header.classList.toggle("dark-mode", isDarkMode);

      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card) =>
        card.classList.toggle("dark-mode", isDarkMode)
      );

      localStorage.setItem("darkMode", isDarkMode);
    });

    darkModeToggle.checked = localStorage.getItem("darkMode") === "true";
  }

  if (overlaySunIcon) {
    overlaySunIcon.addEventListener("click", function () {
      const isDarkMode = document.body.classList.toggle("dark-mode");
      updateIframeMode();
      updateUrlMode(isDarkMode);

      const header = document.querySelector("header");
      header.classList.toggle("dark-mode", isDarkMode);

      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card) =>
        card.classList.toggle("dark-mode", isDarkMode)
      );

      localStorage.setItem("darkMode", isDarkMode);
    });
  }

  applyDarkMode();
  updateIframeMode();
  updateUrlMode(document.body.classList.contains("dark-mode"));
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
