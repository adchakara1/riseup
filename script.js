document.addEventListener('DOMContentLoaded', () => {

    // --- Feature 1 & 2: Hero Section Slideshow with Animations ---

    const heroSlideshow = document.querySelector('.hero-background-slideshow');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const currentImageTitleSpan = document.querySelector('.current-image-title');
    const progressBar = document.querySelector('.progress-bar');
    const heroContent = document.querySelector('.hero-content');

    // Define your hero images with their titles and descriptions
    // IMPORTANT: Double-check these paths and filenames against your 'images' folder!
    const heroData = [
        { src: 'hero1.jpg', title: 'Empowering Women Through Education', description: 'Achieve your career goals, secure your future, and gain accredited qualifications – all on your schedule, designed for busy women.' }
        { src: 'hero2.jpg', title: 'Flexible Learning, Real Results', description: 'Study at your own pace with our custom Android app, designed for offline access and cost savings.' },
        { src: 'hero3.jpg', title: 'Personalized Support, Every Step of the Way', description: 'Receive direct, expert feedback on your assignments via WhatsApp, ensuring you excel.' },
        { src: 'hero4.jpg', title: 'Your Path to a Brighter Future', description: 'Gain the O-Level qualifications needed for nursing, teaching, civil service, or tertiary education.' }
        // Add more images as desired, ensuring they are in your 'images' folder
    ];

    let currentImageIndex = 0;
    const slideDuration = 8000; // 8 seconds per slide
    let slideshowInterval;
    let progressBarAnimation;
    const preloadedImages = []; // Array to store preloaded Image objects

    /**
     * Preloads all images defined in heroData.
     * Returns a Promise that resolves when all images are loaded,
     * or rejects if any image fails to load.
     */
    function preloadAllImages() {
        const imagePromises = heroData.map((data, index) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = data.src;
                img.onload = () => {
                    preloadedImages[index] = img; // Store the loaded image object
                    console.log(`Image loaded: ${data.src}`);
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Error loading image: ${data.src}. Skipping this image.`);
                    // Instead of rejecting, we can resolve with null/false to indicate failure
                    // but allow other images to load. This prevents breaking the whole chain.
                    preloadedImages[index] = null; // Mark as failed
                    resolve(null);
                };
            });
        });

        // Wait for all image promises to settle (either resolve or reject)
        return Promise.all(imagePromises);
    }

    /**
     * Updates the slideshow with the next image and content.
     */
    async function updateSlideshow() {
        // Find the next valid image index, skipping null (failed) entries
        let nextIndex = currentImageIndex;
        let validImageFound = false;
        for (let i = 0; i < heroData.length; i++) {
            if (preloadedImages[nextIndex]) { // Check if the image at this index loaded successfully
                validImageFound = true;
                break;
            }
            nextIndex = (nextIndex + 1) % heroData.length; // Move to the next index
            if (nextIndex === currentImageIndex) { // Looped through all images and found no valid ones
                console.warn("No valid hero images could be loaded. Slideshow cannot proceed.");
                clearInterval(slideshowInterval); // Stop the slideshow
                return;
            }
        }

        if (!validImageFound) {
            console.warn("No valid hero images available to display.");
            clearInterval(slideshowInterval);
            return;
        }

        // Use the found valid image
        currentImageIndex = nextIndex;
        const currentSlideData = heroData[currentImageIndex];
        const currentLoadedImage = preloadedImages[currentImageIndex];

        // 1. Fade out current content and remove active class from old image
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)'; // Optional: slight slide out
        currentImageTitleSpan.style.opacity = '0';

        const currentActiveImg = heroSlideshow.querySelector('img.active');
        if (currentActiveImg) {
            currentActiveImg.classList.remove('active');
        }

        // 2. Wait for content fade-out (CSS transition duration)
        // This ensures a smooth transition where content disappears before new image appears fully
        await new Promise(resolve => setTimeout(resolve, 800)); // Match CSS transition for hero-content

        // 3. Prepare and activate the new image element
        // We'll create a new img element each time for cross-fading robustness
        const newImageElement = document.createElement('img');
        newImageElement.src = currentLoadedImage.src; // Use the preloaded image's source
        newImageElement.alt = currentSlideData.title; // Add alt text for accessibility

        // Append the new image before making it active
        heroSlideshow.appendChild(newImageElement);

        // Remove old images after new one is visible for cleaner DOM
        const imagesInSlideshow = heroSlideshow.querySelectorAll('img');
        imagesInSlideshow.forEach(img => {
            if (img !== newImageElement) {
                // Wait for the transition to finish before removing,
                // or remove immediately if the old one is already faded.
                // For simplicity, we'll remove it after a short delay here.
                setTimeout(() => img.remove(), 1600); // Wait longer than opacity transition
            }
        });

        // Add 'active' class to make new image visible (triggers CSS fade-in)
        // A slight delay here makes the cross-fade more pronounced and smooth
        setTimeout(() => {
            newImageElement.classList.add('active');
        }, 50); // Small delay to allow old image to start fading first

        // 4. Update and fade in hero content
        heroTitle.textContent = currentSlideData.title;
        heroDescription.textContent = currentSlideData.description;
        currentImageTitleSpan.textContent = currentSlideData.title;

        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
        currentImageTitleSpan.style.opacity = '1';

        // 5. Reset and animate progress bar
        startProgressBar();

        // Prepare index for the next cycle
        currentImageIndex = (currentImageIndex + 1) % heroData.length;
    }

    /**
     * Animates the progress bar from 0% to 100% over slideDuration.
     */
    function startProgressBar() {
        if (progressBarAnimation) {
            cancelAnimationFrame(progressBarAnimation);
        }
        progressBar.style.width = '0%'; // Reset width

        let startTime;
        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / slideDuration, 1);
            progressBar.style.width = `${progress * 100}%`;

            if (progress < 1) {
                progressBarAnimation = requestAnimationFrame(animate);
            }
        }
        progressBarAnimation = requestAnimationFrame(animate);
    }

    // --- Initialization: Preload images then start slideshow ---
    preloadAllImages().then(() => {
        // Filter out any null entries (failed images) from heroData as well
        // if you want to completely remove them from the slideshow rotation
        // For now, we'll just check `preloadedImages` array within updateSlideshow
        console.log('All initial hero images preloading attempts completed.');

        if (preloadedImages.some(img => img !== null)) { // Only start if at least one image loaded
            updateSlideshow(); // Show first valid slide immediately
            slideshowInterval = setInterval(updateSlideshow, slideDuration);
        } else {
            console.error("No hero images successfully loaded. Slideshow will not run.");
            // Optionally, display a static fallback message or image if no hero images load
            heroSlideshow.style.backgroundColor = '#555'; // Darker fallback background
            heroContent.style.opacity = '1'; // Ensure content is visible
            heroTitle.textContent = 'Welcome to RiseUp Learn!';
            heroDescription.textContent = 'Flexible O-Level education tailored for you.';
            currentImageTitleSpan.textContent = 'Start Your Journey Today';
            document.querySelector('.hero-controls').style.display = 'none'; // Hide controls if no slideshow
        }
    });


    // --- Feature 3: Flipping Cards ---

    const networkCards = document.querySelectorAll('.network-card');

    networkCards.forEach(card => {
        const cardWrapper = card.closest('.network-card-wrapper');
        if (cardWrapper) { // Ensure wrapper exists before adding listener
            cardWrapper.addEventListener('click', () => {
                card.classList.toggle('is-flipped');
            });
        } else {
            console.warn("Card wrapper not found for a network card. Check HTML structure.");
        }
    });

    // --- Smooth Scrolling for Navigation (Optional but good UX) ---
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Optional: Add active class to clicked nav item
            document.querySelectorAll('.main-nav a').forEach(item => item.classList.remove('active-link'));
            this.classList.add('active-link');
        });
    });

});
