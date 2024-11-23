import { getChatCompletion } from './api-call.js'; // Ensure the relative path is correct
import readline from 'readline';

/**
 * Prompts the user to input any statement or list of items they cannot consume.
 * @returns {Promise<string>} - The raw user input as a single string.
 */

function getUserInput() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter your dietary preference or items you cannot consume: ', (answer) => { /** HERE WE HAVE A QUESTION */
            rl.close();
            const userInput = answer.trim();
            if (userInput.length === 0) {
                console.log('No input provided. Exiting the program.');
                process.exit(0);
            }
            console.log('Received user input:', userInput);
            resolve(userInput);
        });
    });
}

/**
 * Constructs a detailed prompt incorporating the user's input.
 * @param {string} userInput - The raw user input.
 * @returns {string} - The constructed prompt for OpenAI.
 */
function constructPrompt(userInput) {
    return `Hello ChatGPT,

You are a licensed nutritionist and the best in your field. Your goal is to help individuals maintain a healthy diet by identifying foods they should avoid based on their dietary preferences, restrictions, or health goals.

Based on the following user input, identify all relevant foods or ingredients that should be avoided to achieve the user's dietary goal. Provide the list in the following format:

Foods_to_avoid = [
    "Item1",
    "Item2",
    "Item3",
    ...
]

**Instructions:**
- Ensure the list is exhaustive, accurate, and considers variations or similar names (e.g., kiwi and Chinese gooseberry).
- Avoid general or vague answers. Each item should be specific and actionable.
- Prioritize safety and thoroughness, as this is crucial for the user's health.

**User Input:**
${userInput}

Please provide only the list in the specified format without additional explanations.`;
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
        console.error("Failed to parse AI response. Please ensure the response is in the correct format.");
        return [];
    }
}

// Main asynchronous function to orchestrate the steps
(async () => {
    try {
       //Prompt user for input 
        const userInput = await getUserInput();

        //make prompt using user input
        const prompt = constructPrompt(userInput);

        //here we send the prompt to openAI
        console.log("Sending prompt to OpenAI...");
        const openAIResponse = await getChatCompletion(prompt);

        if (!openAIResponse) {
            console.error("Failed to retrieve list from OpenAI.");
            process.exit(1);
        }

        console.log('Received response from OpenAI.');

        // parse el api response
        const foodsToAvoid = parseAIResponse(openAIResponse);

        if (foodsToAvoid.length === 0) {
            console.log('No foods to avoid were identified.');
            process.exit(1);
        }

        // Step 5: Output the results
        console.log('\nTo reach your goal, here are some foods you should avoid');
        console.log('----------------------------------');

        console.log('\nYou cannot eat:');
        foodsToAvoid.forEach(item => console.log(`- ${item}`));

    } catch (error) {
        console.error('An unexpected error occurred:', error.message);
    }
})();
