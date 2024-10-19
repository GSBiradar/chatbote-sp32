document.getElementById('sendBtn').addEventListener('click', sendMessage);

const groqEndpoint = "https://api.groq.com/openai/v1/chat/completions";
const apiKey = "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";

// Start continuous voice recognition
startContinuousVoiceRecognition();

function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === "") return;
    
    // Display user message
    displayMessage(userInput, 'user-message');
    document.getElementById('userInput').value = "";

    // Send message to AI assistant
    fetchChatGPTResponse(userInput);
}

function displayMessage(text, className) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;  
    messageDiv.textContent = text;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function fetchChatGPTResponse(message) {
    const data = {
        model: "llama3-8b-8192",
        messages: [
            { role: "user", content: message }
        ]
    };

    fetch(groqEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        const reply = data.choices[0].message.content || "Sorry, I couldn't understand that.";
        displayMessage(reply, 'bot-message');
        speakOutLoud(reply);
    })
    .catch(error => {
        console.error("Error:", error);
        displayMessage("Failed to connect to the AI server.", 'bot-message');
    });
}

// Continuous Voice Recognition Function
function startContinuousVoiceRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        
        // Check for the wake word
        if (speechResult.includes("hello")) {
            // Start the conversation after the wake word is detected
            listenForUserInput();
        }
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event);
    };

    // Restart recognition after each result to keep listening
    recognition.onend = function() {
        recognition.start();
    };

    recognition.start();
}

// Function to listen for user input after wake word
function listenForUserInput() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        displayMessage(speechResult, 'user-message');
        fetchChatGPTResponse(speechResult);
    };

    recognition.onerror = function(event) {
        console.error("Speech recognition error:", event);
    };

    recognition.start();
}

// Text-to-Speech Function
function speakOutLoud(message) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}
