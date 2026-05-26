// ContentLoop — content script
// No-op for now. Popup uses chrome.scripting.executeScript to scrape the
// current page on demand; this file exists so we can later inject UI
// (selection toolbar, in-page hover button, etc.) without changing
// manifest.json.

(() => {
  // intentionally empty
})();
