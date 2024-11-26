// Inject React app into the DOM
const appRoot = document.createElement("div");
appRoot.id = "suggestion-root";
document.body.appendChild(appRoot);

// Mount React app
const script = document.createElement("script");
script.src = chrome.runtime.getURL("index.js"); // React app bundle
script.type = "module";
document.body.appendChild(script);
