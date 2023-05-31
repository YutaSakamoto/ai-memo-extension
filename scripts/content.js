const insert = (content) => {
  var element = document.activeElement;

  if (element.nodeName === "TEXTAREA" || element.nodeName === "INPUT") {
    element.value = content;
  } else {
    element.innerText = content;
  }

  return true;
};

const isEndsWithPlusSign = (str) => {
  return str.trim().endsWith("+++");
};

const sendTriggerMessage = (text) => {
  chrome.runtime.sendMessage({
    message: "generate_ai",
    content: text,
  });
};

document.addEventListener("input", (event) => {
  const target = event.target;
  var userInput = target.innerText || target.value;

  if (isEndsWithPlusSign(userInput)) {
    const prompt = userInput.slice(0, -3).trim();
    sendTriggerMessage(prompt);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "inject_ai") {
    insert(request.content);
  }
});