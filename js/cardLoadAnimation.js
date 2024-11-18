document.addEventListener("DOMContentLoaded", function () {
    const projectCards = document.querySelectorAll(".project-card");
    const options = {
        root: null, // Use the viewport as the root
        rootMargin: "0px",
        threshold: 0.7 // Trigger when 70% of the card is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Show the card
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, options);

    projectCards.forEach(card => {
        observer.observe(card); // Observe each project card
    });
});
