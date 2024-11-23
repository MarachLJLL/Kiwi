// api-call.js

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Define the path to your API key file
const apiKeyPath = '/Users/majdkhalife/Desktop/Hackathon/Kiwi/api.txt';

// Read the API key from the file
let apiKey;
try {
    apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
    if (!apiKey) {
        throw new Error("API key is empty");
    }
    console.log("🔑 API Key loaded successfully.");
} catch (err) {
    console.error(`❌ Failed to read API key from ${apiKeyPath}:`, err.message);
    process.exit(1); // Exit the process with an error code
}

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: apiKey,
});

// Function to get chat completion
async function getChatCompletion(prompt, model = "gpt-3.5-turbo") {
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0, // Adjust the creativity of the response
        });

        // Check if the response contains choices
        if (
            response &&
            response.choices &&
            response.choices.length > 0 &&
            response.choices[0].message &&
            response.choices[0].message.content
        ) {
            return response.choices[0].message.content;
        } else {
            console.error("❌ Unexpected response format:", response);
            return null;
        }
    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            console.error("❌ OpenAI API Error:", error.response.status, error.response.data);
        } else {
            console.error("❌ Error fetching chat completion:", error.message);
        }
        throw error; // Re-throw the error after logging
    }
}

// Example usage
(async () => {
    const prompt = "Hello, how are you?"; // Provide a valid prompt here

    try {
        console.log("🔄 Sending prompt to OpenAI...");
        const response = await getChatCompletion(prompt);
        if (response) {
            console.log("💬 Response from OpenAI:", response);
        } else {
            console.log("❌ No response received from OpenAI.");
        }
    } catch (error) {
        console.error("❌ Failed to get chat completion.");
    }
})();
