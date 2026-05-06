# PageSpin

PageSpin is a small Chrome extension that lets you rotate the current web page with a smooth animation.

Instead of rotating the page immediately from the toolbar, the extension first toggles a floating in-page control. Clicking that control rotates the page by 180 degrees, and clicking it again returns the page to its normal orientation.

## Overview

The extension is built as a simple Manifest V3 project with no build step. It uses:

- a **background service worker** to react to toolbar clicks and inject code into the current tab
- a **page script** to inject UI into the page and control rotation
- a **CSS file** to handle animation, layout adjustments, and button styling

## How it works

1. The user clicks the extension icon in Chrome.
2. `background.js` injects `content.js` and `content.css` into the active tab the first time the extension is used there.
3. `background.js` sends a `toggle-button` message to the current tab.
4. When the user clicks that button, the extension rotates the page body by `180deg`.
5. When the page returns to its normal orientation, the temporary rotation layout is cleaned up and the scroll position is restored.

## Technical notes

### Manifest V3 structure

The extension uses `manifest.json` to declare:

- the extension metadata, icons, and permissions
- the background service worker
- the page script and stylesheet that are injected on demand into the active tab

### Separation of responsibilities

- `background.js` handles toolbar interaction, active-tab injection, and badge updates
- `content.js` owns page-side UI and rotation logic
- `content.css` manages animation timing, fixed positioning, and the floating button appearance

This keeps the extension easy to understand: background code triggers actions, while page code manipulates the DOM.

## Implementation details and design choices

### 1. The floating button is appended outside `<body>`

The rotation is applied to the page `body`, so the button is attached to `document.documentElement` instead of `body`.  
That prevents the control itself from rotating with the page and keeps it usable at all times.

### 2. Rotation uses a temporary layout mode

When the page is rotated, the extension switches the page into a special layout state:

- `html.page-spin-active` disables root scrolling
- `body.page-spin-rotated` becomes a fixed, viewport-sized scroll container

This reduces layout and scrolling issues while the page is rotated.

### 3. Scroll position is preserved

Before changing layout, the current scroll position is captured and moved into the rotated body container.  
When the page returns to normal, the extension restores the scroll state so the user does not lose their place.

### 4. Cleanup happens after the animation finishes

The rotation animation is driven by CSS transition timing.  
When the page rotates back to its normal orientation, `content.js` waits for the animation to finish, then removes temporary classes and resets the transform state cleanly.

### 5. Repeated clicks are handled safely

The script clears any pending restore timer before starting a new rotation cycle.  
This avoids stale cleanup logic interfering with fast repeated clicks.
