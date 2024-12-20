
# Better Grammar Suggestions (Powered by HuggingFace 🤗 & Transformers.js) | Browser extension

A chrome browser extenstion project to show how to run 🤗 Transformers in a browser extension. Although we only provide instructions for running in Chrome, it should be similar for other browsers.

[DEMO - Better Grammar Suggestions (LinkedIn Post)](https://www.linkedin.com/posts/miketeddyomondi_intasend-activity-7269101504366579714-FPhi?utm_source=share&utm_medium=member_desktop)

## Technologies Used 

1. Cloudflare  Workers as the application programming interface (API) serving the model to the browser extension. 
2. Hugging Face Model(s): `prithivida/grammar_error_correcter_v1` for inferencing sentences.
3. PicoCSS - Styling CSS Framework

## Getting Started
1. Clone the repo and enter the project directory:
    ```bash
    git clone https://github.com/MikeTeddyOmondi/grammar-checker-chrome-extension.git
    cd transformers.js/examples/extension/
    ```
1. Install the necessary dependencies:
    ```bash
    npm install 
    ```

1. Build the project:
    ```bash
    npm run build 
    ```

1. Add the extension to your browser. To do this, go to `chrome://extensions/`, enable developer mode (top right), and click "Load unpacked". Select the `build` directory from the dialog which appears and click "Select Folder".

1. That's it! You should now be able to open the extension's popup and use the model in your browser!

## Editing the source...

We recommend running `npm run dev` while editing the template as it will rebuild the project when changes are made. 

All source code can be found in the `./src/` directory:
- `background.js` ([service worker](https://developer.chrome.com/docs/extensions/mv3/service_workers/)) - handles all the requests from the UI, does processing in the background, then returns the result. You will need to reload the extension (by visiting `chrome://extensions/` and clicking the refresh button) after editing this file for changes to be visible in the extension.

- `content.js` ([content script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)) - contains the code which is injected into every page the user visits. You can use the `sendMessage` api to make requests to the background script. Similarly, you will need to reload the extension after editing this file for changes to be visible in the extension.

- `popup.html`, `popup.css`, `popup.js` ([toolbar action](https://developer.chrome.com/docs/extensions/reference/action/)) - contains the code for the popup which is visible to the user when they click the extension's icon from the extensions bar. For development, we recommend opening the `popup.html` file in its own tab by visiting `chrome-extension://<ext_id>/popup.html` (remember to replace `<ext_id>` with the extension's ID). You will need to refresh the page while you develop to see the changes you make.

## Using Models with the Inference API

```js
async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/prithivida/grammar_error_correcter_v1",
		{
			headers: {
				Authorization: "Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

query({"inputs": "The answer to the universe is"}).then((response) => {
	console.log(JSON.stringify(response));
});

```