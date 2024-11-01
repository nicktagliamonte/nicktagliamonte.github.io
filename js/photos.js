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
        img.alt = filename;
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