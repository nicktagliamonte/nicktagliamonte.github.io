document.getElementById('darkModeToggle').addEventListener('change', function () {
    document.body.classList.toggle('dark-mode');

    const header = document.querySelector('header');
    header.classList.toggle('dark-mode');

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode'));

    console.log("Dark mode activated: ", this.checked); // Check if toggle works
});

// Function to apply dark mode based on saved preference
function applyDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);

    const header = document.querySelector('header');
    header.classList.toggle('dark-mode', isDarkMode);

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode', isDarkMode));
}

// Event listener for the dark mode toggle
document.getElementById('darkModeToggle').addEventListener('change', function () {
    const isChecked = this.checked;
    document.body.classList.toggle('dark-mode', isChecked);

    const header = document.querySelector('header');
    header.classList.toggle('dark-mode', isChecked);

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode', isChecked));

    // Save user preference in local storage
    localStorage.setItem('darkMode', isChecked);
});

document.querySelector('.overlay-sun-icon').addEventListener('click', function() {
    const isDarkMode = document.body.classList.toggle('dark-mode');

    // Update the local storage
    localStorage.setItem('darkMode', isDarkMode);

    // Log for debugging
    console.log("Dark mode activated: ", isDarkMode);
});

// Check local storage on page load
document.addEventListener('DOMContentLoaded', function () {
    applyDarkMode();
    // Set checkbox state based on saved preference
    const toggle = document.getElementById('darkModeToggle');
    toggle.checked = localStorage.getItem('darkMode') === 'true';
});