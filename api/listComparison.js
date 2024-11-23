// listComparison.js

import { getChatCompletion } from './api-call.js'; // Ensure the relative path is correct
import readline from 'readline';
import fs from 'fs';

/**
 * Prompts the user to input a statement containing both their dietary goal and items to avoid.
 * @returns {Promise<string>} - The raw user input as a single string.
 */
function getUserInput() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('📝 Enter your dietary goal and items you cannot consume: ', (answer) => {
            rl.close();
            const userInput = answer.trim();
            if (userInput.length === 0) {
                console.log('❌ No input provided. Exiting the program.');
                process.exit(0);
            }
            console.log('🔄 Received user input:', userInput);
            resolve(userInput);
        });
    });
}

/**
 * Constructs a detailed prompt incorporating the user's input.
 * @param {string} userInput - The raw user input containing both dietary goal and items to avoid.
 * @returns {string} - The constructed prompt for OpenAI.
 */
function constructPrompt(userInput) {
    return `Hello ChatGPT,

You are a highly experienced and licensed nutritionist specializing in dietary restrictions and helping patients adhere to diets by providing comprehensive lists of foods to avoid. Your mission is to help individuals maintain a healthy diet by identifying foods they should avoid based on their dietary goals and specific allergies or restrictions.

**User Statement:**
"${userInput}"

**Task:**
Based on the above statement, identify all relevant foods or ingredients that should be avoided to achieve the user's dietary goal while considering their specific allergies or restrictions. Provide the list in the following format:

**Response Format Only:**

Foods_to_avoid = [
    "Item1",
    "Item2",
    "Item3",
    ...
]

**Instructions:**
- **Exhaustive List:** Ensure the list is comprehensive and includes all relevant items. This is a matter of life and death.
- **Specificity:** Mention ingredients that are found on product labels.
- **Variations and Similar Names:** Account for variations or similar names (e.g., "keto and low-carb").
- **Hidden Sources:** Consider hidden sources of carbohydrates or other restricted nutrients.
- **Formatting:** Strictly adhere to the specified format for ease of parsing.
- **Safety and Thoroughness:** Prioritize the user's health by being meticulous and thorough.
- **No Explanations:** Do not provide additional explanations or context beyond the list.
`;
}

/**
 * Parses the AI's response to extract the list of foods to avoid.
 * @param {string} text - The raw text response from OpenAI.
 * @returns {string[]} - An array of foods to avoid.
 */
function parseAIResponse(text) {
    // Use a regular expression to extract the list within the square brackets
    const regex = /Foods_to_avoid\s*=\s*\[\s*([\s\S]*?)\s*\]/;
    const match = text.match(regex);
    if (match && match[1]) {
        // Split the items by comma and remove any surrounding quotes and whitespace
        return match[1]
            .split(',')
            .map(item => item.trim().replace(/^["']|["']$/g, ''))
            .filter(item => item.length > 0);
    } else {
        console.error("❌ Failed to parse AI response. Please ensure the response is in the correct format.");
        console.log('📄 Raw AI Response:', text); // Log the raw response for debugging
        return [];
    }
}

// Main asynchronous function to orchestrate the steps
(async () => {
    try {
        // Step 1: Prompt the user to enter their input
        const userInput = await getUserInput();

        // Step 2: Construct the prompt incorporating the user's input
        const prompt = constructPrompt(userInput);

        // Optional: Log the constructed prompt for debugging
        // console.log('\n📄 Constructed Prompt:\n', prompt);

        // Step 3: Send the prompt to OpenAI
        console.log("🔄 Sending prompt to OpenAI...");
        const openAIResponse = await getChatCompletion(prompt);

        if (!openAIResponse) {
            console.error("❌ Failed to retrieve list from OpenAI.");
            process.exit(1);
        }

        console.log('🔄 Received response from OpenAI.');

        // Log the raw AI response for debugging
        console.log('📄 Raw AI Response:', openAIResponse);

        // Step 4: Parse the AI's response to extract the list of foods to avoid
        const foodsToAvoid = parseAIResponse(openAIResponse);

        if (foodsToAvoid.length === 0) {
            console.log('❌ No foods to avoid were identified.');
            process.exit(1);
        }

        // Step 5: Save the generated list to a JSON file for use in final-comp.js
        const output = {
            userInput: userInput,
            foodsToAvoid: foodsToAvoid
        };

        fs.writeFileSync('generatedList.json', JSON.stringify(output, null, 2));
        console.log('✅ Generated list has been saved to generatedList.json');

        // Step 6: Output the results
        console.log('\n🍽️ Your Dietary Recommendations:');
        console.log('----------------------------------');

        console.log('\n❌ You should avoid:');
        foodsToAvoid.forEach(item => console.log(`- ${item}`));

    } catch (error) {
        console.error('❌ An unexpected error occurred:', error.message);
    }
})();
