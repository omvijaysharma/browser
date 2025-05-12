let isIframeVisible = false; // Track if the iframe is visible

function setSearch(suggestion) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

    if (youtubeRegex.test(suggestion)) {
        // Convert YouTube URL to embed URL
        const videoId = suggestion.split('v=')[1]?.split('&')[0];
        if (videoId) {
            suggestion = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    document.getElementById("searchInput").value = suggestion;
    search();
}

function search() {
    const query = document.getElementById("searchInput").value;
    const encodedQuery = encodeURIComponent(query);
    const iframeContainer = document.getElementById("iframeContainer");
    const suggestions = document.getElementById("suggestions");

    // Check if the input is a valid URL
    if (isValidURL(query)) {
        // List of known websites that block iframe embedding (e.g., Pinterest, YouTube)
        const blockedSites = ["pinterest.com", "youtube.com", "youtu.be"];

        let shouldRedirect = false;
        for (let site of blockedSites) {
            if (query.includes(site)) {
                shouldRedirect = true;
                break;
            }
        }

        if (shouldRedirect) {
            // Redirect directly to the site
            window.location.href = query; // Redirect to the URL
        } else {
            // Try to load the URL in the iframe
            suggestions.style.display = "none"; // Hide suggestions
            iframeContainer.style.display = "block"; // Show iframe
            iframeContainer.src = query; // Load the URL in iframe
            isIframeVisible = true; // Update the state
            history.pushState(null, '', ''); // Push state to history

            // Check if the iframe can load the URL
            iframeContainer.onload = function () {
                // Successfully loaded in iframe
            };

            iframeContainer.onerror = function () {
                // If there is an error loading the iframe, redirect to the URL
                window.location.href = query; // Redirect to the URL
            };
        }
    } else {
        // Show loading page for Brave Search
        sessionStorage.setItem('targetUrl', "https://search.brave.com/search?q=" + encodedQuery);
        window.location.href = "loading.html"; // Redirect to loading.html
    }

    return false; // Prevent form submission
}

// Function to check if a string is a valid URL
function isValidURL(string) {
    const res = string.match(/(https?:\/\/[^\s]+)/g);
    return (res !== null);
}

document.getElementById("searchInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        search();
    }
});

// Function to check internet connectivity
function updateOnlineStatus() {
    const offlineMessage = document.getElementById("offlineMessage");
    const suggestions = document.getElementById("suggestions");
    const iframeContainer = document.getElementById("iframeContainer");
    
    if (navigator.onLine) {
        offlineMessage.style.display = "none"; // Hide offline message
        suggestions.style.display = "block"; // Show suggestions
        iframeContainer.style.display = "none"; // Hide iframe
        isIframeVisible = false; // Reset the state
    } else {
        offlineMessage.style.display = "block"; // Show offline message
        suggestions.style.display = "none"; // Hide suggestions
        iframeContainer.style.display = "none"; // Hide iframe
        isIframeVisible = false; // Reset the state
    }
}

// Add event listeners for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
updateOnlineStatus();

// Handle back button event
window.addEventListener('popstate', function(event) {
    const iframeContainer = document.getElementById("iframeContainer");
    const suggestions = document.getElementById("suggestions");

    if (isIframeVisible) {
        // Reset to previous state
        iframeContainer.style.display = "none"; // Hide iframe
        suggestions.style.display = "block"; // Show suggestions
        isIframeVisible = false; // Update the state
    } else {
        // If iframe is not visible, reload the index.html
        window.location.href = 'index.html'; // Redirect to index.html
    }
});