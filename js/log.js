(function () {
  const SESSION_KEY = "log_session_id";
  const PATHS_KEY = "log_path_trail";
  const startedAt = Date.now();

  // Get or create a session ID
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem(PATHS_KEY, JSON.stringify([]));
  }

  // Update the path trail
  const trail = JSON.parse(localStorage.getItem(PATHS_KEY) || "[]");
  trail.push(window.location.pathname);
  localStorage.setItem(PATHS_KEY, JSON.stringify(trail));

  // Capture data
  function sendLog(duration = null) {
    const payload = {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      sessionId,
      duration,
      pathTrail: trail,
    };

    // Send log to Google Sheets via the Google Apps Script Web App
    fetch("https://script.google.com/macros/s/AKfycbzPnon2hAhJ5EqgrD94cHxjbcqgNBgzVI6FnFEpPEVthUl0qoF3pe2or7L1PSdq7jsKSw/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((e) => console.error("Log error", e));
  }

  // Send log on page load
  window.addEventListener("load", () => sendLog());

  // Send log with duration on page unload
  window.addEventListener("beforeunload", () => {
    const duration = Math.floor((Date.now() - startedAt) / 1000); // seconds
    sendLog(duration);
  });
})();
