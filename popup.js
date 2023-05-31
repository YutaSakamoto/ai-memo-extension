const newContainer = document.getElementById("new-container");
const updateContainer = document.getElementById("update-container");

const apiKeyInput = document.getElementById("api-key-input");
const updateButton = document.getElementById("update-button");
const addButton = document.getElementById("add-button");

chrome.storage.local.get("apiKey", (data) => {
  if (data.apiKey) {
    newContainer.classList.add("hidden");
    updateContainer.classList.remove("hidden");
  }
});

addButton.addEventListener("click", () => {
  const base64ApiKey = btoa(apiKeyInput.value);

  chrome.storage.local.set({ apiKey: base64ApiKey }, function () {
    newContainer.classList.add("hidden");
    updateContainer.classList.remove("hidden");
  });
});

updateButton.addEventListener("click", () => {
  chrome.storage.local.remove("apiKey", () => {
    updateContainer.classList.add("hidden");
  });
});
