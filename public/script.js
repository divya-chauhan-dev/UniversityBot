// DOM elements
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");

// State management
let isLoading = false;

// Send message function
async function sendMessage() {
  const message = userInput.value.trim();
  
  // Validate input
  if (!message || isLoading) return;
  
  // Set loading state
  setLoadingState(true);
  
  // Add user message to chat
  addMessage(message, 'user');
  
  // Clear input
  userInput.value = "";
  
  try {
    // Send request to server
    const response = await fetch("/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Add bot response to chat
    if (data.reply) {
      addMessage(data.reply, 'bot');
    } else if (data.error) {
      addMessage(`Sorry, ${data.error}`, 'bot');
    }
    
  } catch (error) {
    console.error("Error:", error);
    addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
  } finally {
    // Reset loading state
    setLoadingState(false);
  }
}

// Add message to chat box
function addMessage(content, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const label = type === 'user' ? 'You' : 'Bot';
  messageDiv.innerHTML = `<strong>${label}:</strong> ${formatMessage(content)}`;
  
  chatBox.appendChild(messageDiv);
  scrollToBottom();
}

// Format message content
function formatMessage(content) {
  // Convert line breaks to HTML breaks
  return content.replace(/\n/g, '<br>');
}

// Set loading state
function setLoadingState(loading) {
  isLoading = loading;
  sendBtn.disabled = loading;
  sendBtn.textContent = loading ? 'Sending...' : 'Send';
  userInput.disabled = loading;
}

// Scroll chat to bottom
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listeners
userInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// Focus input on page load
document.addEventListener('DOMContentLoaded', function() {
  userInput.focus();
});

// Handle paste events
userInput.addEventListener('paste', function(event) {
  setTimeout(() => {
    if (userInput.value.length > 500) {
      userInput.value = userInput.value.substring(0, 500);
      addMessage("Message truncated to 500 characters.", 'bot');
    }
  }, 0);
});