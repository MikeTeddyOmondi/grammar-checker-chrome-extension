// popup.js - handles interaction with the extension's popup, sends requests to the
// service worker (background.js), and updates the popup's UI (popup.html) on completion.

const inputElement = document.getElementById("text");
const outputElement = document.getElementById("output");

// Listen for changes made to the textbox.
inputElement.addEventListener("input", (event) => {
  // Bundle the input data into a message.
  const message = {
    action: "grammarSuggest",
    text: event.target.value,
  };

  // Send this message to the service worker.
  chrome.runtime.sendMessage(message, (response) => {
    // Handle results returned by the service worker (`background.js`) and update the popup's UI.
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Handle the case where the response contains an array
      outputElement.innerText = response.data[0].generated_text;
    } else if (response.error && response.estimated_time) {
      // Handle the case where the response contains error and estimated fields
      outputElement.innerText = `Error: ${response.error}, Estimated: ${response.estimated}`;
    } else {
      // Fallback for unexpected response structures
      outputElement.innerText = "Unexpected response format";
    }
  });
});
