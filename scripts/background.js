const sendResponseMessage = async (content) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, {
    message: "inject_ai",
    content,
  });
};

const getApiKey = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("apiKey", function (data) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (data.apiKey) {
        const decodedKey = atob(data.apiKey);
        resolve(decodedKey);
      } else {
        resolve(null);
      }
    });
  });
};

const generateContent = async (prompt) => {
  const key = await getApiKey();

  const url = "https://api.openai.com/v1/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.75,
    }),
  });

  const completion = await response.json();

  if (completion.error) {
    throw new Error(completion.error.code);
  }

  return completion.choices[0]["text"];
};

const generateAiResponse = async ({ command, text }) => {
  sendResponseMessage("🤖 is generating...");

  try {
    var prompt = "";
    switch (command) {
      case "tweet":
        prompt = `Write me a tweet about ${text}`;
        break;
      case "blog":
        prompt = `Write me a blog post about ${text}`;
        break;
      case "japanese":
        prompt = `Translate the below text to Japanese: ${text}`;
        break;
      case "javascript":
        prompt = `Write a Javascript code that ${text}. I do not want any explainations, notes or text reply other than code blocks at all. Please reponse in the format of code blocks only.`;
        break;
      default:
        prompt = text;
    }

    const response = await generateContent(prompt);
    const result = response.replace(/^\n\n/, "");

    console.log("Generated content: ", result);
    sendResponseMessage(result);
  } catch (error) {
    console.log(error);
  }
};

const getPrompt = (str) => {
  const index = str.indexOf(":");
  const command = str.slice(0, index);
  const text = str.slice(index + 1);

  return { command, text };
};

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.message === "generate_ai") {
    const prompt = getPrompt(request.content);
    generateAiResponse(prompt);
  }
});
