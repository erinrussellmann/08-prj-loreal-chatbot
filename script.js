/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Array to keep track of the conversation history
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal. Only answer questions related to L'Oréal's company, products, beauty routines, recommendations, and similar topics. If the question is not about L'Oréal or its products, politely refuse to answer and suggest a topic you can help with.",
  },
];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's question from the input box
  const question = userInput.value;

  // Add the user's question to the conversation history
  messages.push({ role: "user", content: question });

  // Show the user's latest question above a fun loading message
  chatWindow.innerHTML = `
    <div style="margin-bottom: 12px; font-weight: bold;">You: ${question}</div>
    <div>💄✨ Mixing up the perfect beauty advice for you...</div>
  `;

  // Prepare the request to Cloudflare Worker instead of OpenAI
  const url = "https://steep-band-6628.er2682.workers.dev/";
  const headers = {
    "Content-Type": "application/json",
    // No Authorization header needed for Cloudflare Worker
  };
  const body = JSON.stringify({
    model: "gpt-4o", // Use the gpt-4o model
    messages: messages, // Send the full conversation history
  });

  try {
    // Send the request and wait for the response
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    // Parse the response as JSON
    const data = await response.json();

    // Get the assistant's reply from the response
    let reply =
      data.choices && data.choices[0].message.content
        ? data.choices[0].message.content
        : "Sorry, I couldn't get a response from OpenAI.";

    // Add the assistant's reply to the conversation history
    messages.push({ role: "assistant", content: reply });

    // If the reply is a refusal, show a custom message
    if (
      reply.toLowerCase().includes("i'm sorry") ||
      reply.toLowerCase().includes("i can only answer questions about l'oréal")
    ) {
      reply =
        "Sorry, I can only answer questions about L'Oréal's company, products, beauty routines, or recommendations. For example, you can ask about our skincare products or tips for hair care!";
    }

    // Display the user's question above the assistant's reply
    chatWindow.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: bold;">You: ${question}</div>
      <div>${reply}</div>
    `;
  } catch (error) {
    // Show an error message if something goes wrong
    chatWindow.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: bold;">You: ${question}</div>
      <div>⚠️ Error: Could not connect to OpenAI.</div>
    `;
  }

  // Clear the input box for the next question
  userInput.value = "";
});
