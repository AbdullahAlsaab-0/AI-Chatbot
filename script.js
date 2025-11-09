// basic chat selectors
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "#####"; // put key ya abdulmalik
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const initialInputHeight = messageInput ? messageInput.scrollHeight : 0;

// domain filter: saudi tourism only
const ALLOWED_KEYWORDS = [
  "saudi", "saudi arabia", "ksa", "tourism", "visit saudi", "saudi visa", "saudi e-visa",
  "riyadh", "jeddah", "al ula", "al-ula", "alula", "diriyah", "abha", "taif", "al baha",
  "dammam", "al khobar", "khobar", "red sea",
  "neom", "the line", "qiddiya", "red sea project",
  "hegra", "madain saleh", "mada'in saleh", "edge of the world",
  "riyadh season", "jeddah season"
];

const ALLOWED_PATTERNS = [
  /\b(saudi arabia|ksa|kingdom of saudi arabia)\b/i,
  /\b(riyadh|jeddah|al[- ]?ula|diriyah|abha|taif|al[- ]?baha|dammam|al khobar|khobar)\b/i,
  /\b(neom|qiddiya|red sea project|the line)\b/i,
  /\b(hegra|madain saleh|mada'in saleh|edge of the world)\b/i,
  /\b(riyadh season|jeddah season)\b/i,
  /\b(saudi (e-)?visa|visit saudi)\b/i
];

const OUT_OF_SCOPE_MESSAGE = "أجاوب فقط عن السياحة في السعودية: المدن، الفعاليات، موسم الرياض، جدة، العلا، المشاريع السياحية، والتأشيرة.";

const SYSTEM_RULES = `You are an assistant that ONLY answers questions about tourism in Saudi Arabia. If the user asks about anything else, reply in Arabic with: "${OUT_OF_SCOPE_MESSAGE}" and do not add other info.`;

// check if user text is allowed
const isAllowed = (text) => {
  const lower = text.toLowerCase();
  if (ALLOWED_KEYWORDS.some((k) => lower.includes(k))) return true;
  if (ALLOWED_PATTERNS.some((rx) => rx.test(text))) return true;
  return false;
};

// create message element
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// call gemini and show response
const generateBotResponse = async (incomingMessageDiv, userText) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  const requestBody = {
    system_instruction: {
      role: "system",
      parts: [{ text: SYSTEM_RULES }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }]
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Request failed");

    const apiResponseText = (data.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();

    messageElement.textContent = apiResponseText || "(No response)";
  } catch (error) {
    console.error(error);
    messageElement.textContent = error.message || "Something went wrong";
    messageElement.style.color = "#ff0000";
  } finally {
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
};

// handle user message
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  messageInput.value = "";
  messageInput.dispatchEvent(new Event("input"));

  const userMsgHTML = `<div class="message-text"></div>`;
  const outgoingMessageDiv = createMessageElement(userMsgHTML, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = text;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  const botMsgHTML = `
    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
      <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
    </svg>
    <div class="message-text">
      <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;
  const incomingMessageDiv = createMessageElement(botMsgHTML, "bot-message", "thinking");
  chatBody.appendChild(incomingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  if (!isAllowed(text)) {
    const msg = incomingMessageDiv.querySelector(".message-text");
    msg.textContent = OUT_OF_SCOPE_MESSAGE;
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    return;
  }

  generateBotResponse(incomingMessageDiv, text);
};

// send on enter
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

// auto resize
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  const chatForm = document.querySelector(".chat-form");
  if (chatForm) {
    chatForm.style.borderRadius =
      messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
  }
});

// send button
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

// open/close chatbot
if (chatbotToggler) {
  chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
  });
}

if (closeChatbot) {
  closeChatbot.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
  });
}
