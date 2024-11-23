// api-call.js

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Define the path to your API key file
const apiKeyPath = '/Users/majdkhalife/Desktop/Hackathon/Kiwi/api.txt';

// Check to make sure API was loaded successfully
let apiKey;
try {
    apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
    if (!apiKey) {
        throw new Error("API key is empty");
    }
    console.log("API Key loaded successfully.");
} catch (err) {
    console.error(`Failed to read API key from ${apiKeyPath}:`, err.message);
    process.exit(1); 
}

// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: apiKey,
});

/**
 * Fetches a chat completion from OpenAI based on the provided prompt.
 * @param {string} prompt - The input prompt for the AI.
 * @param {string} model - The OpenAI model to use (default: "gpt-3.5-turbo").
 * @returns {Promise<string|null>} - The AI's response or null if unexpected format.
 */
export async function getChatCompletion(prompt, model = "gpt-4o") {
    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0, // Adjust creativity of response
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
            console.error("Unexpected response format:", response);
            return null;
        }
    } catch (error) {
        // Enhanced error handling
        if (error.response) {
            console.error("OpenAI API Error:", error.response.status, error.response.data);
        } else {
            console.error("Error fetching chat completion:", error.message);
        }
        throw error; // Throw error after logging
    }
}

