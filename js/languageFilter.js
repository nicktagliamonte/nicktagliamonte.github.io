// Array to store selected languages
const selectedLanguages = [];

// Get reference to the "Clear Filters" button
const clearFiltersButton = document.getElementById("clear-filters");

// Function to set up language tag click listeners
function setupLanguageTagListeners() {
  document.querySelectorAll(".language-tag").forEach((tag) => {
    tag.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent the click event from bubbling up to the parent div

      const language = this.getAttribute("data-language"); // Get the language from the data attribute

      // Check if the language is already selected
      if (selectedLanguages.includes(language)) {
        // If already selected, remove it from the array
        selectedLanguages.splice(selectedLanguages.indexOf(language), 1);
        this.classList.remove("selected"); // Remove the selected class from the tag
      } else {
        // If not selected, add it to the array
        selectedLanguages.push(language);
        this.classList.add("selected"); // Add the selected class to the tag
      }

      // Filter project cards based on selected languages
      document.querySelectorAll(".project-card").forEach((card) => {
        // Check if the card contains all selected languages
        const cardLanguages = Array.from(
          card.querySelectorAll(".language-tag")
        ).map((tag) => tag.getAttribute("data-language"));
        const isMatch = selectedLanguages.every((lang) =>
          cardLanguages.includes(lang)
        );

        // Show or hide the card based on whether it matches all selected languages
        card.style.display = isMatch ? "block" : "none";
      });

      // Highlight all instances of the selected tag in all project cards
      document.querySelectorAll(".language-tag").forEach((tag) => {
        if (selectedLanguages.includes(tag.getAttribute("data-language"))) {
          tag.classList.add("selected"); // Highlight matching tags
        } else {
          tag.classList.remove("selected"); // Remove highlight from non-matching tags
        }
      });

      // Update the visibility of the clear filters button
      updateFilterDisplay();
    });
  });
}

// Clear filters button event listener
clearFiltersButton.addEventListener("click", () => {
  // Deselect all language tags
  document
    .querySelectorAll(".language-tag")
    .forEach((tag) => tag.classList.remove("selected"));
  selectedLanguages.length = 0; // Clear the selected languages array

  // Show all project cards
  document.querySelectorAll(".project-card").forEach((card) => {
    card.style.display = "block";
  });
});

// Set up event listeners and initialize visibility on page load
document.addEventListener("DOMContentLoaded", function () {
  setupLanguageTagListeners();
});
