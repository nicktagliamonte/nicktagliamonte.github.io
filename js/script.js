// Select all anchor links in the projects header
const links = document.querySelectorAll('.projects-header a');

// Add click event listeners to each link
links.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent the default anchor behavior

        // Get the target section ID from the link's href attribute
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Calculate the offset based on the navigation bar height
        const navHeight = document.querySelector('.navigation').offsetHeight; // Get the height of the navigation bar
        const projHeight = document.querySelector('.projects-header').offsetHeight; // Get the height of the project header
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight - projHeight; // Adjust position

        // Scroll smoothly to the calculated position
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth' // Smooth scroll
        });
    });
});
