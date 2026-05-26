// ContentLoop — service worker
// Adds a right-click context menu "Send to ContentLoop" that opens the popup
// and runs the generation. (Chrome MV3 limitation: opening the popup
// programmatically only works on user gestures, so we just focus the
// extension icon instead — clicking it shows the popup which auto-loads
// the page content.)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "contentloop-open",
    title: "ContentLoop — repurpose this page",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "contentloop-open" && tab?.id) {
    try {
      // Best-effort: focus the popup via openPopup() (Chrome 127+).
      if (chrome.action.openPopup) {
        await chrome.action.openPopup();
      }
    } catch {
      // Older Chrome falls through — user clicks the icon instead.
    }
  }
});
