// Select all anchor links in the projects header
const links = document.querySelectorAll('.projects-header a');

// Add click event listeners to each link
links.forEach(link => {
    link.addEventListener('click', function (e) {
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
document.getElementById('darkModeToggle').addEventListener('change', function () {
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

    const header = document.querySelector('header');
    header.classList.toggle('dark-mode', isDarkMode);

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => card.classList.toggle('dark-mode', isDarkMode));
}

// Event listener for the dark mode toggle
document.getElementById('darkModeToggle').addEventListener('change', function () {
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
        'PCT End.png', 'Pct Start.png', 'Profile.JPG', 'Rijksmuseum.jpg', 'Scout on Beach.PNG',
        'Tre Cime.jpg', 'Wedding.jpg'
    ];

    let currentIndex = 0;

    // Loop through filenames, creating img elements for each
    imageFilenames.forEach((filename, index) => {
        const img = document.createElement('img');
        img.src = `images/${filename}`; // Path to each image
        img.alt = filename; // Optional: improves accessibility
        img.classList.add('photo-thumbnail'); // Add a class for styling
        img.style.cursor = 'crosshair'; // Change cursor to pointer on hover
        img.addEventListener('click', () => openSlideshow(index)); // Open slideshow on click
        photosContainer.appendChild(img);

        // Observe the image for visibility
        const options = {
            root: null, // Use the viewport as the root
            rootMargin: '0px',
            threshold: 0.9 // Trigger when 90% of the card is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Show the card
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, options);

        observer.observe(img); // Observe the current image
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

document.addEventListener('DOMContentLoaded', () => {
    const booksContainer = document.getElementById('books-container');

    const imageFilenames = [
        '1q84.jpg', 'Acceptance.jpg', 'Anathem.jpg', 'Annihilation.jpg', 'Antimemetics.jpg', 'Authority.jpg',
        'Axiomatic.jpg', 'BBoD.jpg', 'Diaspora.jpg', 'Disquiet.jpg', 'Infinite Jest.jpg', 'Kafka.jpg',
        'Nausea.jpg', 'Notes From Underground.jpg', 'Permutation City.jpg', 'Prime Intellect.jpg',
        'Quarantine.jpg', 'Schilds Ladder.jpg', 'Strange Code.jpg', 'The Man Who Folded Himself.jpg',
        'The Stranger.jpg', 'Three Stigmata.jpg', 'Ubik.jpg'
    ];

    const links = [
        'https://www.goodreads.com/book/show/10357575-1q84?from_search=true&from_srp=true&qid=idWQGZw47V&rank=1',
        'https://www.jeffvandermeer.com/book/acceptance', 'https://www.goodreads.com/book/show/2845024-anathem', 'https://www.jeffvandermeer.com/book/annihilation',
        'https://www.goodreads.com/book/show/54870256-there-is-no-antimemetics-division?from_search=true&from_srp=true&qid=RMJvWA2zc3&rank=1',
        'https://www.jeffvandermeer.com/book/authority', 'https://www.gregegan.net/',
        'https://www.goodreads.com/book/show/203578812-i-m-starting-to-worry-about-this-black-box-of-doom?ref=nav_sb_ss_1_14', 'https://www.gregegan.net/',
        'https://www.goodreads.com/book/show/45974.The_Book_of_Disquiet?from_search=true&from_srp=true&qid=Nzki8zbVB7&rank=1',
        'https://www.goodreads.com/search?q=infinite+jest&ref=nav_sb_noss_l_13',
        'https://www.goodreads.com/book/show/4929.Kafka_on_the_Shore?from_search=true&from_srp=true&qid=VKb1dkkRNl&rank=1',
        'https://www.goodreads.com/book/show/298275.Nausea?from_search=true&from_srp=true&qid=kZJtnF96KG&rank=1',
        'https://www.goodreads.com/book/show/49455.Notes_from_Underground?ref=nav_sb_ss_1_16', 'https://www.gregegan.net/',
        'https://www.goodreads.com/book/show/64341.The_Metamorphosis_of_Prime_Intellect?from_search=true&from_srp=true&qid=tfnf0oUjkF&rank=1', 'https://www.gregegan.net/',
        'https://www.gregegan.net/', 'https://www.goodreads.com/book/show/60704817-strange-code?from_search=true&from_srp=true&qid=GWND1c1FsF&rank=1',
        'https://www.goodreads.com/book/show/624122.The_Man_Who_Folded_Himself?from_search=true&from_srp=true&qid=3KMZFqJnIq&rank=1',
        'https://www.goodreads.com/book/show/49552.The_Stranger?ref=nav_sb_ss_1_12',
        'https://www.goodreads.com/book/show/14185.The_Three_Stigmata_of_Palmer_Eldritch?ref=nav_sb_ss_1_10',
        'https://www.goodreads.com/book/show/22590.Ubik?ref=nav_sb_ss_1_4'
    ];

    // Loop through filenames, creating img elements for each
    imageFilenames.forEach((filename, index) => {
        const a = document.createElement('a'); // Create an anchor element
        a.href = links[index]; // Set the href to the corresponding link
        a.target = '_blank'; // Open the link in a new tab

        const img = document.createElement('img');
        img.src = `books/${filename}`; // Path to each image
        img.alt = filename; // Optional: improves accessibility
        img.classList.add('book-thumbnail'); // Add a class for styling
        img.style.cursor = 'crosshair'; // Change cursor to pointer on hover

        a.appendChild(img); // Append the image to the anchor
        booksContainer.appendChild(a); // Append the anchor to the books container

        // Observe the image for visibility
        const options = {
            root: null, // Use the viewport as the root
            rootMargin: '0px',
            threshold: 0.9 // Trigger when 90% of the card is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible'); // Show the card
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, options);

        observer.observe(img); // Observe the current image
    });
});

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

// Array to store selected languages
const selectedLanguages = [];

// Get reference to the "Clear Filters" button
const clearFiltersButton = document.getElementById('clear-filters');

// Function to update the visibility of the clear filters button
function updateFilterDisplay() {
    // Removed logic that hides the button
    // Now it is always visible
}

// Function to set up language tag click listeners
function setupLanguageTagListeners() {
    document.querySelectorAll('.language-tag').forEach(tag => {
        tag.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the click event from bubbling up to the parent div

            const language = this.getAttribute('data-language'); // Get the language from the data attribute

            // Check if the language is already selected
            if (selectedLanguages.includes(language)) {
                // If already selected, remove it from the array
                selectedLanguages.splice(selectedLanguages.indexOf(language), 1);
                this.classList.remove('selected'); // Remove the selected class from the tag
            } else {
                // If not selected, add it to the array
                selectedLanguages.push(language);
                this.classList.add('selected'); // Add the selected class to the tag
            }

            // Filter project cards based on selected languages
            document.querySelectorAll('.project-card').forEach(card => {
                // Check if the card contains all selected languages
                const cardLanguages = Array.from(card.querySelectorAll('.language-tag')).map(tag => tag.getAttribute('data-language'));
                const isMatch = selectedLanguages.every(lang => cardLanguages.includes(lang));

                // Show or hide the card based on whether it matches all selected languages
                card.style.display = isMatch ? 'block' : 'none';
            });

            // Highlight all instances of the selected tag in all project cards
            document.querySelectorAll('.language-tag').forEach(tag => {
                if (selectedLanguages.includes(tag.getAttribute('data-language'))) {
                    tag.classList.add('selected'); // Highlight matching tags
                } else {
                    tag.classList.remove('selected'); // Remove highlight from non-matching tags
                }
            });

            // Update the visibility of the clear filters button
            updateFilterDisplay();
        });
    });
}

// Clear filters button event listener
clearFiltersButton.addEventListener('click', () => {
    // Deselect all language tags
    document.querySelectorAll('.language-tag').forEach(tag => tag.classList.remove('selected'));
    selectedLanguages.length = 0; // Clear the selected languages array
    
    // Show all project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.style.display = 'block';
    });

    // No need to hide the button after clearing filters
});

// Set up event listeners and initialize visibility on page load
document.addEventListener("DOMContentLoaded", function () {
    // Clear Filters button is always visible, so no need to hide it here

    // Set up language tag listeners
    setupLanguageTagListeners();
    
    // The visibility of the button is always on, so this function is not needed
});