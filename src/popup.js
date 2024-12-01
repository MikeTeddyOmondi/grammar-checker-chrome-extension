// popup.js - handles interaction with the extension's popup, sends requests to the
// service worker (background.js), and updates the popup's UI (popup.html) on completion.

document.addEventListener("DOMContentLoaded", () => {
  const inputElement = document.getElementById("text");
  const outputElement = document.getElementById("output");

  const donationForm = document.getElementById("donation-form");

  if (inputElement) {
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
        } else {
          console.log({ popupResponse: response });
          // Handle the case where the response contains error and estimated fields
          outputElement.innerText = `Error: ${response.data.error}`;
        }
        // else {
        //   // Fallback for unexpected response structures
        //   outputElement.innerText = "Unexpected response format";
        // }
      });
    });
  }

  if (donationForm) {
    const spanMsg = document.getElementById("spanMsg");
    const submitBtn = document.getElementById("donation-submit-btn");
    const donationEmail = document.getElementById("donation-email");
    const donationAmount = document.getElementById("donation-amount");
    const checkoutDiv = document.getElementById("checkout-div");
    const checkoutQRCode = document.getElementById("checkout-qrcode");
    const checkoutLinkDiv = document.getElementById("checkout-link");

    donationForm.addEventListener("submit", donationRequest);

    async function donationRequest(event) {
      event.preventDefault();
      let email = donationEmail.value;
      let amount = donationAmount.value;
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", true);

      const donationMessage = {
        action: "donationRequest",
        data: {
          email,
          amount,
        },
      };

      // Send donationMessage to the service worker.
      chrome.runtime.sendMessage(donationMessage, (response) => {
        console.log({ popupResponse: response });
        if (response.data.payload && response.data.payload !== null) {
          donationForm.reset();
          donationForm.style.display = "none";
          showSuccessMsg(response.data.message);

          let { id, url, signature } = response.data.payload;

          const qrcodeMessage = {
            action: "qrCodeRequest",
            data: {
              url,
            },
          };
          // Send qrcodeMessage to the service worker
          chrome.runtime.sendMessage(qrcodeMessage, (response) => {
            console.log({ qrCodeResponse: response });
            checkoutDiv.style.display = "block";
            renderSvgToCanvas(response, checkoutQRCode);
            checkoutLinkDiv.innerHTML += `<a href=${url} target="_blank">Checkout Link</a>`;
          });
          return;
        } else {
          showErrMsg(response.data.message);
          donationForm.reset();
        }
      });
    }

    async function renderSvgToCanvas(svgString, canvas) {
      // Ensure the canvas element exists
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        console.error("Invalid canvas element.");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get 2D context.");
        return;
      }

      // Create an image
      const img = new Image();

      // Wrap the image load in a Promise
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas dimensions to match the SVG
          canvas.width = 300; // img.width;
          canvas.height = 300; // img.height;

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);
          resolve();
        };

        img.onerror = (err) => {
          console.error("Error loading SVG image.", err);
          reject(err);
        };

        // Convert SVG string to a data URI
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        img.src = url;
      });
    }

    function showSuccessMsg(message) {
      spanMsg.textContent = message;
      spanMsg.style.backgroundColor = "#84fb84";
      spanMsg.style.display = "block";
      spanMsg.style.color = "black";
      submitBtn.disabled = false;
      submitBtn.setAttribute("aria-busy", false);
      setTimeout(removeSpanMsg, 5000);
    }

    function showErrMsg(message) {
      spanMsg.textContent = message;
      spanMsg.style.backgroundColor = "pink";
      spanMsg.style.display = "block";
      spanMsg.style.color = "red";
      submitBtn.disabled = false;
      submitBtn.setAttribute("aria-busy", false);
      setTimeout(removeSpanMsg, 5000);
    }

    function removeSpanMsg() {
      spanMsg.style.display = "none";
    }
  }
});
