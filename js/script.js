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

// JavaScript to handle the dark mode toggle
document.getElementById('darkModeToggle').addEventListener('change', function() {
    document.body.classList.toggle('dark-mode');
    
    // Optional: Change header or other elements
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
    
    // Optional: Change header or other elements
    const header = document.querySelector('header');
    header.classList.toggle('dark-mode', isDarkMode);
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode', isDarkMode));
}

// Event listener for the dark mode toggle
document.getElementById('darkModeToggle').addEventListener('change', function() {
    const isChecked = this.checked;
    document.body.classList.toggle('dark-mode', isChecked);
    
    // Optional: Change header or other elements
    const header = document.querySelector('header');
    header.classList.toggle('dark-mode', isChecked);
    
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode', isChecked));
    
    // Save user preference in local storage
    localStorage.setItem('darkMode', isChecked);
});

// Check local storage on page load
document.addEventListener('DOMContentLoaded', function() {
    applyDarkMode();
    // Set checkbox state based on saved preference
    const toggle = document.getElementById('darkModeToggle');
    toggle.checked = localStorage.getItem('darkMode') === 'true';
});

document.addEventListener("DOMContentLoaded", function () {
    const projectCards = document.querySelectorAll(".project-card");
    const options = {
        root: null, // Use the viewport as the root
        rootMargin: "0px",
        threshold: 0.9 // Trigger when 50% of the card is visible
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

function validateForm() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');

    for (let input of inputs) {
        if (!input.value.trim()) {
            alert("All fields must be filled out."); // Alert user if validation fails
            return false; // Form is invalid if any field is empty
        }
    }
    return true; // All fields are filled
}

function sendEmail() {
    const form = document.getElementById('contactForm');
    const data = {
        first_name: form['first-name'].value,
        last_name: form['last-name'].value,
        email: form['email'].value,
        subject: form['subject'].value, // This is the subject field
        message: form['message'].value
    };

    emailjs.send('service_v32y2lc', 'template_h7ht0we', data)
        .then((response) => {
            console.log("Email sent successfully", response.status, response.text);
            alert("Message sent successfully!"); // Alert user on success
            form.reset(); // Reset the form
        }, (error) => {
            console.error("Failed to send email", error);
            alert("Failed to send message. Please try again."); // Alert user on error
        });
}