(() => {
  if (window.__pageSpinInjected) {
    return;
  }

  window.__pageSpinInjected = true;

  let angle = 0;
  let visible = false;
  let restoreTimeout = null;

  const button = document.createElement("button");
  button.id = "page-spin-button";
  button.type = "button";
  button.style.display = "none";

  const updateButtonLabel = (isRotated) => {
    const label = isRotated ? "Restore page" : "Rotate page";
    button.textContent = label;
    button.title = label;
    button.setAttribute("aria-label", label);
  };

  updateButtonLabel(false);

  button.addEventListener("click", () => {
    if (restoreTimeout) {
      clearTimeout(restoreTimeout);
      restoreTimeout = null;
    }

    angle += 180;
    const isRotated = angle % 360 !== 0;
    const html = document.documentElement;
    const body = document.body;

    if (isRotated) {
      // Make body a fixed viewport-sized scroll container before rotating
      const scrollTop = html.scrollTop || body.scrollTop;
      html.classList.add("page-spin-active");
      body.classList.add("page-spin-rotated");
      body.scrollTop = scrollTop;
    }

    body.style.transform = `rotateZ(${angle}deg)`;
    updateButtonLabel(isRotated);

    if (!isRotated) {
      // After animation completes, fully restore original layout
      restoreTimeout = setTimeout(() => {
        const scrollTop = body.scrollTop;
        body.style.transition = "none";
        body.style.transform = "";
        body.classList.remove("page-spin-rotated");
        html.classList.remove("page-spin-active");
        void body.offsetHeight;
        body.style.transition = "";
        html.scrollTop = scrollTop;
        body.scrollTop = scrollTop;
        updateButtonLabel(false);
        restoreTimeout = null;
      }, 500);
    }
  });

  // Append to <html> (outside <body>) so the button is not affected by body's transform
  document.documentElement.appendChild(button);

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "toggle-button") {
      visible = !visible;
      button.style.display = visible ? "flex" : "none";
      sendResponse({ visible });
    }
  });
})();
