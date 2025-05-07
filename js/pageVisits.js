// Track page visits using GitHub API
(function() {
  const GITHUB_TOKEN = "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"; // Replace with your actual token
  const OWNER = "nicktagliamonte"; // Your GitHub username
  const REPO = "portfolio-logs"; // Your private repository for logs
  const FILE_PATH = "visits.json"; // Path to the visits file in the repo
  
  // Get current page path
  const currentPath = window.location.pathname === "/" ? "/" : window.location.pathname;
  
  // Only proceed if we're not on the analytics page (to avoid counting analytics views)
  if (currentPath.indexOf('analytics.html') === -1) {
    // Function to fetch current visits data
    async function fetchVisitsData() {
      try {
        // Check if we have a valid token
        if (!GITHUB_TOKEN || GITHUB_TOKEN === "YOUR_GITHUB_TOKEN") {
          console.warn("GitHub token not set. Using local storage only.");
          throw new Error("GitHub token not configured");
        }
        
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`, // Changed from 'token' to 'Bearer'
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.status === 404) {
          console.log('Visits file not found. Creating new file.');
          return { visits: {}, sha: null };
        }
        
        if (response.status === 401) {
          throw new Error("GitHub authentication failed. Check your token permissions.");
        }
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = atob(data.content); // Decode base64 content
        const visits = JSON.parse(content);
        const sha = data.sha; // We need this to update the file later
        
        return { visits, sha };
      } catch (error) {
        console.error('Error fetching visit data:', error);
        // Fall back to localStorage if GitHub API fails
        try {
          const localVisits = JSON.parse(localStorage.getItem('page_visits') || '{}');
          return { visits: localVisits, useFallback: true };
        } catch (e) {
          return { visits: {}, useFallback: true };
        }
      }
    }
    
    // Function to update visits data
    async function updateVisitsData(visits, sha, useFallback = false) {
      // Increment count for current page
      visits[currentPath] = (visits[currentPath] || 0) + 1;
      
      // If using fallback, just store in localStorage
      if (useFallback) {
        localStorage.setItem('page_visits', JSON.stringify(visits));
        console.log(`Page visit recorded locally for ${currentPath}`);
        return;
      }
      
      try {
        // Check if we have a valid token
        if (!GITHUB_TOKEN || GITHUB_TOKEN === "YOUR_GITHUB_TOKEN") {
          throw new Error("GitHub token not configured");
        }
        
        // Prepare the content for GitHub API
        const content = btoa(JSON.stringify(visits, null, 2)); // Convert to base64
        
        const body = {
          message: `Update page visit count for ${currentPath}`,
          content: content
        };
        
        // If we have a SHA, it means the file exists and we're updating it
        if (sha) {
          body.sha = sha;
        }
        
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`, // Changed from 'token' to 'Bearer'
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify(body)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('GitHub API error:', errorData);
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        console.log(`Page visit recorded for ${currentPath}`);
      } catch (error) {
        console.error('Error updating visit data:', error);
        // Fall back to localStorage if GitHub API fails
        localStorage.setItem('page_visits', JSON.stringify(visits));
        console.log(`Page visit recorded locally for ${currentPath} (fallback)`);
      }
    }
    
    // Execute the tracking logic
    (async function trackPageVisit() {
      const { visits, sha, useFallback } = await fetchVisitsData();
      await updateVisitsData(visits, sha, useFallback);
    })();
  }
})();