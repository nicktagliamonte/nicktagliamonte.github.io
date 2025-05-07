// Track page visits using GitHub API
(function() {
  // GitHub API configuration
  const GITHUB_TOKEN = "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";
  const OWNER = "nicktagliamonte";
  const REPO = "portfolio-logs";
  const FILE_PATH = "visits.json";
  
  // Get current page path
  const currentPath = window.location.pathname === "/" ? "/" : window.location.pathname;
  
  // Only proceed if we're not on the analytics page (to avoid counting analytics views)
  if (currentPath.indexOf('analytics.html') === -1) {
    // Function to fetch current visits data
    async function fetchVisitsData() {
      try {
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = atob(data.content); // Decode base64 content
        const visits = JSON.parse(content);
        const sha = data.sha; // We need this to update the file later
        
        return { visits, sha };
      } catch (error) {
        console.error('Error fetching visit data:', error);
        // If file doesn't exist yet, return empty object
        return { visits: {}, sha: null };
      }
    }
    
    // Function to update visits data
    async function updateVisitsData(visits, sha) {
      // Increment count for current page
      visits[currentPath] = (visits[currentPath] || 0) + 1;
      
      try {
        // Prepare the content for GitHub API
        const content = btoa(JSON.stringify(visits, null, 2)); // Convert to base64
        
        const body = {
          message: `Update page visit count for ${currentPath}`,
          content: content,
          sha: sha // Include SHA if updating an existing file
        };
        
        // If we don't have a SHA, it means the file doesn't exist yet
        if (!sha) {
          delete body.sha;
        }
        
        const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify(body)
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        console.log(`Page visit recorded for ${currentPath}`);
      } catch (error) {
        console.error('Error updating visit data:', error);
      }
    }
    
    // Execute the tracking logic
    (async function trackPageVisit() {
      const { visits, sha } = await fetchVisitsData();
      await updateVisitsData(visits, sha);
    })();
  }
})();