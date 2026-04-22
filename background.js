const TOGGLE_BUTTON_MESSAGE = { action: "toggle-button" };

const ACTION_STATES = {
  visible: {
    text: "ON",
    color: "#4A90D9",
    title: "PageSpin: Hide the rotate button",
  },
  hidden: {
    text: "OFF",
    color: "#888888",
    title: "PageSpin: Show the rotate button",
  },
  error: {
    text: "X",
    color: "#D93025",
    title: "PageSpin can't run on this page",
  },
};

async function setActionState(tabId, state) {
  await Promise.all([
    chrome.action.setBadgeText({ tabId, text: state.text }),
    chrome.action.setBadgeBackgroundColor({ tabId, color: state.color }),
    chrome.action.setTitle({ tabId, title: state.title }),
  ]);
}

async function ensurePageSpinInjected(tabId) {
  const [{ result: isInjected }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => Boolean(window.__pageSpinInjected),
  });

  if (isInjected) {
    return;
  }

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["content.css"],
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    console.error("PageSpin could not determine the active tab.");
    return;
  }

  try {
    await ensurePageSpinInjected(tab.id);

    const response = await chrome.tabs.sendMessage(tab.id, TOGGLE_BUTTON_MESSAGE);
    const nextState = response.visible ? ACTION_STATES.visible : ACTION_STATES.hidden;

    await setActionState(tab.id, nextState);
  } catch (error) {
    console.error("PageSpin could not activate on this page.", error);
    await setActionState(tab.id, ACTION_STATES.error);
  }
});
