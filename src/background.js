// background.js - Handles requests from the UI, runs the model, then sends back a response

import QRCode from "qrcode";
// import { pipeline, env } from "@xenova/transformers";

// Skip initial check for local models, since we are not loading any local models.
// env.allowLocalModels = false;

// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
// env.backends.onnx.wasm.numThreads = 1;

// class PipelineSingleton {
//   static task = "text2text-generation";
//   static model = "prithivida/grammar_error_correcter_v1";
//   static instance = null;

//   static async getInstance(progress_callback = null) {
//     if (this.instance === null) {
//       this.instance = await pipeline(this.task, this.model, {
//         progress_callback,
//       });
//     }

//     return this.instance;
//   }
// }

// Create generic classify function, which will be reused for the different types of events.
const grammarSuggestion = async (text) => {
  // // Get the pipeline instance. This will load and build the model when run for the first time.
  // let model = await PipelineSingleton.getInstance((data) => {
  //   // You can track the progress of the pipeline creation here.
  //   // e.g., you can send `data` back to the UI to indicate a progress bar
  //   // console.log('progress', data)
  // });

  // // Actually run the model on the input text
  // let result = await model(text);
  // return result;

  if (text == "") return;

  const WORKER_API =
    "https://better-grammar-suggestions.rancko-solutions-llc.workers.dev/";
  let response = await fetch(WORKER_API, {
    method: "POST",
    headers: {
      contenType: "application/json",
    },
    body: JSON.stringify(text),
  });

  let data = await response.json();

  console.log("data: ", data);
  // if (data.error) return { errorMessage: data.error };

  return data;
};

// Make a donation request
const donationRequest = async (data) => {
  if (data === null) return;

  // https://better-grammar-suggestions.rancko-solutions-llc.workers.dev
  const WORKER_API =
    "http://localhost:8787/donate";
  let response = await fetch(WORKER_API, {
    method: "POST",
    headers: {
      contenType: "application/json",
    },
    body: JSON.stringify(data),
  });

  let responseData = await response.json();
  console.log({ responseData });

  return responseData;
};

// Make a QRCodeRequest
const qrCodeRequest = async (data) => {
  console.log({ qrcodeData: data });
  let qrcode = await QRCode.toString(data.url);
  return qrcode;
};

////////////////////// 1. Context Menus //////////////////////
//
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(function () {
  // Register a context menu item that will only show up for selection text.
  chrome.contextMenus.create({
    id: "grammar-suggestion",
    title: 'Grammar Suggestion "%s"',
    contexts: ["selection"],
  });
});

// Perform inference when the user clicks a context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Ignore context menu clicks that are not for grammar suggestions (or when there is no input)
  if (info.menuItemId !== "grammar-suggestion" || !info.selectionText) return;

  // Perform grammar suggestions on the selected text
  let result = await grammarSuggestion(info.selectionText);

  // Do something with the result
  chrome.scripting.executeScript({
    target: { tabId: tab.id }, // Run in the tab that the user clicked in
    args: [result], // The arguments to pass to the function
    function: (result) => {
      // The function to run
      // NOTE: This function is run in the context of the web page, meaning that `document` is available.
      console.log("result", result);
      console.log("document", document);
    },
  });
});
//////////////////////////////////////////////////////////////

////////////////////// 2. Message Events /////////////////////
//
// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("sender", sender);
  if (message.action !== "grammarSuggest") return; // Ignore messages that are not meant for suggestions.

  // Run model prediction asynchronously
  (async function () {
    // Perform suggestions
    let result = await grammarSuggestion(message.text);

    // Send response back to UI
    sendResponse(result);
  })();

  // return true to indicate we will send a response asynchronously
  // see https://stackoverflow.com/a/46628145 for more information
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("donationReqSender", sender);
  if (message.action !== "donationRequest") return;

  (async function () {
    let result = await donationRequest(message.data);
    sendResponse(result);
  })();

  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("qrCodeSender", sender);
  if (message.action !== "qrCodeRequest") return;

  (async function () {
    let result = await qrCodeRequest(message.data);
    sendResponse(result);
  })();

  return true;
});
//////////////////////////////////////////////////////////////
