// Track page visits using localStorage
(function() {
  // Key for storing visit data in localStorage
  const VISITS_KEY = "page_visits";
  
  // Get current page path
  const pagePath = window.location.pathname;
  
  // Get existing visit data or initialize empty object
  let visits = JSON.parse(localStorage.getItem(VISITS_KEY) || "{}");
  
  // Increment count for current page
  visits[pagePath] = (visits[pagePath] || 0) + 1;
  
  // Save updated visits back to localStorage
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
  
  // Log for debugging
  console.log(`Page ${pagePath} visited ${visits[pagePath]} times`);
})();