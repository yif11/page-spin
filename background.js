chrome.action.onClicked.addListener(async (tab) => {
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "toggle-button",
    });

    const text = response.visible ? "ON" : "OFF";
    const color = response.visible ? "#4A90D9" : "#888888";

    await chrome.action.setBadgeText({ tabId: tab.id, text });
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color });
  } catch {
    // Content script not loaded yet on this tab
  }
});
