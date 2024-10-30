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

function sendMail() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validate form fields
    if (!firstName || !lastName || !email || !subject || !message) {
        alert("All fields must be filled out.");
        return false; // Prevent form submission
    }

    // Construct mailto link
    const mailtoLink = `mailto:ntagliamonte28@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`)}`;

    // Open the user's default mail client
    window.location.href = mailtoLink;

    return false; // Prevent form submission
}

document.addEventListener('DOMContentLoaded', () => {
    const photosContainer = document.getElementById('photos-container');
    const slideshowModal = document.getElementById('slideshow-modal');
    const slideshowImage = document.querySelector('.slideshow-image');
    const closeModal = document.querySelector('.close');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    const imageFilenames = [
        'Amsterdam Central Canal.JPG', 'Amsterdam from Restaurant.JPG', 'Amsterdam Train Station.jpg', 
        'Auditorium.jpg', 'Bolzano.jpg', 'Cathedral.JPG', 'Dougie.png', 'Drug Church.jpg', 
        'Duck.jpg', 'Jefferson Memorial.jpg', 'Milan.jpg', 'Milanese.jpg', 'Mountain View.JPG', 
        'PCT End.png', 'PCT Start.png', 'Profile.JPG', 'Rijksmuseum.jpg', 'Scout on Beach.PNG', 
        'Tre Cime.jpg', 'Wedding.jpg'
    ];

    let currentIndex = 0;

    // Loop through filenames, creating img elements for each
    imageFilenames.forEach((filename, index) => {
        const img = document.createElement('img');
        img.src = `images/${filename}`; // Path to each image
        img.alt = filename; // Optional: improves accessibility
        img.classList.add('photo-thumbnail'); // Add a class for styling
        img.style.cursor = 'pointer'; // Change cursor to pointer on hover
        img.addEventListener('click', () => openSlideshow(index)); // Open slideshow on click
        photosContainer.appendChild(img);
    });

    function openSlideshow(index) {
        currentIndex = index; // Set current index
        slideshowImage.src = `images/${imageFilenames[currentIndex]}`; // Set the initial image
        slideshowModal.style.display = 'block'; // Show the modal
    }

    closeModal.addEventListener('click', () => {
        slideshowModal.style.display = 'none'; // Close modal
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : imageFilenames.length - 1; // Loop to last
        slideshowImage.src = `images/${imageFilenames[currentIndex]}`; // Update image
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex < imageFilenames.length - 1) ? currentIndex + 1 : 0; // Loop to first
        slideshowImage.src = `images/${imageFilenames[currentIndex]}`; // Update image
    });

    // Close modal when clicking outside of modal content
    window.addEventListener('click', (event) => {
        if (event.target === slideshowModal) {
            slideshowModal.style.display = 'none';
        }
    });
});